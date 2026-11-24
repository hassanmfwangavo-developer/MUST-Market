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
  isVerified?: boolean;
  pinnedAt?: string | null;
}

interface DbProductRow {
  id: string;
  title: string;
  price_tsh: number;
  condition: ProductCondition;
  location: string;
  description?: string;
  images: string[] | null;
  whatsapp_number?: string | null;
  delivery_timeframe?: string | null;
  featured_shelf?: string | null;
  is_verified?: boolean | null;
  pinned_at?: string | null;
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
    description: row.description ?? "",
    status: row.status ?? "active",
    whatsapp: row.whatsapp_number ?? undefined,
    deliveryTimeframe: row.delivery_timeframe ?? undefined,
    createdAt: row.created_at,
    featuredShelf: row.featured_shelf ?? null,
    isDemo: false,
    isVerified: row.is_verified ?? false,
    pinnedAt: row.pinned_at ?? null,
  };
}

// Seller contact numbers are only readable by signed-in users (enforced in the
// database with column-level grants), so we only request the column when a
// session exists.
const BASE_COLUMNS =
  "id,title,price_tsh,condition,location,description,images,delivery_timeframe,featured_shelf,is_verified,pinned_at,status,created_at,categories(name,slug)";

async function selectColumns(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session ? `${BASE_COLUMNS},whatsapp_number` : BASE_COLUMNS;
}

export const PRODUCT_PAGE_SIZE = 16;
export const PRODUCT_SUMMARY_COLUMNS =
  "id,title,price_tsh,condition,location,images,featured_shelf,is_verified,pinned_at,status,created_at,categories(name,slug)";

export interface ProductFilters {
  category?: string;
  search?: string;
  shelf?: string;
  fallbackShelf?: string;
}

export interface ProductPage {
  items: MarketProduct[];
  nextPage: number | null;
  effectiveShelf: string;
  fallbackShelf: string;
}

export async function fetchProducts({ page = 0, category = "", search = "", shelf = "", fallbackShelf = "" }: ProductFilters & { page?: number } = {}): Promise<ProductPage> {
  const offset = Math.max(0, Math.floor(page)) * PRODUCT_PAGE_SIZE;
  const fallbackCategories = category ? [] : fallbackShelf === "rooms" ? ["Rooms / Gheto", "Room/Hostel Gear"] : fallbackShelf === "trending" ? ["Electronics"] : fallbackShelf === "freshers_categories" ? ["Room/Hostel Gear", "Books/Stationery"] : [];
  let request = supabase
    .from("products")
    .select(category || fallbackCategories.length ? PRODUCT_SUMMARY_COLUMNS.replace("categories(", "categories!inner(") : PRODUCT_SUMMARY_COLUMNS)
    .eq("status", "active");
  if (category) request = request.eq("categories.name", category);
  if (fallbackCategories.length) request = request.in("categories.name", fallbackCategories);
  if (shelf) request = request.eq("featured_shelf", shelf);
  if (fallbackShelf === "freshers_pack" && !category) {
    const words = ["kettle", "laptop", "desk", "bed", "mattress", "bucket", "iron", "chair", "table", "lamp", "fan", "stove", "cooker", "book", "blanket", "shelf", "hanger"];
    request = request.or(words.flatMap((word) => [`title.ilike.%${word}%`, `description.ilike.%${word}%`]).join(","));
  }
  const term = search.trim();
  if (term) {
    // Quote PostgREST operands so punctuation cannot inject extra filters.
    const pattern = `"%${term.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/[%_]/g, "\\$&")}%"`;
    request = request.or(`title.ilike.${pattern},description.ilike.${pattern}`);
  }
  if (fallbackShelf === "hot_deals") request = request.order("price_tsh", { ascending: true });
  const { data, error } = await request
    .order("pinned_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + PRODUCT_PAGE_SIZE - 1)
    .limit(PRODUCT_PAGE_SIZE);
  if (error) throw error;
  // Preserve shelf links' category fallback without reading the whole catalog.
  if (page === 0 && shelf && !data?.length) {
    return fetchProducts({ page, category, search, shelf: "", fallbackShelf: shelf });
  }
  if (page === 0 && !data?.length && fallbackShelf === "freshers_pack" && !category) {
    return fetchProducts({ page, category, search, fallbackShelf: "freshers_categories" });
  }
  if (page === 0 && !data?.length && fallbackShelf === "trending" && !category) {
    return fetchProducts({ page, category, search });
  }
  const items = (data ?? []).map((r, i) => rowToProduct(r as unknown as DbProductRow, i));
  return { items, nextPage: items.length === PRODUCT_PAGE_SIZE ? page + 1 : null, effectiveShelf: shelf, fallbackShelf };
}

export async function fetchProduct(id: string): Promise<MarketProduct | null> {
  const { data, error } = await supabase
    .from("products")
    .select(await selectColumns())
    .eq("id", id)
    // Admin-removed listings (status 'deleted') no longer render, even by direct link.
    .neq("status" as never, "deleted" as never)
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
