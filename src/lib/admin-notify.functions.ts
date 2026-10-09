import { createServerFn } from "@tanstack/react-start";

/**
 * Admin email alerts (pre-orders, new listings, reviews) via Brevo.
 * The client only passes the record id; the server loads the record itself
 * and only notifies for records created in the last 15 minutes, so the
 * endpoint cannot be abused to send arbitrary content.
 */
const ADMIN_EMAIL = "hassani@mustmarket.store";
const MAX_AGE_MS = 15 * 60 * 1000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Kind = "pre_order" | "product" | "review" | "batch_preorder";

function esc(v: unknown): string {
  return String(v ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isRecent(createdAt: string | null | undefined) {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < MAX_AGE_MS;
}

async function sendAdminEmail(subject: string, rows: [string, unknown][]) {
  const apiKey = process.env["BREVO_API_KEY"];
  if (!apiKey) {
    console.warn("[AdminNotify] BREVO_API_KEY missing — skipping email.");
    return;
  }
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#ffffff">
      <h2 style="margin:0 0 16px;color:#008542">${esc(subject)}</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:bold;width:35%">${esc(k)}</td><td style="padding:8px 12px;border:1px solid #e2e8f0;white-space:pre-wrap">${esc(v)}</td></tr>`,
          )
          .join("")}
      </table>
      <p style="margin-top:16px;font-size:12px;color:#64748b">Automated notification from MUST Market · ${new Date().toISOString()}</p>
    </div>`;
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { accept: "application/json", "api-key": apiKey, "content-type": "application/json" },
    body: JSON.stringify({
      sender: { name: "MUST Market Alerts", email: ADMIN_EMAIL },
      to: [{ email: ADMIN_EMAIL }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) console.error(`[AdminNotify] Brevo failed [${res.status}]: ${await res.text()}`);
}

export const notifyAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { kind: Kind; id: string }) => {
    if (!["pre_order", "product", "review", "batch_preorder"].includes(data?.kind)) throw new Error("Invalid kind");
    if (typeof data?.id !== "string" || !UUID_RE.test(data.id)) throw new Error("Invalid id");
    return { kind: data.kind, id: data.id };
  })
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      if (data.kind === "batch_preorder") {
        const { data: bp } = await supabaseAdmin
          .from("batch_preorders").select("*").eq("id", data.id).maybeSingle();
        if (!bp || !isRecent(bp.created_at)) {
          console.warn("[AdminNotify] batch pre-order not found or too old:", data.id);
          return { ok: false };
        }
        const { BATCH_SLOTS, HOSTEL_ZONES } = await import("./order-batches");
        const items = (bp.items as { mealId?: string; name?: string; quantity?: number }[]) ?? [];
        // Re-price from the admin's meal list so the email never trusts client prices.
        const ids = items.map((i) => i.mealId).filter((v): v is string => !!v && UUID_RE.test(v));
        const { data: meals } = await supabaseAdmin
          .from("preorder_meals").select("id, name, price_tsh").in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
        // Restaurant (vendor page) pre-orders reference menu_items instead.
        const { data: menuMeals } = await supabaseAdmin
          .from("menu_items").select("id, name, price").in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
        let vendorName = "—";
        if (bp.vendor_id) {
          const { data: v } = await supabaseAdmin.from("vendors").select("name").eq("id", bp.vendor_id).maybeSingle();
          if (v) vendorName = v.name;
        }
        let total = 0;
        const lines = items.map((i) => {
          const m = meals?.find((x) => x.id === i.mealId);
          const q = Math.max(1, Math.min(20, Number(i.quantity) || 1));
          const mm = menuMeals?.find((x) => x.id === i.mealId);
          const price = m?.price_tsh ?? mm?.price ?? 0;
          total += price * q;
          return `${m?.name ?? mm?.name ?? i.name} × ${q} — TZS ${price * q}`;
        });
        const slot = BATCH_SLOTS.find((b) => b.value === bp.batch_slot);
        const zone = HOSTEL_ZONES.find((z) => z.value === bp.hostel_zone);
        await sendAdminEmail(`📅 [NEW BATCH PRE-ORDER] ${slot?.title ?? bp.batch_slot} - TZS ${total}`, [
          ["Restaurant", vendorName],
          ["Customer", bp.customer_name],
          ["Phone", bp.phone],
          ["Meals", lines.join("\n")],
          ["Batch", slot ? `${slot.title} (Delivery ${slot.deliveryAt})` : bp.batch_slot],
          ["Hostel Zone", zone ? `${zone.title} — Drop Point: ${zone.dropPoint}` : bp.hostel_zone],
          ["Room / Landmark", bp.room],
          ["Total Amount (pay on delivery)", `TZS ${total}`],
          ["Order ID", bp.id],
          ["Submitted", bp.created_at],
        ]);
      } else if (data.kind === "pre_order") {
        const { data: po } = await supabaseAdmin
          .from("msosi_pre_orders").select("*").eq("id", data.id).maybeSingle();
        if (!po || !isRecent(po.created_at)) return { ok: false };
        let vendor = "—";
        let price: number | null = null;
        if (po.item_id) {
          const { data: item } = await supabaseAdmin
            .from("menu_items").select("price, vendor_name").eq("id", po.item_id).maybeSingle();
          if (item) { vendor = item.vendor_name; price = item.price; }
        }
        if (po.vendor_id) {
          const { data: v } = await supabaseAdmin
            .from("vendors").select("name").eq("id", po.vendor_id).maybeSingle();
          if (v) vendor = v.name;
        }
        await sendAdminEmail("📅 [NEW PRE-ORDER BOOKING] MUST Market", [
          ["Customer", `${po.customer_name} (${po.phone_number})`],
          ["Meal", po.item_name],
          ["Cafeteria / Vendor", vendor],
          ["Scheduled Date & Time", po.scheduled_for ?? po.message],
          ["Delivery Location", po.delivery_location],
          ["Total Amount", price != null ? `TZS ${price}` : "—"],
          ["Notes", po.message],
        ]);
      } else if (data.kind === "product") {
        const { data: p } = await supabaseAdmin
          .from("products").select("*, categories(name)").eq("id", data.id).maybeSingle();
        if (!p || !isRecent(p.created_at)) return { ok: false };
        const { data: seller } = await supabaseAdmin
          .from("profiles").select("full_name, email").eq("id", p.seller_id).maybeSingle();
        const cat = (p as unknown as { categories: { name: string } | null }).categories;
        await sendAdminEmail(`📦 [NEW ITEM LISTED] ${p.title}`, [
          ["Seller", `${seller?.full_name || seller?.email || "Student"} (${p.whatsapp_number})`],
          ["Item Title", p.title],
          ["Price", `TZS ${p.price_tsh}`],
          ["Category", cat?.name ?? "—"],
          ["Condition", p.condition],
          ["Location / Hostel", p.location],
          ["Description", p.description],
        ]);
      } else {
        const { data: r } = await supabaseAdmin
          .from("order_reviews").select("*").eq("id", data.id).maybeSingle();
        if (!r || !isRecent(r.created_at)) return { ok: false };
        const { data: order } = await supabaseAdmin
          .from("food_orders").select("customer_name, phone").eq("id", r.order_id).maybeSingle();
        await sendAdminEmail(`⭐ [NEW REVIEW SUBMITTED] ${r.rating} Stars`, [
          ["Reviewer", `${order?.customer_name || "Student"} (${order?.phone ?? "—"})`],
          ["Rating", `${"★".repeat(r.rating)}${"☆".repeat(Math.max(0, 5 - r.rating))} (${r.rating}/5)`],
          ["Order ID", r.order_id],
          ["Comment", r.comment || "—"],
        ]);
      }
      return { ok: true };
    } catch (err) {
      console.error("[AdminNotify] error:", err);
      return { ok: false };
    }
  });

/** Fire-and-forget helper for client code. Never throws. */
export function notifyAdminInBackground(kind: Kind, id: string) {
  void notifyAdmin({ data: { kind, id } }).catch(() => {});
}
