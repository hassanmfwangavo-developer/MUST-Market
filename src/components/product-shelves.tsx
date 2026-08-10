import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "@tanstack/react-router";
import { Plus, ArrowRight } from "lucide-react";
import { ProductCard } from "./product-card";
import { fetchProducts, type MarketProduct } from "@/lib/products";
import { useSearchQuery } from "@/lib/search-store";
import { openAuthModal, useAuthUser } from "@/lib/auth-store";

const FRESHER_KEYWORDS = [
  "kettle",
  "laptop",
  "desk",
  "bed",
  "mattress",
  "bucket",
  "iron",
  "chair",
  "table",
  "lamp",
  "fan",
  "stove",
  "cooker",
  "book",
  "blanket",
  "shelf",
  "hanger",
];

interface Shelf {
  key: string;
  title: string;
  subtitle: string;
  category?: string;
  items: MarketProduct[];
}

function ShelfRow({ shelf }: { shelf: Shelf }) {
  if (shelf.items.length === 0) return null;
  return (
    <section className="mt-10 first:mt-0">
      <div className="mx-auto flex max-w-7xl items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {shelf.title}
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
            {shelf.subtitle}
          </p>
        </div>
        <Link
          to="/browse"
          search={{ category: shelf.category }}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          View All
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </Link>
      </div>

      {/* Horizontal snap rail with an edge peek so mobile users see there's more */}
      <div className="scrollbar-none mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 sm:px-6 lg:px-8 [&>*]:snap-start">
        <div className="hidden shrink-0 lg:block lg:w-[max(0px,calc((100vw-80rem)/2))]" />
        {shelf.items.map((p) => (
          <div key={p.id} className="w-[160px] shrink-0 sm:w-[180px] lg:w-[220px]">
            <ProductCard product={p} />
          </div>
        ))}
        <div className="w-1 shrink-0" aria-hidden />
      </div>
    </section>
  );
}

export function ProductShelves() {
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

  const q = query.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!q) return [];
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [products, q]);

  const shelves = useMemo<Shelf[]>(() => {
    const take = 12;
    const hotDeals = [...products].sort((a, b) => a.price - b.price).slice(0, take);

    const rooms = products.filter(
      (p) => p.category === "Rooms / Gheto" || p.category === "Room/Hostel Gear",
    );

    const fresherMatches = products.filter((p) => {
      const text = `${p.title} ${p.description}`.toLowerCase();
      return FRESHER_KEYWORDS.some((k) => text.includes(k));
    });
    const freshers = (
      fresherMatches.length > 0
        ? fresherMatches
        : products.filter(
            (p) => p.category === "Room/Hostel Gear" || p.category === "Books/Stationery",
          )
    ).slice(0, take);

    const techPool = products.filter((p) => p.category === "Electronics");
    const trending = (techPool.length > 0 ? techPool : products)
      .slice()
      .sort((a, b) => {
        const v = (b.viewCount ?? 0) - (a.viewCount ?? 0);
        if (v !== 0) return v;
        return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
      })
      .slice(0, take);

    return [
      {
        key: "hot",
        title: "🔥 Hot Deals",
        subtitle: "Lowest prices on campus right now",
        items: hotDeals,
      },
      {
        key: "rooms",
        title: "🏠 Vyumba & Gheto",
        subtitle: "Rooms, hostel space & accommodation",
        category: "Rooms / Gheto",
        items: rooms.slice(0, take),
      },
      {
        key: "freshers",
        title: "🎓 Freshers Starter Pack",
        subtitle: "Kettles, laptops, desks, beds & essentials",
        category: "Room/Hostel Gear",
        items: freshers,
      },
      {
        key: "tech",
        title: "⚡ Trending Tech",
        subtitle: "Most viewed gadgets & electronics",
        category: "Electronics",
        items: trending,
      },
    ];
  }, [products]);

  return (
    <section id="browse" className="py-12 sm:py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-end gap-4 px-4 sm:px-6 lg:px-8">
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

      {isLoading ? (
        <div className="scrollbar-none mt-8 flex gap-3 overflow-hidden px-4 sm:px-6 lg:px-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] w-[160px] shrink-0 animate-pulse rounded-2xl bg-surface-2 sm:w-[180px] lg:w-[220px]"
            />
          ))}
        </div>
      ) : q ? (
        <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground">
            {searchResults.length} result{searchResults.length === 1 ? "" : "s"} for “{query}”
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {searchResults.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-8">
          {shelves.map((s) => (
            <ShelfRow key={s.key} shelf={s} />
          ))}
        </div>
      )}

      <div className="mt-12 flex justify-center px-4">
        <Link
          to="/browse"
          search={{ category: undefined }}
          className="btn-shine inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5"
        >
          View All Products
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </Link>
      </div>
    </section>
  );
}
