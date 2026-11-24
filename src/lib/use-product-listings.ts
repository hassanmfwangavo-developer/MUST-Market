import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchProducts, type ProductFilters } from "./products";

/** One filter-aware, five-minute cache shared by every public listing view. */
export function useProductListings(filters: ProductFilters = {}) {
  const rawSearch = filters.search?.trim() ?? "";
  const [search, setSearch] = useState(rawSearch);
  useEffect(() => {
    const timer = setTimeout(() => setSearch(rawSearch), 300);
    return () => clearTimeout(timer);
  }, [rawSearch]);
  const category = filters.category ?? "";
  const shelf = filters.shelf ?? "";
  const result = useInfiniteQuery({
    queryKey: ["products", "list", { category, search, shelf }],
    initialPageParam: { page: 0, shelf, fallbackShelf: "" },
    queryFn: ({ pageParam }) => fetchProducts({ category, search, ...pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage === null ? undefined : { page: lastPage.nextPage, shelf: lastPage.effectiveShelf, fallbackShelf: lastPage.fallbackShelf },
  });
  return { ...result, products: result.data?.pages.flatMap((page) => page.items) ?? [] };
}