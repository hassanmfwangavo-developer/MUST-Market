import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { eatDate, reportWindow } from "@/lib/sales-report";

const inputSchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), dryRun: z.boolean().default(false) }).strict();

export const Route = createFileRoute("/api/public/daily-sales-report")({
  server: { handlers: { POST: async ({ request }) => {
    const { authenticateCronRequest } = await import("@/integrations/supabase/cron-auth");
    const denial = await authenticateCronRequest(request);
    if (denial) return denial;
    const parsed = inputSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
    const now = new Date();
    const date = parsed.data.date ?? eatDate(now);
    let window;
    try { window = reportWindow(date); } catch { return Response.json({ error: "Invalid date" }, { status: 400 }); }
    if (Date.parse(window.end) > now.getTime()) return Response.json({ error: "Report cutoff has not passed" }, { status: 409 });
    try {
      const { loadDailySalesReport, deliverDailySalesReport } = await import("@/lib/sales-report.server");
      if (parsed.data.dryRun) {
        await loadDailySalesReport(date);
        return Response.json({ status: "validated", date }, { headers: { "Cache-Control": "no-store" } });
      }
      const result = await deliverDailySalesReport(date);
      return Response.json(result, { headers: { "Cache-Control": "no-store" } });
    } catch {
      // No customer data, financial details or provider responses in public responses.
      return Response.json({ error: "Report failed; review delivery records before retrying" }, { status: 500 });
    }
  } } },
});