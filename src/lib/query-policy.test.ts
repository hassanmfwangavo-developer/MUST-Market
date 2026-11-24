import { afterEach, describe, expect, it, vi } from "vitest";
import { createAppQueryClient, invalidateMenuQueries } from "./query-policy";

afterEach(() => vi.useRealTimers());

describe("database request caching policy", () => {
  it.each(["products", "menu_items", "menu_item", "vendor-menu-public"])("reuses %s for five minutes, then fetches fresh data", async (key) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-24T19:00:00Z"));
    const client = createAppQueryClient();
    const queryFn = vi.fn().mockResolvedValue([{ id: "real-item" }]);
    const options = { queryKey: [key], queryFn };
    await client.fetchQuery(options);
    vi.advanceTimersByTime(299999);
    await client.fetchQuery(options);
    expect(queryFn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(2);
    await client.fetchQuery(options);
    expect(queryFn).toHaveBeenCalledTimes(2);
    client.clear();
  });

  it("disables interval, focus and reconnect auto-refetches", () => {
    const client = createAppQueryClient();
    const options = client.defaultQueryOptions({ queryKey: ["products"] });
    expect(options.refetchInterval).toBe(false);
    expect(options.refetchOnWindowFocus).toBe(false);
    expect(options.refetchOnReconnect).toBe(false);
    expect(options.staleTime).toBe(300000);
    client.clear();
  });

  it("menu mutations invalidate all menu views without invalidating unrelated listings", async () => {
    const client = createAppQueryClient();
    const keys = ["menu_items", "menu_item", "vendor-menu-public", "vendor-menu", "admin-menu-items-for-banners"];
    for (const key of [...keys, "products"]) client.setQueryData([key], [{ id: "item" }]);
    await invalidateMenuQueries(client);
    for (const key of keys) expect(client.getQueryState([key])?.isInvalidated).toBe(true);
    expect(client.getQueryState(["products"])?.isInvalidated).toBe(false);
    client.clear();
  });

  it("listing edits make cached detail data stale immediately", async () => {
    const client = createAppQueryClient();
    client.setQueryData(["products", "detail", "item-1"], { price: 1000 });
    await client.invalidateQueries({ queryKey: ["products"] });
    expect(client.getQueryState(["products", "detail", "item-1"])?.isInvalidated).toBe(true);
    client.clear();
  });

  it("keeps operational order reads on a shorter one-minute cache", () => {
    const client = createAppQueryClient();
    expect(client.defaultQueryOptions({ queryKey: ["vendor-orders", "vendor-1"] }).staleTime).toBe(60000);
    client.clear();
  });
});