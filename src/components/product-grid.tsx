import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "@tanstack/react-router";
import { Plus, ArrowRight } from "lucide-react";
import { ProductCard } from "./product-card";
import { categories, categoryLabel, categoryEmoji } from "@/lib/demo-data";
import { fetchProducts, type MarketProduct } from "@/lib/products";
import { useSearchQuery } from "@/lib/search-store";
import { openAuthModal, useAuthUser } from "@/lib/auth-store";

function shuffle<T>(arr: T[], seed: number): T[] {
  // Deterministic Fisher-Yates using a seeded PRNG so filtering stays stable per mount.
  const copy = [...arr];
  let s = seed || 1;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function ProductGrid() {
  const [active, setActive] = useState<string>("All");
  const [seed] = useState(() => Math.floor(Math.random() * 1_000_000) + 1);
  const query = useSearchQuery();
  const navigate = useNavigate();
  const { user } = useAuthUser();
  const goPost = () => {
    if (user) navigate({ to: "/sell" });
    else openAuthModal("/sell");
  };
  const { data: products = [], isLoading } = useQuery<MarketProduct[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 30_000,
  });

  const shuffled = useMemo(() => shuffle(products, seed), [products, seed]);

  const filtered = useMemo(() => {
    const byCat = active === "All" ? shuffled : shuffled.filter((p) => p.category === active);
    const q = query.trim().toLowerCase();
    if (!q) return byCat;
    return byCat.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [active, shuffled, query]);

  const FEATURED_LIMIT = 6;
  const featured = filtered.slice(0, FEATURED_LIMIT);
  const hasMore = filtered.length > FEATURED_LIMIT;

  const tabs = ["All", ...categories.map((c) => c.dbName)];

  return (
    <section id="browse" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">
            Fresh on campus
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Latest listings from MUST
          </h2>
        </div>
        <button
          type="button"
          onClick={goPost}
          aria-label="Post a listing"
          className="btn-shine inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-xs font-bold text-accent-foreground shadow-[var(--shadow-amber)] transition-transform hover:-translate-y-0.5 sm:text-sm"
        >
          <Plus className="h-4 w-4" strokeWidth={2.8} />
          Post
        </button>
      </div>

      <div className="mt-6 -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {tabs.map((t) => {
          const isActive = t === active;
          return (
            <button
              type="button"
              key={t}
              onClick={() => setActive(t)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "border border-border bg-surface text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {t === "All" ? "All" : `${categoryEmoji(t)} ${categoryLabel(t).replace("\n", " ")}`}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-surface-2" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-2">
            <Link
              to="/browse"
              search={{ category: undefined }}
              className="btn-shine inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5"
            >
              View All Products
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
            {hasMore && (
              <p className="text-xs text-muted-foreground">
                Showing {featured.length} of {filtered.length} items
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
