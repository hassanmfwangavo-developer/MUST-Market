import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  orderCount: 1001,
  failTable: "",
  ranges: [] as { table: string; start: number; end: number }[],
}));

vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    from(table: string) {
      const result = (start = 0, end = 499) => {
        if (state.failTable === table) return { data: null, error: new Error("Read failed") };
        if (table === "vendors") return { data: [{ id: "mgoni", name: "Mgoni Restaurant" }], error: null };
        if (table !== "food_orders") return { data: [], error: null };
        const length = Math.max(0, Math.min(end + 1, state.orderCount) - start);
        return { data: Array.from({ length }, (_, i) => ({
          id: String(start + i), created_at: "2026-11-27T12:00:00Z", payment_status: "success",
          payment_reference: `sp_${start + i}`, total_tsh: 3000, vendor_id: "mgoni", items: [], customer_name: "Test", status: "delivered",
        })), error: null };
      };
      const query = {
        select: () => query, eq: () => query, like: () => query,
        gte: () => query, lt: () => query, order: () => query,
        range: async (start: number, end: number) => {
          state.ranges.push({ table, start, end });
          return result(start, end);
        },
        then: (resolve: (value: ReturnType<typeof result>) => unknown) => Promise.resolve(result()).then(resolve),
      };
      return query;
    },
  },
}));

import { loadDailySalesReport } from "./sales-report.server";

describe("daily report complete database reads", () => {
  beforeEach(() => { state.ranges.length = 0; state.orderCount = 1001; state.failTable = ""; });
  it("includes orders beyond the backend 1000-row limit", async () => {
    const report = await loadDailySalesReport("2026-11-27");
    expect(report.paid.count).toBe(1001);
    expect(report.paid.gross).toBe(3003000);
    expect(report.paid.commission).toBe(500500);
    expect(report.paid.restaurant).toBe(2502500);
    expect(state.ranges.filter((r) => r.table === "food_orders")).toEqual([
      { table: "food_orders", start: 0, end: 499 },
      { table: "food_orders", start: 500, end: 999 },
      { table: "food_orders", start: 1000, end: 1499 },
    ]);
  });
  it("does not send a misleading zero when a preorder read fails", async () => {
    state.failTable = "batch_preorders";
    await expect(loadDailySalesReport("2026-11-27")).rejects.toThrow("Read failed");
  });
});