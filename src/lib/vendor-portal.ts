import { supabase } from "@/integrations/supabase/client";

export type PortalRole = "admin" | "vendor" | "none";

export interface PortalAccess {
  role: PortalRole;
  /** Restaurant the signed-in vendor operates (null for admins / unassigned). */
  vendorId: string | null;
  userId: string | null;
}

/** Resolve the signed-in user's portal role and restaurant assignment. */
export async function fetchPortalAccess(): Promise<PortalAccess> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user || user.is_anonymous) return { role: "none", vendorId: null, userId: null };

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const list = (roles ?? []).map((r) => String(r.role));
  const role: PortalRole = list.includes("admin")
    ? "admin"
    : list.includes("vendor")
      ? "vendor"
      : "none";

  let vendorId: string | null = null;
  if (role === "vendor" || role === "admin") {
    const { data: member } = await supabase
      .from("vendor_members")
      .select("vendor_id")
      .eq("user_id", user.id)
      .maybeSingle();
    vendorId = member?.vendor_id ?? null;
  }

  return { role, vendorId, userId: user.id };
}

export interface VendorOrderItem {
  name: string;
  quantity: number;
}

export interface VendorOrder {
  id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  delivery_area: string;
  room: string;
  total_tsh: number;
  payment_status: string;
  status: string;
  vendor_id: string | null;
  items: VendorOrderItem[];
}

function mapItems(value: unknown): VendorOrderItem[] {
  if (!Array.isArray(value)) return [];
  return (value as Record<string, unknown>[]).map((i) => ({
    name: String(i?.name ?? "Item"),
    quantity: Number(i?.quantity ?? 1),
  }));
}

/** Orders scoped to one restaurant, or every restaurant when vendorId is null (admins only). */
export async function fetchVendorOrders(vendorId: string | null): Promise<VendorOrder[]> {
  let query = supabase
    .from("food_orders")
    .select(
      "id, created_at, customer_name, phone, delivery_area, room, total_tsh, payment_status, status, vendor_id, items",
    )
    .order("created_at", { ascending: false });
  if (vendorId) query = query.eq("vendor_id", vendorId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    created_at: row.created_at,
    customer_name: row.customer_name ?? "",
    phone: row.phone ?? "",
    delivery_area: row.delivery_area ?? "",
    room: row.room ?? "",
    total_tsh: row.total_tsh ?? 0,
    payment_status: row.payment_status ?? "pending",
    status: row.status ?? "pending",
    vendor_id: row.vendor_id ?? null,
    items: mapItems(row.items),
  }));
}

export interface VendorPreOrder {
  id: string;
  created_at: string;
  item_name: string;
  customer_name: string;
  phone_number: string;
  delivery_location: string;
  message: string;
  status: string;
  scheduled_for: string | null;
  vendor_id: string | null;
}

export async function fetchVendorPreOrders(vendorId: string | null): Promise<VendorPreOrder[]> {
  let query = supabase
    .from("msosi_pre_orders")
    .select(
      "id, created_at, item_name, customer_name, phone_number, delivery_location, message, status, scheduled_for, vendor_id",
    )
    .order("created_at", { ascending: false });
  if (vendorId) query = query.eq("vendor_id", vendorId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as VendorPreOrder[];
}

export interface VendorMenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
  vendor_id: string | null;
  vendor_name: string;
}

export async function fetchVendorMenu(vendorId: string | null): Promise<VendorMenuItem[]> {
  let query = supabase
    .from("menu_items")
    .select("id, name, price, category, image_url, is_available, vendor_id, vendor_name")
    .order("name", { ascending: true });
  if (vendorId) query = query.eq("vendor_id", vendorId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    ...row,
    is_available: row.is_available !== false,
    vendor_name: row.vendor_name ?? "",
  })) as VendorMenuItem[];
}

export async function setMenuAvailability(id: string, next: boolean): Promise<void> {
  const { error } = await supabase.from("menu_items").update({ is_available: next }).eq("id", id);
  if (error) throw new Error(error.message);
}

export const ORDER_STATUSES = [
  "pending",
  "preparing",
  "delivering",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  preparing: "Preparing",
  delivering: "Delivering",
  on_the_way: "Delivering",
  completed: "Completed",
  delivered: "Completed",
  cancelled: "Cancelled",
};

/** Colour-coded badge classes: yellow pending, blue preparing, green done, red cancelled. */
export function statusBadgeClass(status: string): string {
  switch (status) {
    case "completed":
    case "delivered":
      return "bg-emerald-100 text-emerald-700";
    case "preparing":
      return "bg-blue-100 text-blue-700";
    case "delivering":
    case "on_the_way":
      return "bg-indigo-100 text-indigo-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

export function paymentBadgeClass(status: string): string {
  if (status === "success") return "bg-emerald-100 text-emerald-700";
  if (status === "failed") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const { error } = await supabase
    .from("food_orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

const COMPLETED = new Set(["completed", "delivered"]);
const ACTIVE = new Set(["pending", "preparing", "delivering", "on_the_way"]);

export function summarise(orders: VendorOrder[]) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    lifetime: orders.length,
    completedToday: orders.filter(
      (o) => COMPLETED.has(o.status) && o.created_at.slice(0, 10) === today,
    ).length,
    revenue: orders
      .filter((o) => o.payment_status === "success" || COMPLETED.has(o.status))
      .reduce((sum, o) => sum + o.total_tsh, 0),
    active: orders.filter((o) => ACTIVE.has(o.status)).length,
  };
}

/** Group pre-orders by their scheduled slot (falls back to the booking day). */
export function groupPreOrders(preOrders: VendorPreOrder[]): [string, VendorPreOrder[]][] {
  const map = new Map<string, VendorPreOrder[]>();
  for (const p of preOrders) {
    const key =
      p.scheduled_for?.trim() ||
      new Date(p.created_at).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "short",
      });
    const list = map.get(key) ?? [];
    list.push(p);
    map.set(key, list);
  }
  return [...map.entries()];
}
