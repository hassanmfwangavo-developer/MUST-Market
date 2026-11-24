import { QueryClient } from "@tanstack/react-query";

export const CATALOG_STALE_TIME = 5 * 60 * 1000;
export const PUBLIC_CATALOG_KEYS = [
  "products", "product", "menu-items", "menu_items", "menu-item", "menu_item",
  "vendors", "food-categories", "homepage-shelves", "market-banners", "books-store-banners",
  "banners", "active_banners", "food_categories_public", "vendors_public", "vendor",
  "vendor-menu-public", "preorder-meals", "campus-services", "campus-services-count", "campus-events",
] as const;

/** Catalog reads are reused across visits; order reads still refresh on stale mounts. */
export function createAppQueryClient() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        retry: 1,
      },
    },
  });
  for (const key of PUBLIC_CATALOG_KEYS) {
    client.setQueryDefaults([key], { staleTime: CATALOG_STALE_TIME });
  }
  // Access options use a short user-keyed cache, not the catalog duration.
  return client;
}

export function invalidateMenuQueries(client: QueryClient) {
  const keys = new Set(["admin-menu-items", "admin-menu-items-for-banners", "menu-items", "menu_items", "menu-item", "menu_item", "vendor-menu", "vendor-menu-public"]);
  return client.invalidateQueries({ predicate: (query) => keys.has(String(query.queryKey[0])) });
}