import { supabase } from "@/integrations/supabase/client";

export type OrderReview = {
  id: string;
  order_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
};

/** Reviews written by the signed-in student, keyed by order id. */
export async function fetchMyReviews(userId: string): Promise<Record<string, OrderReview>> {
  const { data, error } = await supabase
    .from("order_reviews")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  const map: Record<string, OrderReview> = {};
  for (const row of (data ?? []) as OrderReview[]) map[row.order_id] = row;
  return map;
}

export async function submitReview(input: {
  orderId: string;
  userId: string;
  rating: number;
  comment: string;
}): Promise<void> {
  const { error } = await supabase.from("order_reviews").upsert(
    {
      order_id: input.orderId,
      user_id: input.userId,
      rating: input.rating,
      comment: input.comment,
    },
    { onConflict: "order_id" },
  );
  if (error) throw error;
}

export type AdminReview = OrderReview & {
  customer_name: string;
  total_tsh: number;
  order_created_at: string;
};

/** Admin view: every testimonial joined with its order details. */
export async function fetchAllReviews(): Promise<AdminReview[]> {
  const { data, error } = await supabase
    .from("order_reviews")
    .select("*, food_orders(customer_name, total_tsh, created_at)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => {
    const order = (row as unknown as {
      food_orders: { customer_name: string; total_tsh: number; created_at: string } | null;
    }).food_orders;
    return {
      id: row.id,
      order_id: row.order_id,
      user_id: row.user_id,
      rating: row.rating,
      comment: row.comment,
      created_at: row.created_at,
      customer_name: order?.customer_name || "Student",
      total_tsh: order?.total_tsh ?? 0,
      order_created_at: order?.created_at ?? row.created_at,
    };
  });
}
