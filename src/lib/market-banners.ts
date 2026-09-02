import { supabase } from "@/integrations/supabase/client";

export interface MarketBanner {
  id: string;
  image_url: string;
  image_path: string | null;
  display_order: number;
  is_active: boolean;
}

/** The marketplace hero slideshow renders at most three images. */
export const MAX_MARKET_BANNERS = 3;

export async function fetchMarketBanners(): Promise<MarketBanner[]> {
  const { data, error } = await supabase
    .from("market_banners")
    .select("id,image_url,image_path,display_order,is_active")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as MarketBanner[];
}
