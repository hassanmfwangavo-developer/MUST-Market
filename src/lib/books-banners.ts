import { supabase } from "@/integrations/supabase/client";

export interface BooksBanner {
  id: string;
  slot: number;
  image_url: string;
  image_path: string;
}

export const BOOKS_BANNER_QUERY_KEY = ["books-store-banners"] as const;

export async function fetchBooksBanners(): Promise<BooksBanner[]> {
  const { data, error } = await supabase
    .from("books_store_banners")
    .select("id,slot,image_url,image_path")
    .order("slot", { ascending: true });
  if (error) throw error;
  return data ?? [];
}