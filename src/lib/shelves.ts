import { supabase } from "@/integrations/supabase/client";

export interface HomepageShelf {
  id: string;
  shelf_key: string;
  display_name: string;
  subtitle: string;
  category: string | null;
  position_order: number;
  is_visible: boolean;
}

/** Shelf keys admins can pin a product to. */
export const SHELF_OPTIONS = [
  { value: "", label: "None (General Feed)" },
  { value: "hot_deals", label: "🔥 Hot Deals" },
  { value: "freshers_pack", label: "🎓 Freshers Starter Pack" },
  { value: "trending", label: "⚡ Trending Tech" },
  { value: "rooms", label: "🏠 Vyumba & Gheto" },
] as const;

/** Used when the shelves table is empty so the homepage never renders blank. */
export const DEFAULT_SHELVES: HomepageShelf[] = [
  {
    id: "hot_deals",
    shelf_key: "hot_deals",
    display_name: "🔥 Hot Deals",
    subtitle: "Lowest prices on campus right now",
    category: null,
    position_order: 1,
    is_visible: true,
  },
  {
    id: "rooms",
    shelf_key: "rooms",
    display_name: "🏠 Vyumba & Gheto",
    subtitle: "Rooms, hostel space & accommodation",
    category: "Rooms / Gheto",
    position_order: 2,
    is_visible: true,
  },
  {
    id: "freshers_pack",
    shelf_key: "freshers_pack",
    display_name: "🎓 Freshers Starter Pack",
    subtitle: "Kettles, laptops, desks, beds & essentials",
    category: "Room/Hostel Gear",
    position_order: 3,
    is_visible: true,
  },
  {
    id: "trending",
    shelf_key: "trending",
    display_name: "⚡ Trending Tech",
    subtitle: "Most viewed gadgets & electronics",
    category: "Electronics",
    position_order: 4,
    is_visible: true,
  },
];

export async function fetchShelves(): Promise<HomepageShelf[]> {
  const { data, error } = await supabase
    .from("homepage_shelves")
    .select("id,shelf_key,display_name,subtitle,category,position_order,is_visible")
    .order("position_order", { ascending: true });
  if (error) throw error;
  if (!data || data.length === 0) return DEFAULT_SHELVES;
  return data as HomepageShelf[];
}
