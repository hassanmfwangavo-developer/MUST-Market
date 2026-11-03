export type OrderPushKind = "paid_order" | "batch_preorder" | "pre_order";

export function orderPushPayload(kind: OrderPushKind, record: {
  id: string; created_at: string; payment_status?: string; customer_name?: string;
}, now = Date.now()) {
  const age = now - Date.parse(record.created_at);
  if (!Number.isFinite(age) || age < 0 || age > 15 * 60 * 1000) return null;
  if (kind === "paid_order" && record.payment_status !== "success") return null;
  return {
    title: kind === "paid_order" ? "Msosi Fasta: oda imelipwa" : "Msosi Fasta: pre-order mpya",
    body: `${record.customer_name || "Mteja"} ameweka ${kind === "paid_order" ? "oda iliyolipwa" : "pre-order"}. Fungua kuona maelezo.`,
    path: kind === "paid_order" ? "/vendor/dashboard" : kind === "batch_preorder" ? "/admin/preorders" : "/admin/food?tab=preorders",
    eventKey: `${kind}:${record.id}`,
  };
}