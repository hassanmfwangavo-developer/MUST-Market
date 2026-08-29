import { supabase } from "@/integrations/supabase/client";
import type { Banner } from "@/lib/admin-media";

/** Active promo banners, newest first. */
export async function fetchActiveBanners(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from("banners")
    .select(
      "id,title,subtitle,promo_code,discount_percent,image_url,banner_type,countdown_ends_at,is_active,created_at",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Banner[];
}

export interface ClaimedOffer {
  bannerId: string;
  promoCode: string | null;
  discountPercent: number;
  title: string;
}

const STORAGE_KEY = "msosi.claimed_offer";

/** Locally persisted claimed offer (cart state) used to discount the checkout total. */
export function getClaimedOffer(): ClaimedOffer | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ClaimedOffer) : null;
  } catch {
    return null;
  }
}

export function clearClaimedOffer() {
  if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
}

/**
 * Saves the claimed promotion to local cart state and, for signed-in users,
 * to `user_claimed_offers` so the discount follows the account.
 */
export async function claimOffer(banner: Banner): Promise<ClaimedOffer> {
  const claimed: ClaimedOffer = {
    bannerId: banner.id,
    promoCode: banner.promo_code,
    discountPercent: banner.discount_percent ?? 0,
    title: banner.title,
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(claimed));
  }

  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (user && !user.is_anonymous) {
      await supabase.from("user_claimed_offers").insert({
        user_id: user.id,
        banner_id: banner.id,
        promo_code: banner.promo_code,
        discount_percent: banner.discount_percent ?? 0,
      });
    }
  } catch {
    // Offer still applies locally even if the write fails.
  }

  return claimed;
}
