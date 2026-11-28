import { describe, expect, it } from "vitest";
import { buildDailySalesReport, eatDate, reportWindow, summarizePaidOrders, summarizePreorders, type ReportOrder } from "./sales-report";

const vendor = { id: "mgoni", name: "Mgoni Restaurant" };
function order(overrides: Partial<ReportOrder> = {}): ReportOrder {
  return { id: "one", created_at: "2026-11-27T12:00:00Z", payment_status: "success", payment_reference: "sp_one", total_tsh: 3000, vendor_id: "mgoni", items: [{ quantity: 3, vendorName: vendor.name }], customer_name: "Test", status: "delivered", ...overrides };
}

describe("daily financial report rules", () => {
  it("takes exactly TSh 500 per order, not per item or plate", () => {
    const report = summarizePaidOrders([order()], [vendor]);
    expect(report.commission).toBe(500);
    expect(report.restaurant).toBe(2500);
    expect(report.gross).toBe(3000);
  });
  it("matches the verified 30-order TSh 111500 period", () => {
    const orders = Array.from({ length: 30 }, (_, i) => order({ id: String(i), payment_reference: `sp_${i}`, total_tsh: i === 29 ? 10000 : 3500 }));
    const result = summarizePaidOrders(orders, [vendor]);
    expect(result.count).toBe(30);
    expect(result.gross).toBe(111500);
    expect(result.commission).toBe(15000);
    expect(result.restaurant).toBe(96500);
  });
  it("includes only successful direct Sonic Pesa payments", () => {
    const result = summarizePaidOrders([order(), order({ payment_status: "pending" }), order({ payment_reference: null }), order({ payment_reference: "cash_1" })], [vendor]);
    expect(result.count).toBe(1);
    expect(result.gross).toBe(3000);
  });
  it("counts both pre-order flows without adding collected money", () => {
    const p = { id: "p", created_at: "2026-11-27T12:00:00Z", status: "pending", customer_name: "Test", vendor_id: "mgoni" };
    const result = buildDailySalesReport({ window: reportWindow("2026-11-27"), orders: [], batch: [p], direct: [p, p], vendors: [vendor] });
    expect(result.preorders).toMatchObject({ count: 3, batch: 1, direct: 2 });
    expect(result.paid.gross).toBe(0);
    expect(result.paid.commission).toBe(0);
  });
  it("cuts off at 23:58 EAT and carries only yesterday's final two minutes separately", () => {
    const w = reportWindow("2026-11-27");
    expect(w.start).toBe("2026-11-26T21:00:00.000Z");
    expect(w.end).toBe("2026-11-27T20:58:00.000Z");
    const result = buildDailySalesReport({ window: w, orders: [
      order({ id: "old", payment_reference: "sp_old", created_at: "2026-11-26T20:57:59Z" }),
      order({ id: "late", payment_reference: "sp_late", created_at: "2026-11-26T20:58:00Z" }),
      order({ id: "start", payment_reference: "sp_start", created_at: w.start }),
      order({ id: "last", payment_reference: "sp_last", created_at: "2026-11-27T20:57:59Z" }),
      order({ id: "next", payment_reference: "sp_next", created_at: w.end }),
    ], batch: [], direct: [], vendors: [vendor] });
    expect(result.paid.count).toBe(2);
    expect(result.paid.gross).toBe(6000);
    expect(result.latePaid.count).toBe(1);
    expect(result.latePaid.gross).toBe(3000);
  });
  it("does not lose or double count late orders across consecutive reports", () => {
    const late = order({ created_at: "2026-11-27T20:59:59Z" });
    const build = (date: string) => buildDailySalesReport({ window: reportWindow(date), orders: [late], batch: [], direct: [], vendors: [vendor] });
    expect(build("2026-11-27").paid.count).toBe(0);
    expect(build("2026-11-28").latePaid.count).toBe(1);
    expect(build("2026-11-29").latePaid.count).toBe(0);
  });
  it("fails closed on duplicate payment references", () => {
    expect(() => summarizePaidOrders([order(), order({ id: "duplicate" })], [vendor])).toThrow("Duplicate");
  });
  it("fails closed on invalid amounts", () => {
    expect(() => summarizePaidOrders([order({ total_tsh: 499 })], [vendor])).toThrow("Invalid paid amount");
  });
  it("never silently assigns an unknown or mixed-vendor order to Mgoni", () => {
    const result = summarizePaidOrders([order({ vendor_id: null, items: [{ vendorName: "Mgoni Restaurant" }, { vendorName: "Other" }] })], [vendor]);
    expect(result.groups[0]?.needsReview).toBe(true);
    expect(result.warnings.length).toBe(1);
  });
  it("keeps restaurant allocations separate", () => {
    const result = summarizePaidOrders([order(), order({ id: "two", payment_reference: "sp_two", vendor_id: "other", items: [], total_tsh: 4500 })], [vendor, { id: "other", name: "Other" }]);
    expect(result.groups.map((g) => g.restaurant)).toEqual([2500, 4000]);
    expect(result.gross).toBe(result.commission + result.restaurant);
  });
  it("retains cancelled pre-order counts with their status, not paid revenue", () => {
    const result = summarizePreorders([{ id: "p", created_at: "2026-11-27T12:00:00Z", customer_name: "Test", status: "cancelled", vendor_id: null }], []);
    expect(result.count).toBe(1);
    expect(result.statuses).toEqual([{ status: "cancelled", count: 1 }]);
  });
  it("uses the Tanzania day even around UTC midnight", () => {
    expect(eatDate(new Date("2026-11-27T21:01:00Z"))).toBe("2026-11-28");
    expect(() => reportWindow("2026-02-30")).toThrow("Invalid report date");
  });
});