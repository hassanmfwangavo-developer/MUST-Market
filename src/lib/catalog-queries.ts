import { queryOptions } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";
import { fetchProduct } from "./products";
import { CATALOG_STALE_TIME } from "./query-policy";

export function productDetailOptions(id: string) {
  return queryOptions({
    queryKey: ["products", "detail", id],
    staleTime: CATALOG_STALE_TIME,
    queryFn: async () => {
      const product = await fetchProduct(id);
      if (!product) throw notFound();
      return product;
    },
  });
}