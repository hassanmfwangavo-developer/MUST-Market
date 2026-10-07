import { supabase } from "@/integrations/supabase/client";
import { notifyAdmin } from "./admin-notify.functions";
import type { BatchSlot, HostelZone } from "./order-batches";

export interface PreorderMeal {
  id: string;
  name: string;
  description: string;
  price_tsh: number;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface BatchPreorder {
  id: string;
  items: { mealId: string; name: string; price: number; quantity: number }[];
  total_tsh: number;
  batch_slot: string;
  hostel_zone: string;
  customer_name: string;
  phone: string;
  room: string;
  status: string;
  created_at: string;
}

export const PREORDER_MEALS_KEY = ["preorder-meals"] as const;

/** Meals the admin has set up for the Pre-Order System (active only for the public). */
export async function fetchPreorderMeals(): Promise<PreorderMeal[]> {
  const { data, error } = await supabase
    .from("preorder_meals")
    .select("*")
    .order("sort_order")
    .order("created_at");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchBatchPreorders(): Promise<BatchPreorder[]> {
  const { data, error } = await supabase
    .from("batch_preorders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as BatchPreorder[];
}

export async function submitBatchPreorder(input: {
  items: BatchPreorder["items"];
  total: number;
  batchSlot: BatchSlot;
  hostelZone: HostelZone;
  customerName: string;
  phone: string;
  room: string;
  vendorId?: string | null;
}): Promise<string> {
  const id = crypto.randomUUID();
  const { error } = await supabase.from("batch_preorders").insert({
    id,
    items: input.items as unknown as never,
    total_tsh: input.total,
    batch_slot: input.batchSlot,
    hostel_zone: input.hostelZone,
    customer_name: input.customerName.trim(),
    phone: input.phone.trim(),
    room: input.room.trim(),
    vendor_id: input.vendorId ?? null,
  });
  if (error) throw new Error(error.message);
  // Wait for the admin alert (max 8s) so it isn't dropped if the visitor closes the page.
  await Promise.race([
    notifyAdmin({ data: { kind: "batch_preorder", id } }).catch((e) => console.error("[PreOrder] alert failed", e)),
    new Promise((r) => setTimeout(r, 8000)),
  ]);
  return id;
}
