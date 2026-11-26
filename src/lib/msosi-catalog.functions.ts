import { createServerFn } from "@tanstack/react-start";
import { fetchMenuItems } from "./menu";
import { fetchFoodCategories } from "./admin-media";
import { fetchActiveBanners } from "./offers";
import { fetchVendors } from "./vendors";

// Public catalog only; no orders, contacts or authenticated reads.
export const getMsosiMenu = createServerFn({ method: "GET" }).handler(() => fetchMenuItems());
export const getMsosiCategories = createServerFn({ method: "GET" }).handler(() => fetchFoodCategories());
export const getMsosiBanners = createServerFn({ method: "GET" }).handler(() => fetchActiveBanners());
export const getMsosiVendors = createServerFn({ method: "GET" }).handler(() => fetchVendors());