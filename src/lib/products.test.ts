import { beforeEach, describe, expect, it, vi } from "vitest";

const { request, responses } = vi.hoisted(() => {
  const responses: Array<{ data: unknown[] | null; error: Error | null }> = [];
  const request: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const name of ["select", "eq", "in", "or", "order", "range"]) request[name] = vi.fn(() => request);
  request["limit"] = vi.fn(async () => responses.shift() ?? { data: [], error: null });
  return { request, responses };
});
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: vi.fn(() => request) } }));
import { fetchProducts } from "./products";

beforeEach(() => { vi.clearAllMocks(); responses.length = 0; });
const rows = (count: number) => Array.from({ length: count }, (_, i) => ({ id: `listing-${i}`, title: "Laptop", price_tsh: 1000, condition: "Good", location: "Campus", images: [], status: "active", created_at: "2026-11-24", categories: { name: "Electronics", slug: "electronics" }, is_verified: true }));

describe("public Sokoni pagination", () => {
  it("requests exactly 16 active summaries and keeps blue ticks without fetching contacts or descriptions", async () => {
    responses.push({ data: rows(16), error: null });
    const result = await fetchProducts();
    expect(request["limit"]).toHaveBeenCalledWith(16);
    expect(request["range"]).toHaveBeenCalledWith(0, 15);
    expect(request["eq"]).toHaveBeenCalledWith("status", "active");
    expect(request["select"]).toHaveBeenCalledWith("id,title,price_tsh,condition,location,images,featured_shelf,is_verified,pinned_at,status,created_at,categories(name,slug)");
    expect(result.items).toHaveLength(16);
    expect(result.items[0]?.isVerified).toBe(true);
    expect(result.nextPage).toBe(1);
  });
  it("requests the next 16 only when asked, with deterministic ordering", async () => {
    responses.push({ data: rows(3), error: null });
    const result = await fetchProducts({ page: 1 });
    expect(request["range"]).toHaveBeenCalledWith(16, 31);
    expect(request["order"]).toHaveBeenCalledWith("id", { ascending: false });
    expect(result.nextPage).toBeNull();
  });
  it("filters category and search in the database, not just within page one", async () => {
    responses.push({ data: rows(1), error: null });
    await fetchProducts({ category: "Electronics", search: "Laptop" });
    expect(request["eq"]).toHaveBeenCalledWith("categories.name", "Electronics");
    expect(request["select"]).toHaveBeenCalledWith(expect.stringContaining("categories!inner(name,slug)"));
    expect(request["or"]).toHaveBeenCalledWith('title.ilike."%Laptop%",description.ilike."%Laptop%"');
  });
  it("falls back from an empty pinned shelf without fetching an unlimited catalog", async () => {
    responses.push({ data: [], error: null }, { data: rows(16), error: null });
    const result = await fetchProducts({ shelf: "rooms" });
    expect(result.effectiveShelf).toBe("");
    expect(result.fallbackShelf).toBe("rooms");
    expect(request["in"]).toHaveBeenCalledWith("categories.name", ["Rooms / Gheto", "Room/Hostel Gear"]);
    expect(request["limit"]).toHaveBeenCalledTimes(2);
    expect(request["limit"]).toHaveBeenNthCalledWith(2, 16);
  });
});