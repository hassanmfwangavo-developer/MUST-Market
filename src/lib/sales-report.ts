export const ORDER_COMMISSION_TSH = 500;
export const REPORT_TIME_ZONE = "Africa/Dar_es_Salaam";

export type ReportOrder = {
  id: string; created_at: string; payment_status: string | null;
  payment_reference: string | null; total_tsh: number; vendor_id: string | null;
  items: unknown; customer_name: string | null; status: string;
};
export type ReportPreorder = {
  id: string; created_at: string; status: string;
  customer_name: string; vendor_id: string | null;
};
export type ReportWindow = ReturnType<typeof reportWindow>;

export function eatDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: REPORT_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const value = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function reportWindow(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid report date");
  const midnight = new Date(`${date}T00:00:00+03:00`);
  if (!Number.isFinite(midnight.getTime()) || eatDate(midnight) !== date) throw new Error("Invalid report date");
  const start = midnight.toISOString();
  const end = new Date(midnight.getTime() + (23 * 60 + 58) * 60_000).toISOString();
  const previousLateStart = new Date(midnight.getTime() - 2 * 60_000).toISOString();
  const previousDate = eatDate(new Date(midnight.getTime() - 86_400_000));
  return { date, start, end, previousDate, previousLateStart };
}

function inPeriod(created: string, start: string, end: string) {
  const time = Date.parse(created);
  if (!Number.isFinite(time)) throw new Error("Invalid stored order date");
  return time >= Date.parse(start) && time < Date.parse(end);
}

function itemVendorNames(items: unknown): string[] {
  if (!Array.isArray(items)) return [];
  const names = items.map((item: unknown) => {
    if (!item || typeof item !== "object" || !("vendorName" in item)) return "";
    return typeof item.vendorName === "string" ? item.vendorName.trim() : "";
  });
  // One unnamed item makes a multi-item vendor allocation uncertain.
  if (names.some((name) => !name)) return [];
  return [...new Set(names)];
}

export function summarizePaidOrders(orders: ReportOrder[], vendors: { id: string; name: string }[]) {
  const paid = orders.filter((o) => o.payment_status === "success" && o.payment_reference?.startsWith("sp_"));
  const seen = new Set<string>();
  const groups = new Map<string, { vendor: string; count: number; gross: number; commission: number; restaurant: number; needsReview: boolean }>();
  const warnings: string[] = [];
  let gross = 0;
  for (const order of paid) {
    const reference = order.payment_reference;
    if (!reference || seen.has(reference)) throw new Error("Duplicate payment reference: verify before reporting");
    seen.add(reference);
    if (!Number.isSafeInteger(order.total_tsh) || order.total_tsh < ORDER_COMMISSION_TSH) {
      throw new Error("Invalid paid amount: verify before reporting");
    }
    gross += order.total_tsh;
    if (!Number.isSafeInteger(gross)) throw new Error("Total exceeds safe integer range");
    const names = itemVendorNames(order.items);
    const registeredVendor = vendors.find((v) => v.id === order.vendor_id);
    const name = registeredVendor?.name ?? (names.length === 1 ? names[0] : undefined);
    const needsReview = !name || names.length > 1;
    const key = needsReview ? "unallocated" : registeredVendor?.id ?? `name:${name}`;
    const group = groups.get(key) ?? {
      vendor: needsReview ? "Mgawanyo unahitaji uhakiki" : name ?? "—",
      count: 0, gross: 0, commission: 0, restaurant: 0, needsReview,
    };
    group.count += 1;
    group.gross += order.total_tsh;
    group.commission += ORDER_COMMISSION_TSH;
    group.restaurant += order.total_tsh - ORDER_COMMISSION_TSH;
    groups.set(key, group);
    if (/cancel|refund/i.test(order.status)) warnings.push(`Oda ${order.id}: hali ${order.status}; hakiki refund kabla ya kulipa mgahawa.`);
  }
  const commission = paid.length * ORDER_COMMISSION_TSH;
  const restaurant = gross - commission;
  if (gross !== commission + restaurant) throw new Error("Accounting totals do not reconcile");
  if ([...groups.values()].some((g) => g.needsReview)) warnings.push("Baadhi ya oda hazina mgahawa mmoja wa uhakika; usitume mgao huo bila uhakiki.");
  return { count: paid.length, gross, commission, restaurant, groups: [...groups.values()], warnings, orders: paid };
}

export function summarizePreorders(batch: ReportPreorder[], direct: ReportPreorder[]) {
  const statuses = new Map<string, number>();
  for (const order of [...batch, ...direct]) statuses.set(order.status, (statuses.get(order.status) ?? 0) + 1);
  return { count: batch.length + direct.length, batch: batch.length, direct: direct.length, statuses: [...statuses].map(([status, count]) => ({ status, count })) };
}

export function buildDailySalesReport(input: {
  window: ReportWindow; orders: ReportOrder[]; batch: ReportPreorder[];
  direct: ReportPreorder[]; vendors: { id: string; name: string }[];
}) {
  const { window: w, orders, batch, direct, vendors } = input;
  const main = (r: { created_at: string }) => inPeriod(r.created_at, w.start, w.end);
  const late = (r: { created_at: string }) => inPeriod(r.created_at, w.previousLateStart, w.start);
  // Validate duplicate references across both periods, not just within each section.
  summarizePaidOrders(orders.filter((o) => main(o) || late(o)), vendors);
  return {
    window: w,
    paid: summarizePaidOrders(orders.filter(main), vendors),
    preorders: summarizePreorders(batch.filter(main), direct.filter(main)),
    latePaid: summarizePaidOrders(orders.filter(late), vendors),
    latePreorders: summarizePreorders(batch.filter(late), direct.filter(late)),
  };
}

export type DailySalesReport = ReturnType<typeof buildDailySalesReport>;