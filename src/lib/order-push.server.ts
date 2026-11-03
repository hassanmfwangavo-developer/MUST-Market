import { orderPushPayload, type OrderPushKind } from "./order-push-payload";

// Call only inside a server handler after the triggering order is persisted.
export async function sendOrderPush(kind: OrderPushKind, id: string) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["FIREBASE_MESSAGING_API_KEY"];
  if (!apiKey || !connectionKey) throw new Error("Push notifications are not configured");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const table = kind === "paid_order" ? "food_orders" : kind === "batch_preorder" ? "batch_preorders" : "msosi_pre_orders";
  const { data: record, error } = await supabaseAdmin.from(table).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!record) return;
  const payload = orderPushPayload(kind, record);
  if (!payload) return;
  const { data: devices, error: deviceError } = await supabaseAdmin.from("admin_push_devices").select("id, token, user_id");
  if (deviceError) throw deviceError;
  await Promise.all((devices ?? []).map(async (device) => {
    // Recheck role so a demoted admin cannot continue receiving order notifications.
    const { data: admin, error: roleError } = await supabaseAdmin.rpc("has_role", { _user_id: device.user_id, _role: "admin" });
    if (roleError) throw roleError;
    if (!admin) return;
    const { error: claimError } = await supabaseAdmin.from("admin_order_push_log").insert({ event_key: payload.eventKey, device_id: device.id });
    if (claimError?.code === "23505") return;
    if (claimError) throw claimError;
    try {
      const response = await fetch("https://connector-gateway.lovable.dev/firebase_messaging/v1/projects/_/messages:send", {
        method: "POST", signal: AbortSignal.timeout(6000),
        headers: { Authorization: `Bearer ${apiKey}`, "X-Connection-Api-Key": connectionKey, "Content-Type": "application/json" },
        body: JSON.stringify({ message: { token: device.token, data: { title: payload.title, body: payload.body, path: payload.path, eventKey: payload.eventKey }, webpush: { headers: { Urgency: "high", TTL: "3600" } } } }),
      });
      const body = await response.text();
      if (!response.ok) {
        // Do not log device registration tokens, which can occur in provider errors.
        const safeBody = body.replaceAll(device.token, "[device]");
        const { error: logError } = await supabaseAdmin.from("admin_order_push_log").update({ status: "failed", error_message: `HTTP ${response.status}: ${safeBody}` }).eq("event_key", payload.eventKey).eq("device_id", device.id);
        if (logError) throw logError;
        if (body.includes("UNREGISTERED")) {
          const { error: deleteError } = await supabaseAdmin.from("admin_push_devices").delete().eq("id", device.id);
          if (deleteError) throw deleteError;
        }
        throw new Error(`Push provider failed [${response.status}]: ${safeBody}`);
      }
      const { error: logError } = await supabaseAdmin.from("admin_order_push_log").update({ status: "accepted" }).eq("event_key", payload.eventKey).eq("device_id", device.id);
      if (logError) throw logError;
    } catch (err) {
      console.error("[OrderPush] Notification failed", err);
      const { error: updateError } = await supabaseAdmin.from("admin_order_push_log").update({ status: "failed", error_message: String(err).replaceAll(device.token, "[device]") }).eq("event_key", payload.eventKey).eq("device_id", device.id);
      if (updateError) console.error("[OrderPush] Could not store failure", updateError.message);
    }
  }));
}