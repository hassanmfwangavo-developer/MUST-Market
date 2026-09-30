import { supabase } from "@/integrations/supabase/client";

export type OrderItem = {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  vendorName?: string;
  addSoda?: boolean;
  deliveryFee?: number;
};

export type FoodOrder = {
  id: string;
  user_id: string;
  items: OrderItem[];
  total_tsh: number;
  status: string;
  delivery_area: string;
  room: string;
  phone: string;
  eta_minutes: number;
  created_at: string;
  customer_name?: string;
  batch_slot?: string | null;
  hostel_zone?: string | null;
  drop_point?: string | null;
};

export const ACTIVE_STATUSES = ["pending", "preparing", "on_the_way"] as const;

/** Customer-facing wording — no live "preparing" / tracking language. */
export const STATUS_LABEL: Record<string, string> = {
  pending: "Succeeded",
  preparing: "Succeeded",
  on_the_way: "Succeeded",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export type SavedLocation = {
  id: string;
  label: string;
  area: string;
  room: string;
  is_default: boolean;
};

export async function fetchOrders(userId: string): Promise<FoodOrder[]> {
  const { data, error } = await supabase
    .from("food_orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...row,
    items: (Array.isArray(row.items) ? row.items : []) as unknown as OrderItem[],
  })) as FoodOrder[];
}

export async function fetchLocations(userId: string): Promise<SavedLocation[]> {
  const { data, error } = await supabase
    .from("user_locations")
    .select("id, label, area, room, is_default")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as SavedLocation[];
}

export async function createOrder(input: {
  userId: string;
  items: OrderItem[];
  total: number;
  area: string;
  room: string;
  phone: string;
  customerName: string;
  paymentReference?: string;
  batchSlot: "lunch" | "dinner";
  hostelZone: "boys_6" | "girls_8" | "new_hostels";
  dropPoint: string;
}): Promise<string | null> {
  const { data, error } = await supabase
    .from("food_orders")
    .insert({
      user_id: input.userId,
      items: input.items as unknown as never,
      total_tsh: input.total,
      delivery_area: input.area,
      room: input.room,
      phone: input.phone,
      customer_name: input.customerName,
      payment_status: "pending",
      payment_reference: input.paymentReference ?? null,
      batch_slot: input.batchSlot,
      hostel_zone: input.hostelZone,
      drop_point: input.dropPoint,
      status: "delivered",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data?.id ?? null;
}

export async function fetchOrderById(
  orderId: string,
): Promise<FoodOrder | null> {
  const { data, error } = await supabase
    .from("food_orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    ...data,
    items: (Array.isArray(data.items) ? data.items : []) as unknown as OrderItem[],
  } as FoodOrder;
}
