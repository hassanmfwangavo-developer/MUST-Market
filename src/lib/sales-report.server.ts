import { z } from "zod";
import { buildDailySalesReport, reportWindow, type ReportOrder, type ReportPreorder } from "./sales-report";
import { renderSalesReportEmail } from "./sales-report-email";

const rowOrder = z.object({ id: z.string(), created_at: z.string(), payment_status: z.string().nullable(), payment_reference: z.string().nullable(), total_tsh: z.number().int(), vendor_id: z.string().nullable(), items: z.unknown(), customer_name: z.string().nullable(), status: z.string() });
const rowPreorder = z.object({ id: z.string(), created_at: z.string(), status: z.string(), customer_name: z.string(), vendor_id: z.string().nullable() });

export async function loadDailySalesReport(date: string) {
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  const window = reportWindow(date);
  // Page every result set; never silently truncate a busy day's accounting.
  async function readOrders(): Promise<ReportOrder[]> {
    const rows: ReportOrder[] = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await db.from("food_orders")
        .select("id,created_at,payment_status,payment_reference,total_tsh,vendor_id,items,customer_name,status")
        .eq("payment_status", "success").like("payment_reference", "sp_%")
        .gte("created_at", window.previousLateStart).lt("created_at", window.end)
        .order("created_at").order("id").range(offset, offset + 499);
      if (error) throw error;
      const page = z.array(rowOrder).parse(data);
      rows.push(...page.map((row) => ({ ...row, items: row.items ?? [] })));
      if (page.length < 500) return rows;
    }
  }
  async function readPreorders(table: "batch_preorders" | "msosi_pre_orders"): Promise<ReportPreorder[]> {
    const rows: ReportPreorder[] = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await db.from(table).select("id,created_at,status,customer_name,vendor_id")
        .gte("created_at", window.previousLateStart).lt("created_at", window.end)
        .order("created_at").order("id").range(offset, offset + 499);
      if (error) throw error;
      const page = z.array(rowPreorder).parse(data);
      rows.push(...page);
      if (page.length < 500) return rows;
    }
  }
  const [orders, batch, direct, vendorResult] = await Promise.all([
    readOrders(), readPreorders("batch_preorders"), readPreorders("msosi_pre_orders"),
    db.from("vendors").select("id,name"),
  ]);
  if (vendorResult.error) throw vendorResult.error;
  const vendors = z.array(z.object({ id: z.string(), name: z.string() })).parse(vendorResult.data);
  return buildDailySalesReport({ window, orders, batch, direct, vendors });
}

export async function deliverDailySalesReport(date: string) {
  const apiKey = process.env["BREVO_API_KEY"];
  if (!apiKey) throw new Error("Report email is not configured");
  const report = await loadDailySalesReport(date);
  const email = renderSalesReportEmail(report);
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  const key = `daily-sales:${date}:2358`;
  const { error: claimError } = await db.from("daily_sales_report_deliveries").insert({ report_key: key, report_date: date, cutoff_at: report.window.end });
  if (claimError?.code === "23505") {
    const { data, error } = await db.from("daily_sales_report_deliveries").select("status").eq("report_key", key).single();
    if (error) throw error;
    if (data.status !== "accepted") throw new Error("Report delivery needs manual review; automatic resend blocked");
    return { status: "already_accepted" as const, date };
  }
  if (claimError) throw claimError;
  try {
    // Reuse the existing direct Brevo credential; it is not connector-managed.
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST", signal: AbortSignal.timeout(20_000),
      headers: { "api-key": apiKey, "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({ sender: { name: "MUST Market Reports", email: "hassani@mustmarket.store" }, to: [{ email: "hassani@mustmarket.store" }], subject: email.subject, htmlContent: email.html, textContent: email.text }),
    });
    const body = await response.text();
    if (!response.ok) {
      const safeBody = body.replaceAll(apiKey, "[redacted]");
      console.error(`[DailySalesReport] Email failed [${response.status}]: ${safeBody}`);
      throw new Error(`Email provider failed [${response.status}]: ${safeBody}`);
    }
    const result = z.object({ messageId: z.string() }).parse(JSON.parse(body));
    const { error } = await db.from("daily_sales_report_deliveries").update({ status: "accepted", provider_message_id: result.messageId, accepted_at: new Date().toISOString() }).eq("report_key", key);
    if (error) throw error;
    return { status: "accepted" as const, date };
  } catch (error) {
    // Includes ambiguous network failures: do not risk duplicate financial emails.
    const { error: logError } = await db.from("daily_sales_report_deliveries").update({ status: "failed" }).eq("report_key", key);
    if (logError) console.error("[DailySalesReport] Could not record delivery failure");
    throw error;
  }
}