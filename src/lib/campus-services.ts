import { supabase } from "@/integrations/supabase/client";

export interface CampusService {
  id: string;
  title: string;
  category: string;
  provider_name: string;
  location: string;
  starting_price: number;
  description: string;
  operating_hours: string | null;
  phone_number: string;
  whatsapp_number: string;
  image_url: string | null;
  image_path: string | null;
  portfolio_images: string[];
  rating: number;
  review_count: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

const COLUMNS =
  "id,title,category,provider_name,location,starting_price,description,operating_hours,phone_number,whatsapp_number,image_url,image_path,portfolio_images,rating,review_count,is_verified,is_active,created_at";

/** Service categories offered in the Campus Service Mall. */
export const SERVICE_CATEGORIES = [
  { value: "Phone & Electronics", icon: "📱" },
  { value: "Laundry & Pasi", icon: "🧺" },
  { value: "Usafi wa Gheto", icon: "🧹" },
  { value: "Printing & Stationery", icon: "🖨️" },
  { value: "Beauty & Salon", icon: "✂️" },
] as const;

export const categoryIcon = (value: string) =>
  SERVICE_CATEGORIES.find((c) => c.value === value)?.icon ?? "✦";

/** Active providers shown publicly on /services. */
export async function fetchActiveCampusServices(): Promise<CampusService[]> {
  const { data, error } = await supabase
    .from("campus_services")
    .select(COLUMNS)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CampusService[];
}

/** Every provider, including hidden ones — admin console only. */
export async function fetchAllCampusServices(): Promise<CampusService[]> {
  const { data, error } = await supabase
    .from("campus_services")
    .select(COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CampusService[];
}

/** Count of active providers, used by the homepage overview banner. */
export async function fetchActiveServiceCount(): Promise<number> {
  const { count, error } = await supabase
    .from("campus_services")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);
  if (error) throw error;
  return count ?? 0;
}

export const formatServicePrice = (value: number) =>
  `TZS ${Math.round(Number(value) || 0).toLocaleString("en-US")}`;

export function serviceWhatsappUrl(service: CampusService) {
  const number = (service.whatsapp_number || service.phone_number || "").replace(/\D/g, "");
  const message = `Habari ${service.title}! Nimekuona kwenye MUST Service Mall. Naomba maelezo zaidi kuhusu huduma zako.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
