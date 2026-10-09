import { supabase } from "@/integrations/supabase/client";

export interface Vendor {
  id: string;
  name: string;
  logo_url: string | null;
  is_featured: boolean;
  display_order: number;
  location: string | null;
  operating_hours: string | null;
  support_phone: string | null;
  dropoff_zones: string[];
}

export interface MenuAddon {
  title: string;
  price: number;
}

/** Raw menu row as needed by the admin manager (includes vendor + add-ons). */
export interface AdminMenuItem {
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
  is_available: boolean;
  description: string;
  addons: MenuAddon[];
  delivery_fee: number;
  day_badge: string | null;
}

export async function fetchVendors(): Promise<Vendor[]> {
  const { data, error } = await supabase
    .from("vendors")
    .select("id, name, logo_url, is_featured, display_order, location, operating_hours, support_phone, dropoff_zones")
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Vendor[];
}

export async function fetchVendor(id: string): Promise<Vendor | null> {
  const { data, error } = await supabase
    .from("vendors")
    .select("id, name, logo_url, is_featured, display_order, location, operating_hours, support_phone, dropoff_zones")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Vendor | null;
}

function parseAddons(value: unknown): MenuAddon[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((a): a is Record<string, unknown> => typeof a === "object" && a !== null)
    .map((a) => ({ title: String(a.title ?? ""), price: Number(a.price ?? 0) }))
    .filter((a) => a.title.length > 0);
}

export async function fetchAdminMenuItems(): Promise<AdminMenuItem[]> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    price: row.price,
    vendor_name: row.vendor_name,
    vendor_id: row.vendor_id,
    rating: Number(row.rating),
    image_url: row.image_url,
    category: row.category,
    prep_time: row.prep_time,
    is_popular: row.is_popular,
    is_available: row.is_available,
    description: row.description,
    addons: parseAddons(row.addons),
    delivery_fee: Number(row.delivery_fee ?? 1000),
    day_badge: (row as { day_badge?: string | null }).day_badge ?? null,
  }));
}

/** Short human-friendly order reference, e.g. #MF-8821. */
export function orderRef(id: string): string {
  const digits = id.replace(/\D/g, "").slice(-4).padStart(4, "0");
  return `#MF-${digits}`;
}
