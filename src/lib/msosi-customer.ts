import { supabase } from "@/integrations/supabase/client";

const KEY = "msosi_customer_v1";

export type MsosiCustomer = { name: string; phone: string; room?: string; area?: string };

export function loadMsosiCustomer(): MsosiCustomer | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    const v = raw ? (JSON.parse(raw) as MsosiCustomer) : null;
    return v?.phone ? v : null;
  } catch {
    return null;
  }
}

export function saveMsosiCustomer(c: MsosiCustomer) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    /* ignore */
  }
}

export function clearMsosiCustomer() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export type PhoneOrder = {
  id: string;
  kind: "paid" | "preorder";
  items: { name?: string; quantity?: number; addSoda?: boolean }[];
  total_tsh: number;
  status: string;
  created_at: string;
  summary: string | null;
};

export async function fetchOrdersByPhone(phone: string): Promise<PhoneOrder[]> {
  const { data, error } = await supabase.rpc("msosi_orders_by_phone", { _phone: phone });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    ...r,
    items: Array.isArray(r.items) ? r.items : [],
  })) as PhoneOrder[];
}

export async function submitPhoneReview(phone: string, orderId: string, rating: number, comment: string) {
  const { error } = await supabase.rpc("msosi_submit_review", {
    _phone: phone, _order_id: orderId, _rating: rating, _comment: comment,
  });
  if (error) throw error;
}
