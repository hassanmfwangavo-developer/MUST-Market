import { supabase } from "@/integrations/supabase/client";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  vendor_name: string;
  rating: number;
  image_url: string | null;
  category: string;
  prep_time: string;
  is_popular: boolean;
  description: string;
  delivery_fee: number;
}

/** Realistic fallback dataset so the feed renders instantly. */
export const FALLBACK_MENU: MenuItem[] = [
  {
    id: "chips-kuku",
    name: "Chips Kuku",
    price: 7500,
    vendor_name: "Mama Lishe, MUST Cafeteria",
    rating: 4.8,
    image_url:
      "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80",
    category: "Chips & Fast Food",
    prep_time: "15-20 min",
    is_popular: true,
    description:
      "Golden crispy fries served with spiced grilled chicken and fresh kachumbari salad.",
    delivery_fee: 1000,
  },
  {
    id: "chicken-biryani",
    name: "Chicken Biryani",
    price: 4500,
    vendor_name: "Swahili Kitchen — Ikuti",
    rating: 4.9,
    image_url:
      "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&q=80",
    category: "Rice & Biryani",
    prep_time: "20-25 min",
    is_popular: true,
    description:
      "Chicken biryani cooked with coastal spices, fragrant rice and a side salad.",
    delivery_fee: 1000,
  },
  {
    id: "wali-nyama-maharage",
    name: "Rice with Beef / Beans",
    price: 3500,
    vendor_name: "Cafeteria Block E",
    rating: 4.6,
    image_url:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
    category: "Swahili Dishes",
    prep_time: "10-15 min",
    is_popular: false,
    description:
      "Steamed white rice with beef or beans, rich gravy and leafy greens.",
    delivery_fee: 1000,
  },
  {
    id: "chips-mayai-extra",
    name: "Chips Mayai Extra",
    price: 3000,
    vendor_name: "Joji Fast Food",
    rating: 4.7,
    image_url:
      "https://images.unsplash.com/photo-1584947898604-1b11606d5022?w=600&q=80",
    category: "Chips & Fast Food",
    prep_time: "10-15 min",
    is_popular: false,
    description:
      "Special chips omelette made with three eggs, kachumbari and homemade chilli.",
    delivery_fee: 1000,
  },
];

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
    rating: Number(row.rating ?? 4.5),
    image_url: (row.image_url as string) ?? null,
    category: String(row.category ?? "All"),
    prep_time: String(row.prep_time ?? "15-20 min"),
    is_popular: Boolean(row.is_popular),
    description: String(row.description ?? ""),
    delivery_fee: Number(row.delivery_fee ?? DEFAULT_DELIVERY_FEE),
  };
}

/** Fetch the full menu; falls back to the mock dataset on any failure/empty table. */
export async function fetchMenuItems(): Promise<MenuItem[]> {
  try {
    const { data, error } = await (supabase as any)
      .from("menu_items")
      .select("*")
      .order("is_popular", { ascending: false })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) return FALLBACK_MENU;
    return (data as Record<string, unknown>[]).map(normalize);
  } catch {
    return FALLBACK_MENU;
  }
}

/** Fetch a single dish by id, falling back to the mock dataset. */
export async function fetchMenuItem(id: string): Promise<MenuItem | null> {
  const fallback = FALLBACK_MENU.find((m) => m.id === id) ?? null;
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!isUuid) return fallback ?? FALLBACK_MENU[0];

  try {
    const { data, error } = await (supabase as any)
      .from("menu_items")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return fallback ?? FALLBACK_MENU[0];
    return normalize(data as Record<string, unknown>);
  } catch {
    return fallback ?? FALLBACK_MENU[0];
  }
}
