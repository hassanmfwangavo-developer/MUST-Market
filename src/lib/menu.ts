import { supabase } from "@/integrations/supabase/client";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  vendor_name: string;
  vendor_id: string | null;
  rating: number;
  image_url: string | null;
  category: string;
  prep_time: string;
  is_popular: boolean;
  description: string;
  delivery_fee: number;
  day_badge?: string | null;
  is_available: boolean;
}

export const SODA_PRICE = 1000;
export const DEFAULT_DELIVERY_FEE = 1000;

export function formatTsh(n: number, prefix: "TZS" | "TSh" = "TZS") {
  return `${prefix} ${n.toLocaleString("en-US")}`;
}

function normalize(row: Record<string, unknown>): MenuItem {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    price: Number(row.price ?? 0),
    vendor_name: String(row.vendor_name ?? ""),
    vendor_id: (row.vendor_id as string) ?? null,
    rating: Number(row.rating ?? 4.5),
    image_url: (row.image_url as string) ?? null,
    category: String(row.category ?? "All"),
    prep_time: String(row.prep_time ?? "15-20 min"),
    is_popular: Boolean(row.is_popular),
    description: String(row.description ?? ""),
    delivery_fee: Number(row.delivery_fee ?? DEFAULT_DELIVERY_FEE),
    is_available: row.is_available === false ? false : true,
    day_badge: (row.day_badge as string) ?? null,
  };
}

export async function fetchVendorMenuItems(vendorId: string): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("category")
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => normalize(row as Record<string, unknown>));
}

/** Fetch the live menu without substituting legacy sample dishes. */
export async function fetchMenuItems(): Promise<MenuItem[]> {
  try {
    const { data, error } = await (supabase as any)
      .from("menu_items")
      .select("*")
      .order("is_popular", { ascending: false })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) return [];
    return (data as Record<string, unknown>[]).map(normalize);
  } catch {
    return [];
  }
}

export async function fetchMenuItem(id: string): Promise<MenuItem | null> {
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!isUuid) return null;

  try {
    const { data, error } = await (supabase as any)
      .from("menu_items")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return normalize(data as Record<string, unknown>);
  } catch {
    return null;
  }
}
