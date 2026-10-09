import { supabase } from "@/integrations/supabase/client";
import type { DemoProduct, ProductCondition } from "./demo-data";

const FALLBACK_GRADIENTS = [
  "from-emerald-700 via-emerald-600 to-teal-500",
  "from-slate-800 via-slate-700 to-emerald-900",
  "from-amber-300 via-orange-300 to-rose-300",
  "from-indigo-900 via-purple-800 to-fuchsia-700",
  "from-rose-600 via-red-500 to-orange-500",
  "from-cyan-500 via-sky-500 to-blue-600",
];

export interface MarketProduct extends DemoProduct {
  whatsapp?: string;
  deliveryTimeframe?: string;
  createdAt?: string;
  featuredShelf?: string | null;
  isDemo?: boolean;
}

interface DbProductRow {
  id: string;
  title: string;
  price_tsh: number;
  condition: ProductCondition;
  location: string;
  description: string;
  images: string[] | null;
  whatsapp_number?: string | null;
  delivery_timeframe: string | null;
  featured_shelf?: string | null;
  status?: "active" | "sold" | "hidden" | null;
  created_at: string;
  categories: { name: string; slug: string } | null;
}

function rowToProduct(row: DbProductRow, idx: number): MarketProduct {
  const image = row.images?.[0] ?? "";
  return {
    id: row.id,
    title: row.title,
    price: row.price_tsh,
    condition: row.condition,
    category: row.categories?.name ?? "Other",
    location: row.location,
    seller: { name: "MUST Student", verified: false },
    image,
    gradient: FALLBACK_GRADIENTS[idx % FALLBACK_GRADIENTS.length],
    emoji: "📦",
    description: row.description,
    status: row.status ?? "active",
    whatsapp: row.whatsapp_number ?? undefined,
    deliveryTimeframe: row.delivery_timeframe ?? undefined,
    createdAt: row.created_at,
    featuredShelf: row.featured_shelf ?? null,
    isDemo: false,
  };
}

// Seller contact numbers are only readable by signed-in users (enforced in the
// database with column-level grants), so we only request the column when a
// session exists.
const BASE_COLUMNS =
  "id,title,price_tsh,condition,location,description,images,delivery_timeframe,featured_shelf,status,created_at,categories(name,slug)";

async function selectColumns(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session ? `${BASE_COLUMNS},whatsapp_number` : BASE_COLUMNS;
}

export async function fetchProducts(): Promise<MarketProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(await selectColumns())
    // Sold items stay visible (with a SOLD OUT overlay) — only hidden ones drop out.
    .in("status", ["active", "sold"])
    // Enum order puts 'active' before 'sold', so live listings surface first.
    .order("status", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r, i) => rowToProduct(r as unknown as DbProductRow, i));
}

export async function fetchProduct(id: string): Promise<MarketProduct | null> {
  const { data, error } = await supabase
    .from("products")
    .select(await selectColumns())
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return rowToProduct(data as unknown as DbProductRow, 0);
}

import { sanitizeTzPhone } from "./phone";

export function whatsappUrl(number: string | undefined, message: string) {
  const digits = sanitizeTzPhone(number ?? "");
  const base = digits ? `https://wa.me/${digits}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
}

// Records one "Order via WhatsApp" click. Signed-in visitors only (contact
// details are gated behind sign-in anyway).
export async function recordWhatsappClick(id: string) {
  try {
    await supabase.rpc("increment_whatsapp_click", { _product_id: id });
  } catch {
    // Click tracking must never break the page.
  }
}
