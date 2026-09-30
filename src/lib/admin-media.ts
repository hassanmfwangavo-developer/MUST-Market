import { supabase } from "@/integrations/supabase/client";
import { requireAdminUser } from "@/lib/admin";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/**
 * Uploads an admin asset (banner artwork, category icon) to storage and
 * returns a long-lived signed URL that can be rendered anywhere in the app.
 */
export interface UploadedAdminImage {
  url: string;
  path: string;
}

export async function uploadAdminImage(
  file: File,
  folder: "banners" | "books-banners" | "category-icons" | "food-items" | "vendor-logos" | "services" | "preorder-meals",
): Promise<UploadedAdminImage> {
  const user = await requireAdminUser();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${user.id}/${folder}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

  const { data, error } = await supabase.storage
    .from("product-images")
    .createSignedUrl(path, TEN_YEARS);
  if (error || !data?.signedUrl) {
    await supabase.storage.from("product-images").remove([path]);
    throw new Error(`Image upload failed: ${error?.message ?? "Could not create its display URL."}`);
  }
  return { url: data.signedUrl, path };
}

export async function removeAdminImage(path: string) {
  const { error } = await supabase.storage.from("product-images").remove([path]);
  if (error) console.error("Could not clean up admin image", error);
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  promo_code: string | null;
  discount_percent: number | null;
  image_url: string | null;
  banner_type: string;
  countdown_ends_at: string | null;
  is_active: boolean;
  created_at: string;
  /** Dish this promo is tied to; the discount applies only to this item. */
  menu_item_id?: string | null;
}

export const BANNER_TYPES = [
  { value: "advertising", label: "📢 Advertising / Tangazo (Clean Image – No Overlay)" },
  { value: "discount", label: "🏷️ Discount Offer" },
  { value: "flash_sale", label: "⚡ Flash Sale (with Countdown)" },
  { value: "first_order", label: "🎁 First Order Discount" },
  { value: "ijumaa_booking", label: "🕌 Ijumaa Booking" },
  { value: "jpili_booking", label: "🍛 Jumapili Booking" },
] as const;

export const bannerTypeLabel = (value: string) =>
  BANNER_TYPES.find((t) => t.value === value)?.label ?? value;

export async function fetchBanners(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from("banners")
    .select(
      "id,title,subtitle,promo_code,discount_percent,image_url,banner_type,countdown_ends_at,is_active,created_at,menu_item_id",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Banner[];
}

export interface FoodCategory {
  id: string;
  name: string;
  icon_url: string | null;
  display_order: number;
  is_active: boolean;
}

/** The frontend food rail only ever renders five icon cards. */
export const MAX_ACTIVE_CATEGORIES = 5;

export async function fetchFoodCategories(): Promise<FoodCategory[]> {
  const { data, error } = await supabase
    .from("food_categories")
    .select("id,name,icon_url,display_order,is_active")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as FoodCategory[];
}
