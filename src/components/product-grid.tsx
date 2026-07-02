import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { ProductCard } from "./product-card";
import { QuickViewModal } from "./quick-view-modal";
import { demoProducts, categories, type DemoProduct } from "@/lib/demo-data";

export function ProductGrid() {
  const [active, setActive] = useState<string>("All");
  const [quickView, setQuickView] = useState<DemoProduct | null>(null);

  const filtered = useMemo(() => {
    if (active === "All") return demoProducts;
    return demoProducts.filter((p) => p.category === active);
  }, [active]);

  const tabs = ["All", ...categories.map((c) => c.name)];

  return (
    <section id="browse" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">
            Fresh on campus
          </div>
          <h2 className="mt-1 truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Latest listings from MUST
          </h2>
        </div>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-2 text-xs font-medium text-foreground shadow-soft transition-colors hover:border-primary/40 hover:text-primary sm:text-sm"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
        </button>
      </div>

      {/* Filter tabs */}
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

      <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} onQuickView={setQuickView} />
        ))}
      </div>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </section>
  );
}
