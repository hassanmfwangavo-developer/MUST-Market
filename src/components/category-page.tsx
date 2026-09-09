import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { fetchProducts, type MarketProduct } from "@/lib/products";
import { useSearchQuery } from "@/lib/search-store";
import { MARKET_CATEGORY_PAGES, type MarketCategorySlug } from "@/lib/site";

/** Full listing page pre-filtered to one permanent marketplace category. */
export function CategoryPage({ slug }: { slug: MarketCategorySlug }) {
  const meta = MARKET_CATEGORY_PAGES[slug];
  const query = useSearchQuery();
  const { data: products = [], isLoading } = useQuery<MarketProduct[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 30_000,
  });

  const items = useMemo(() => {
    const byCat = products.filter((p) => p.category === meta.dbName);
    const q = query.trim().toLowerCase();
    if (!q) return byCat;
    return byCat.filter(
      (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
    );
  }, [products, query, meta.dbName]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Link
          to="/market"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to marketplace
        </Link>

        <div className="mt-4 max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {meta.heading}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {meta.intro}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {isLoading
              ? "Loading listings…"
              : `${items.length} ${items.length === 1 ? "item" : "items"} available right now.`}
          </p>
        </div>

        <nav aria-label="Other categories" className="mt-6 flex flex-wrap gap-2">
          {(Object.keys(MARKET_CATEGORY_PAGES) as MarketCategorySlug[]).map((s) => (
            <Link
              key={s}
              to={MARKET_CATEGORY_PAGES[s].path}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                s === slug
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "border border-border bg-surface text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {MARKET_CATEGORY_PAGES[s].heading.replace(" at MUST", "").replace(" Near MUST", "")}
            </Link>
          ))}
        </nav>

        {isLoading ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-surface-2" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-border bg-surface p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Nothing listed in this category yet. Check back soon or{" "}
              <Link to="/sell" className="font-medium text-primary hover:underline">
                post your own item
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
