import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { ProductCard } from "./product-card";
import { categories, categoryEmoji, categoryLabel } from "@/lib/demo-data";
import { fetchProducts, type MarketProduct } from "@/lib/products";
import { fetchMarketBanners, type MarketBanner } from "@/lib/market-banners";
import { setSearchQuery, useSearchQuery } from "@/lib/search-store";
import { openAuthModal, useAuthUser } from "@/lib/auth-store";
import { useLanguage } from "@/context/LanguageContext";


function shuffle<T>(arr: T[], seed: number): T[] {
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

export function MarketHome() {
  const [active, setActive] = useState<string>("All");
  const seed = 724_391;
  const query = useSearchQuery();
  const navigate = useNavigate();
  const { user } = useAuthUser();
  const { t } = useLanguage();

  const goPost = () => {
    if (user) navigate({ to: "/sell" });
    else openAuthModal("/sell");
  };

  const { data: products = [], isLoading } = useQuery<MarketProduct[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 30_000,
  });

  const { data: bannerRows = [], isLoading: bannersLoading } = useQuery<MarketBanner[]>({
    queryKey: ["market-banners"],
    queryFn: fetchMarketBanners,
    staleTime: 60_000,
  });
  const marketBanners = useMemo(
    () => bannerRows.filter((b) => b.is_active).slice(0, 3),
    [bannerRows],
  );

  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (marketBanners.length < 2) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % marketBanners.length), 4500);
    return () => clearInterval(id);
  }, [marketBanners.length]);
  useEffect(() => {
    if (slide >= marketBanners.length) setSlide(0);
  }, [marketBanners.length, slide]);


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
    <section id="browse" className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      {/* Promotional banner */}
      {bannersLoading ? (
        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl border border-border bg-surface-2 sm:aspect-[21/6]" aria-label="Loading marketplace promotions">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-surface-2 via-surface to-surface-2 motion-reduce:animate-none" />
        </div>
      ) : marketBanners.length > 0 ? (
        <div className="relative overflow-hidden rounded-2xl shadow-lift">
          <div className="relative aspect-[16/7] w-full sm:aspect-[21/6]">
            {marketBanners.map((b, i) => (
              <img
                key={b.id}
                src={b.image_url}
                alt="Marketplace promotion"
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  i === slide ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>
          {marketBanners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {marketBanners.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSlide(i)}
                  aria-label={`Show banner ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === slide ? "w-6 bg-white" : "w-2 bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}


      {/* Search + Post */}
      <div className="mt-4 flex items-center gap-2 sm:gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            aria-label={t.marketHome?.search.aria}
            value={query}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.marketHome?.search.placeholder}
            className="h-12 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-sm text-foreground shadow-soft transition-all focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10"
          />
        </div>
        <button
          type="button"
          onClick={goPost}
          aria-label={t.marketHome?.post.aria}
          className="btn-shine inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 py-3 text-sm font-bold text-accent-foreground shadow-[var(--shadow-amber)] transition-transform hover:-translate-y-0.5 sm:px-5"
        >
          <span className="hidden sm:inline">{t.marketHome?.post.label}</span>
          <span className="sm:hidden">{t.marketHome?.post.labelShort}</span>
        </button>
      </div>

      {/* Category quick filters */}
      <div className="mt-4 -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:px-0">
        {tabs.map((tab) => {
          const isActive = tab === active;
          return (
            <button
              type="button"
              key={tab}
              onClick={() => setActive(tab)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "border border-border bg-surface text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {tab === "All"
                ? t.categories.all
                : `${categoryEmoji(tab)} ${categoryLabel(tab).replace("\n", " ")}`}
            </button>
          );
        })}
      </div>

      {/* Product grid */}
      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-surface-2" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-surface p-12 text-center">
            <p className="text-sm text-muted-foreground">{t.search.noResults}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center gap-2">
              <Link
                to="/browse"
                search={{ category: active === "All" ? undefined : active, shelf: undefined }}
                className="btn-shine inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5"
              >
                {t.marketHome?.viewAll}
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
      </div>
    </section>
  );
}
