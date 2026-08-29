import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Search,
  Home,
  ClipboardList,
  ShoppingCart,
  User,
  Plus,
  Star,
  ChevronRight,
  Utensils,
} from "lucide-react";
import { Footer } from "@/components/footer";
import { fetchMenuItems, formatTsh, type MenuItem } from "@/lib/menu";
import { fetchFoodCategories, type FoodCategory } from "@/lib/admin-media";
import { fetchActiveBanners, claimOffer } from "@/lib/offers";


export const Route = createFileRoute("/msosi/")({
  head: () => ({
    meta: [
      { title: "Msosi Fasta — Express Campus Delivery | MUST Market" },
      {
        name: "description",
        content:
          "Agiza msosi utokeapo cafeterias na kufikishiwa mlangoni kwa dakika chache. Msosi Fasta — huduma ya haraka ya wanafunzi wa MUST.",
      },
      { property: "og:title", content: "Msosi Fasta — Express Campus Delivery" },
      {
        property: "og:description",
        content: "Agiza msosi ufiwe mlangoni kwa dk chache. MUST Market.",
      },
      { property: "og:url", content: "https://must-campus-swap.lovable.app/msosi" },
    ],
    links: [{ rel: "canonical", href: "https://must-campus-swap.lovable.app/msosi" }],
  }),
  component: MsosiFasta,
});

const CATEGORIES = [
  "Zote",
  "Wali / Biryani",
  "Chips / Fast Food",
  "Ugali / Swahili",
  "Vinywaji",
  "Snacks",
] as const;

const BOTTOM_TABS = [
  { key: "home", label: "Nyumbani", icon: Home, active: true },
  { key: "orders", label: "Maagizo", icon: ClipboardList, active: false },
  { key: "cart", label: "Kikapu", icon: ShoppingCart, active: false },
  { key: "account", label: "Akaunti", icon: User, active: false },
] as const;

function MsosiFasta() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("Zote");
  const [query, setQuery] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  const { data: menu = [], isLoading } = useQuery({
    queryKey: ["menu_items"],
    queryFn: fetchMenuItems,
  });

  const heroSlides = useMemo(() => menu.slice(0, 3), [menu]);
  const hero: MenuItem | undefined = heroSlides[activeSlide] ?? heroSlides[0];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menu.filter((item) => {
      const catOk = activeCategory === "Zote" || item.category === activeCategory;
      const qOk =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.vendor_name.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [menu, activeCategory, query]);

  const openDish = (id: string) => navigate({ to: "/msosi/$id", params: { id } });

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAFBF6] pb-20 md:pb-0">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[360px]"
        style={{
          background:
            "radial-gradient(60% 60% at 88% 0%, rgba(251,191,36,0.22), transparent 70%), radial-gradient(55% 55% at 8% 0%, rgba(0,133,66,0.18), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* ===================== STICKY TOP APP BAR ===================== */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-[#FAFBF6]/85 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:text-[#008542]"
              aria-label="Rudi kwenye Portal"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-extrabold leading-tight tracking-tight text-slate-900 sm:text-lg">
                MUST Food <span className="text-[#008542]">Fasta</span>
              </h1>
              <p className="truncate text-[11px] font-medium text-slate-500">
                Agiza ufikishiwe mpaka mlangoni
              </p>
            </div>
          </div>

          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Tafuta chakula"
              placeholder="Tafuta chakula, mf. Chips Kuku…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-[#008542] focus:outline-none focus:ring-2 focus:ring-[#008542]/15"
            />
          </div>
        </div>
      </header>

      {/* ===================== CATEGORY SHELF ===================== */}
      <div className="relative z-10 mx-auto max-w-5xl px-4">
        <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto py-3 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const active = cat === activeCategory;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 snap-start whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-all ${
                  active
                    ? "bg-[#008542] text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-[#008542]/40 hover:text-[#008542]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================== HERO SHOWCASE ===================== */}
      {hero && (
        <section className="relative z-10 mx-auto max-w-5xl px-4">
          <button
            type="button"
            onClick={() => openDish(hero.id)}
            className="relative block h-[180px] w-full overflow-hidden rounded-2xl text-left shadow-xs md:h-[260px]"
          >
            {hero.image_url && (
              <img
                src={hero.image_url}
                alt={hero.name}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
              <span className="mb-1.5 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#008542] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-xs">
                ⭐ Lugha ya siku
              </span>
              <h2 className="text-lg font-extrabold leading-tight tracking-tight text-white sm:text-2xl">
                {hero.name}
              </h2>
              <p className="text-xs font-medium text-white/80 sm:text-sm">
                {hero.vendor_name}
              </p>
              <span className="mt-2 inline-flex w-fit items-center rounded-lg bg-amber-400 px-2.5 py-1 text-xs font-bold text-amber-950 shadow-xs">
                {formatTsh(hero.price)}
              </span>
            </div>
          </button>

          <div className="mt-2 flex justify-end gap-1.5">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                aria-label={`Slaidi ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeSlide ? "w-5 bg-[#008542]" : "w-1.5 bg-slate-400/60"
                }`}
              />
            ))}
          </div>
        </section>
      )}

      {/* ===================== FOOD GRID FEED ===================== */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pb-6 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight text-slate-900 sm:text-base">
            Menu ya sasa
          </h2>
          <button
            onClick={() => {
              setActiveCategory("Zote");
              setQuery("");
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#008542] hover:underline"
          >
            Zote <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-2xl border border-slate-200/80 bg-slate-100"
              />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            Hakuna chakula kilichopatikana kwa utafutaji huu.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
            {visible.map((food) => (
              <article
                key={food.id}
                onClick={() => openDish(food.id)}
                className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all hover:shadow-sm"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  {food.image_url && (
                    <img
                      src={food.image_url}
                      alt={food.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-slate-900 shadow-xs backdrop-blur">
                    <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                    {food.rating}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-1 p-2.5">
                  <h3 className="line-clamp-1 text-xs font-bold leading-tight text-slate-900 sm:text-sm">
                    {food.name}
                  </h3>
                  <p className="line-clamp-1 text-[10px] font-medium text-slate-500 sm:text-[11px]">
                    {food.vendor_name}
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-1">
                    <span className="text-xs font-extrabold text-[#008542] sm:text-sm">
                      {formatTsh(food.price)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Ongeza ${food.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        openDish(food.id);
                      }}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#008542] text-white shadow-xs transition-colors hover:bg-[#006e36]"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="relative z-10 hidden md:block">
        <Footer />
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-around border-t border-slate-200 bg-white/95 py-2.5 backdrop-blur-md md:hidden">
        {BOTTOM_TABS.map((tab) => {
          const Icon = tab.icon;
          const cls = `flex flex-col items-center gap-0.5 px-2 text-[10px] font-semibold transition-colors ${
            tab.active ? "text-[#008542]" : "text-slate-400"
          }`;
          if (tab.key === "account" || tab.key === "orders") {
            return (
              <Link key={tab.key} to="/profile" className={cls}>
                <Icon className="h-5 w-5" />
                {tab.label}
              </Link>
            );
          }
          return (
            <button key={tab.key} className={cls}>
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          );
        })}

      </nav>
    </div>
  );
}
