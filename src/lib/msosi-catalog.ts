import { queryOptions } from "@tanstack/react-query";
import { fetchMenuItems } from "./menu";
import { fetchActiveBanners } from "./offers";
import { fetchFoodCategories } from "./admin-media";
import { fetchVendors } from "./vendors";
import { CATALOG_STALE_TIME } from "./query-policy";

export const MSOSI_PAGE_SIZE = 12;
export function menuRevealLimit(value: unknown): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= MSOSI_PAGE_SIZE && parsed % MSOSI_PAGE_SIZE === 0
    ? parsed : MSOSI_PAGE_SIZE;
}

export const msosiMenuOptions = queryOptions({ queryKey: ["menu_items"], queryFn: fetchMenuItems, staleTime: CATALOG_STALE_TIME });
export const msosiBannersOptions = queryOptions({ queryKey: ["active_banners"], queryFn: fetchActiveBanners, staleTime: CATALOG_STALE_TIME });
export const msosiCategoriesOptions = queryOptions({ queryKey: ["food_categories_public"], queryFn: fetchFoodCategories, staleTime: CATALOG_STALE_TIME });
export const msosiVendorsOptions = queryOptions({ queryKey: ["vendors_public"], queryFn: fetchVendors, staleTime: CATALOG_STALE_TIME });