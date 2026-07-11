import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { categories } from "@/lib/demo-data";
import { fetchProducts, type MarketProduct } from "@/lib/products";
import { useSearchQuery } from "@/lib/search-store";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse All Products — MUST Market" },
      {
        name: "description",
        content:
          "Explore every active listing on MUST Market — laptops, books, hostel gear and more from Mbeya University students.",
      },
      { property: "og:title", content: "Browse All Products — MUST Market" },
      {
        property: "og:description",
        content: "Every active listing from MUST students, in one place.",
      },
    ],
  }),
  component: BrowsePage,
});

function BrowsePage() {
  const [active, setActive] = useState<string>("All");
  const query = useSearchQuery();
  const { data: products = [], isLoading } = useQuery<MarketProduct[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 30_000,
  });

  const filtered = useMemo(() => {
    const byCat = active === "All" ? products : products.filter((p) => p.category === active);
    const q = query.trim().toLowerCase();
    if (!q) return byCat;
    return byCat.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [active, products, query]);

  const tabs = ["All", ...categories.map((c) => c.name)];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>

        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">
            Full catalog
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Every listing on MUST Market
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {isLoading
              ? "Loading listings…"
              : `${filtered.length} ${filtered.length === 1 ? "item" : "items"} available right now.`}
          </p>
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
                {t}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-surface-2" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-dashed border-border bg-surface p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No items match your filters right now. Try another category.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
