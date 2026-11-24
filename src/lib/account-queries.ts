import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchPortalAccess } from "./vendor-portal";
import { fetchVouchers, fetchActiveVoucher } from "./vouchers";

export function portalAccessOptions(userId: string | null) {
  return queryOptions({ queryKey: ["portal-access", userId], queryFn: fetchPortalAccess, staleTime: 60_000 });
}

export function profileOptions(userId: string) {
  return queryOptions({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles")
        .select("full_name, avatar_url, whatsapp_number, hostel, current_streak, reward_points, referral_code, referral_count")
        .eq("id", userId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function vouchersOptions(userId: string) {
  return queryOptions({ queryKey: ["vouchers", userId], queryFn: () => fetchVouchers(userId) });
}

export function activeVoucherOptions(userId: string) {
  return queryOptions({ queryKey: ["active-voucher", userId], queryFn: () => fetchActiveVoucher(userId) });
}