import { describe, expect, it } from "vitest";
import { orderPushPayload } from "./order-push-payload";
const now = Date.parse("2026-11-03T03:15:00Z");
const record = { id: "order-1", created_at: "2026-11-03T03:14:00Z", customer_name: "Student" };
describe("admin order push eligibility", () => {
  it("notifies for paid live orders only", () => {
    expect(orderPushPayload("paid_order", { ...record, payment_status: "success" }, now)?.eventKey).toBe("paid_order:order-1");
    expect(orderPushPayload("paid_order", { ...record, payment_status: "pending" }, now)).toBeNull();
  });
  it("notifies for hostel pre-orders without payment", () => {
    expect(orderPushPayload("batch_preorder", record, now)?.path).toBe("/admin/preorders");
  });
  it("notifies for meal bookings without payment", () => {
    expect(orderPushPayload("pre_order", record, now)?.path).toBe("/admin/food?tab=preorders");
  });
  it("does not resend old orders through the public alert trigger", () => {
    expect(orderPushPayload("batch_preorder", { ...record, created_at: "2026-11-02T03:14:00Z" }, now)).toBeNull();
  });
});