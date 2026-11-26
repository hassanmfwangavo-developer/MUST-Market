import { queryOptions } from "@tanstack/react-query";
import { CATALOG_STALE_TIME } from "./query-policy";
import { getMsosiMenu, getMsosiCategories, getMsosiBanners, getMsosiVendors } from "./msosi-catalog.functions";

export const msosiMenuOptions = queryOptions({ queryKey: ["menu_items"], queryFn: () => getMsosiMenu(), staleTime: CATALOG_STALE_TIME });
export const msosiCategoriesOptions = queryOptions({ queryKey: ["food_categories_public"], queryFn: () => getMsosiCategories(), staleTime: CATALOG_STALE_TIME });
export const msosiBannersOptions = queryOptions({ queryKey: ["active_banners"], queryFn: () => getMsosiBanners(), staleTime: CATALOG_STALE_TIME });
export const msosiVendorsOptions = queryOptions({ queryKey: ["vendors_public"], queryFn: () => getMsosiVendors(), staleTime: CATALOG_STALE_TIME });