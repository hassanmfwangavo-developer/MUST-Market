import { describe, expect, it } from "vitest";
import { eatDay, summarise, type VendorOrder } from "./vendor-portal";

const order = (o: Partial<VendorOrder>): VendorOrder => ({
  id: "x", created_at: "2026-11-02T08:00:00Z", customer_name: "", phone: "", delivery_area: "",
  room: "", total_tsh: 1000, payment_status: "success", status: "delivered", vendor_id: null,
  items: [], batch_slot: null, hostel_zone: null, drop_point: null, ...o,
});

describe("vendor stats", () => {
  it("counts only paid orders in revenue", () => {
    const s = summarise([order({ total_tsh: 3000 }), order({ payment_status: "pending", total_tsh: 5000 })]);
    expect(s.revenue).toBe(3000);
    expect(s.lifetime).toBe(1);
  });

  it("resets today's orders at midnight Tanzania time", () => {
    const now = new Date("2026-11-02T22:00:00Z"); // 01:00 on 3 Nov in EAT
    const s = summarise([order({ created_at: "2026-11-02T20:30:00Z" }), order({ created_at: "2026-11-02T21:30:00Z" })], now);
    expect(s.completedToday).toBe(1);
    expect(eatDay("2026-11-02T21:00:00Z")).toBe("2026-11-03");
  });
});
