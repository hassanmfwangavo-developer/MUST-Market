import { supabase } from "@/integrations/supabase/client";
import type { Banner } from "@/lib/admin-media";

/** Active promo banners, newest first. */
export async function fetchActiveBanners(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from("banners")
    .select(
      "id,title,subtitle,promo_code,discount_percent,image_url,banner_type,countdown_ends_at,is_active,created_at,menu_item_id",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Banner[];
}

export interface PendingOffer {
  bannerId: string;
  menuItemId: string;
  promoCode: string | null;
  discountPercent: number;
  title: string;
}

/**
 * The claimed offer lives ONLY in memory for the current page session.
 * It is never written to localStorage, sessionStorage, cookies or the user's
 * profile — a refresh or a normal (non-banner) visit always pays full price.
 */
let pendingOffer: PendingOffer | null = null;

export function setPendingOffer(offer: PendingOffer) {
  pendingOffer = offer;
}

export function clearPendingOffer() {
  pendingOffer = null;
}

/** Returns the offer only when it was claimed for this exact dish. */
export function getPendingOffer(menuItemId: string): PendingOffer | null {
  if (!pendingOffer) return null;
  return pendingOffer.menuItemId === menuItemId ? pendingOffer : null;
}

/** Claims a banner offer in memory. Returns null when the banner has no dish/discount. */
export function claimOffer(banner: Banner): PendingOffer | null {
  const percent = banner.discount_percent ?? 0;
  if (!banner.menu_item_id || percent <= 0) {
    clearPendingOffer();
    return null;
  }
  const offer: PendingOffer = {
    bannerId: banner.id,
    menuItemId: banner.menu_item_id,
    promoCode: banner.promo_code,
    discountPercent: percent,
    title: banner.title,
  };
  setPendingOffer(offer);
  return offer;
}
