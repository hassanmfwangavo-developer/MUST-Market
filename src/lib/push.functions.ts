import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const managePushDevice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ token: z.string().min(20).max(4096), action: z.enum(["enable", "disable", "test"]) }))
  .handler(async ({ data, context }) => {
    const { data: admin, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (error || !admin) throw new Error("Administrator access required");
    if (data.action === "disable") {
      const { error: e } = await context.supabase.from("admin_push_devices").delete().eq("token", data.token).eq("user_id", context.userId);
      if (e) throw e;
      return { ok: true };
    }
    if (data.action === "enable") {
      const { error: e } = await context.supabase.from("admin_push_devices").upsert({ token: data.token, user_id: context.userId, updated_at: new Date().toISOString() }, { onConflict: "token" });
      if (e) throw e;
      return { ok: true };
    }
    const { data: device, error: deviceError } = await context.supabase.from("admin_push_devices").select("id").eq("token", data.token).eq("user_id", context.userId).maybeSingle();
    if (deviceError || !device) throw new Error("Enable notifications on this phone first");
    const apiKey = process.env["LOVABLE_API_KEY"];
    const connectionKey = process.env["FIREBASE_MESSAGING_API_KEY"];
    if (!apiKey || !connectionKey) throw new Error("Push is not configured");
    const res = await fetch("https://connector-gateway.lovable.dev/firebase_messaging/v1/projects/_/messages:send", {
      method: "POST", signal: AbortSignal.timeout(6000),
      headers: { Authorization: `Bearer ${apiKey}`, "X-Connection-Api-Key": connectionKey, "Content-Type": "application/json" },
      body: JSON.stringify({ message: { token: data.token, data: { title: "MUST Market", body: "Arifa za oda ziko tayari kwenye simu hii.", path: "/admin", eventKey: `test:${crypto.randomUUID()}` }, webpush: { headers: { Urgency: "high" } } } }),
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`Push provider [${res.status}]: ${body.replaceAll(data.token, "[device]")}`);
    return { ok: true };
  });