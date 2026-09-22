import { supabase } from "@/integrations/supabase/client";

export type UserVoucher = {
  id: string;
  voucher_code: string;
  discount_type: string;
  is_used: boolean;
  created_at: string;
};

export const VOUCHER_LABEL: Record<string, string> = {
  free_soda: "1x Free Soda Voucher 🥤",
};

export function voucherLabel(type: string): string {
  return VOUCHER_LABEL[type] ?? "Reward voucher 🎁";
}

/** All vouchers for a user, newest first (RLS scopes this to the owner). */
export async function fetchVouchers(userId: string): Promise<UserVoucher[]> {
  const { data, error } = await supabase
    .from("user_vouchers")
    .select("id, voucher_code, discount_type, is_used, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as UserVoucher[];
}

/** The oldest unused voucher of a given type, or null. */
export async function fetchActiveVoucher(
  userId: string,
  discountType = "free_soda",
): Promise<UserVoucher | null> {
  const { data } = await supabase
    .from("user_vouchers")
    .select("id, voucher_code, discount_type, is_used, created_at")
    .eq("user_id", userId)
    .eq("discount_type", discountType)
    .eq("is_used", false)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (data as UserVoucher | null) ?? null;
}

/** Marks a voucher used. Returns false when it was already redeemed. */
export async function redeemVoucher(
  voucherId: string,
  orderId?: string | null,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_vouchers")
    .update({
      is_used: true,
      used_at: new Date().toISOString(),
      order_id: orderId ?? null,
    })
    .eq("id", voucherId)
    .eq("is_used", false)
    .select("id");
  if (error) return false;
  return (data ?? []).length > 0;
}
