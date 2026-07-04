import { supabase } from "@/integrations/supabase/client";
import { demoProducts, type DemoProduct, type ProductCondition } from "./demo-data";

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
  whatsapp_number: string;
  delivery_timeframe: string | null;
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
    whatsapp: row.whatsapp_number,
    deliveryTimeframe: row.delivery_timeframe ?? undefined,
    createdAt: row.created_at,
    isDemo: false,
  };
}

export async function fetchProducts(): Promise<MarketProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,title,price_tsh,condition,location,description,images,whatsapp_number,delivery_timeframe,created_at,categories(name,slug)",
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const live = (data ?? []).map((r, i) => rowToProduct(r as unknown as DbProductRow, i));
  const demos: MarketProduct[] = demoProducts.map((d) => ({ ...d, isDemo: true }));
  return [...live, ...demos];
}

export async function fetchProduct(id: string): Promise<MarketProduct | null> {
  const demo = demoProducts.find((d) => d.id === id);
  if (demo) return { ...demo, isDemo: true };
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,title,price_tsh,condition,location,description,images,whatsapp_number,delivery_timeframe,created_at,categories(name,slug)",
    )
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
