import { supabase } from "@/integrations/supabase/client";
import { notifyAdminInBackground } from "./admin-notify.functions";

export interface PreOrder {
  id: string;
  item_id: string | null;
  item_name: string;
  customer_name: string;
  phone_number: string;
  delivery_location: string;
  message: string;
  scheduled_for?: string | null;
  status: string;
  created_at: string;
}

export interface PreOrderInput {
  itemId: string | null;
  itemName: string;
  customerName: string;
  phoneNumber: string;
  deliveryLocation: string;
  message: string;
  scheduledFor?: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Save a day-specific booking request for a Msosi Fasta dish. */
export async function createPreOrder(input: PreOrderInput): Promise<void> {
  if (!input.customerName.trim()) throw new Error("Tafadhali weka jina lako kamili.");
  if (!input.phoneNumber.trim()) throw new Error("Tafadhali weka namba ya simu.");
  if (!input.deliveryLocation.trim()) throw new Error("Tafadhali weka eneo la delivery.");
  if (!input.message.trim()) throw new Error("Tafadhali andika ujumbe wa booking.");

  const id = crypto.randomUUID();
  const { error } = await supabase.from("msosi_pre_orders").insert({
    id,
    item_id: input.itemId && UUID_RE.test(input.itemId) ? input.itemId : null,
    item_name: input.itemName,
    customer_name: input.customerName.trim(),
    phone_number: input.phoneNumber.trim(),
    delivery_location: input.deliveryLocation.trim(),
    message: input.message.trim(),
    scheduled_for: input.scheduledFor?.trim() || null,
  });
  if (error) throw new Error(error.message);
  notifyAdminInBackground("pre_order", id);
}

/** Admin listing of every booking request, newest first. */
export async function fetchPreOrders(): Promise<PreOrder[]> {
  const { data, error } = await supabase
    .from("msosi_pre_orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as PreOrder[];
}
