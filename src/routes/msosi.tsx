import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
} from "lucide-react";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/msosi")({
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

/* ----------------------------- Static template data ----------------------------- */

const CATEGORIES = [
  "Zote",
  "Wali / Biryani",
  "Chips / Fast Food",
  "Ugali / Swahili",
  "Vinywaji",
  "Snacks",
] as const;

interface FoodCardData {
  id: string;
  title: string;
  vendor: string;
  price: number;
  rating: number;
  emoji: string;
  gradient: string;
}

const HERO_SLIDES = [
  {
    title: "Wali Kuku wa Mchana",
    vendor: "Cafeteria ya Block E",
    price: 3500,
    emoji: "🍗",
    gradient: "from-amber-200 via-orange-200 to-rose-200",
  },
  {
    title: "Chips Mayai Special",
    vendor: "Joji Fast Food",
    price: 4000,
    emoji: "🍟",
    gradient: "from-yellow-200 via-amber-200 to-orange-300",
  },
  {
    title: "Ugali Samaki Ya Mlango",
    vendor: "Mama Lishe — Iyunga",
    price: 3000,
    emoji: "🐟",
    gradient: "from-emerald-200 via-teal-200 to-sky-200",
  },
];

const FOOD_GRID: FoodCardData[] = [
  { id: "f1", title: "Wali Kuku", vendor: "Cafeteria Block E", price: 3500, rating: 4.8, emoji: "🍗", gradient: "from-amber-200 to-orange-300" },
  { id: "f2", title: "Chips Mayai", vendor: "Joji Fast Food", price: 4000, rating: 4.7, emoji: "🍟", gradient: "from-yellow-200 to-amber-300" },
  { id: "f3", title: "Ugali Samaki", vendor: "Mama Lishe — Iyunga", price: 3000, rating: 4.6, emoji: "🐟", gradient: "from-emerald-200 to-teal-300" },
  { id: "f4", title: "Biryani Ya Nyama", vendor: "Swahili Kitchen — Ikuti", price: 4500, rating: 4.9, emoji: "🍚", gradient: "from-orange-200 to-rose-300" },
  { id: "f5", title: "Soda Baridi", vendor: "Kiosk Block B", price: 1000, rating: 4.5, emoji: "🥤", gradient: "from-sky-200 to-blue-300" },
  { id: "f6", title: "Chapati Mayai", vendor: "Cafeteria Hostel 6B", price: 1500, rating: 4.7, emoji: "🫓", gradient: "from-amber-200 to-yellow-300" },
  { id: "f7", title: "Mishkaki Ya Nyama", vendor: "Grill Spot — Library", price: 2500, rating: 4.8, emoji: "🍢", gradient: "from-rose-200 to-red-300" },
  { id: "f8", title: "Kachumbari Plate", vendor: "Swahili Kitchen — Ikuti", price: 2000, rating: 4.4, emoji: "🥗", gradient: "from-lime-200 to-green-300" },
];

function formatTsh(n: number) {
  return `TZS ${n.toLocaleString("en-US")}`;
}

/* ----------------------------- Bottom nav ----------------------------- */

const BOTTOM_TABS = [
  { key: "home", label: "Nyumbani", icon: Home, active: true },
  { key: "orders", label: "Maagizo", icon: ClipboardList, active: false },
  { key: "cart", label: "Kikapu", icon: ShoppingCart, active: false },
  { key: "account", label: "Akaunti", icon: User, active: false },
] as const;

/* ----------------------------- Component ----------------------------- */

function MsosiFasta() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("Zote");
  const [activeSlide, setActiveSlide] = useState(0);

  const goToDetail = () => navigate({ to: "/msosi/detail" });

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAFBF6] pb-20 md:pb-0">
      {/* Ambient top radial glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[360px]"
        style={{
          background:
            "radial-gradient(60% 60% at 88% 0%, rgba(251,191,36,0.22), transparent 70%), radial-gradient(55% 55% at 8% 0%, rgba(0,133,66,0.18), transparent 70%)",
        }}
      />
      {/* Dot-matrix pattern */}
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
          {/* Back link + title row */}
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

          {/* Search bar */}
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Tafuta chakula, mf. Wali Kuku…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-[#008542] focus:outline-none focus:ring-2 focus:ring-[#008542]/15"
            />
          </div>
        </div>
      </header>

      {/* ===================== HORIZONTAL CATEGORY SHELF ===================== */}
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

      {/* ===================== HERO SHOWCASE SLIDESHOW ===================== */}
      <section className="relative z-10 mx-auto max-w-5xl px-4">
        <div className="relative h-[180px] overflow-hidden rounded-2xl shadow-xs md:h-[260px]">
          {/* Background gradient per slide */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${HERO_SLIDES[activeSlide].gradient} transition-all duration-700`}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(255,255,255,0.5),transparent_60%)]" />

          {/* Big emoji visual */}
          <div className="absolute inset-y-0 right-4 grid place-items-center text-[6rem] drop-shadow-lg md:text-[8rem]">
            <span className="select-none">{HERO_SLIDES[activeSlide].emoji}</span>
          </div>

          {/* Text overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
            <span className="mb-1.5 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#008542] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-xs">
              ⭐ Lugha ya siku
            </span>
            <h2 className="text-lg font-extrabold leading-tight tracking-tight text-slate-900 sm:text-2xl">
              {HERO_SLIDES[activeSlide].title}
            </h2>
            <p className="text-xs font-medium text-slate-700 sm:text-sm">
              {HERO_SLIDES[activeSlide].vendor}
            </p>
            <span className="mt-2 inline-flex w-fit items-center rounded-lg bg-amber-400 px-2.5 py-1 text-xs font-bold text-amber-950 shadow-xs">
              {formatTsh(HERO_SLIDES[activeSlide].price)}
            </span>
          </div>

          {/* Slide indicators */}
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            {HERO_SLIDES.map((_, i) => (
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
        </div>
      </section>

      {/* ===================== 2-COLUMN FOOD GRID FEED ===================== */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pb-6 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight text-slate-900 sm:text-base">
            Menu ya sasa
          </h2>
          <button className="inline-flex items-center gap-1 text-xs font-semibold text-[#008542] hover:underline">
            Zote <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
          {FOOD_GRID.map((food) => (
            <article
              key={food.id}
              onClick={goToDetail}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all hover:shadow-sm md:cursor-pointer"
            >
              {/* Image area */}
              <div className="relative aspect-square overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${food.gradient} transition-transform duration-700 group-hover:scale-105`}
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_55%)]" />
                <div className="absolute inset-0 grid place-items-center text-5xl drop-shadow-md">
                  <span className="select-none">{food.emoji}</span>
                </div>
                {/* Rating badge */}
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-slate-900 shadow-xs backdrop-blur">
                  <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                  {food.rating}
                </span>
              </div>

              {/* Details */}
              <div className="flex flex-1 flex-col gap-1 p-2.5">
                <h3 className="line-clamp-1 text-xs font-bold leading-tight text-slate-900 sm:text-sm">
                  {food.title}
                </h3>
                <p className="line-clamp-1 text-[10px] font-medium text-slate-500 sm:text-[11px]">
                  {food.vendor}
                </p>
                <div className="mt-1 flex items-center justify-between gap-1">
                  <span className="text-xs font-extrabold text-[#008542] sm:text-sm">
                    {formatTsh(food.price)}
                  </span>
                  {/* Quick action — opens detail page */}
                  <button
                    type="button"
                    aria-label={`Ongeza ${food.title}`}
                    onClick={goToDetail}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#008542] text-white shadow-xs transition-colors hover:bg-[#006e36]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===================== FOOTER (desktop / above bottom bar) ===================== */}
      <div className="relative z-10 hidden md:block">
        <Footer />
      </div>

      {/* ===================== FIXED BOTTOM NAVIGATION (mobile) ===================== */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-around border-t border-slate-200 bg-white/95 py-2.5 backdrop-blur-md md:hidden">
        {BOTTOM_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              className={`flex flex-col items-center gap-0.5 px-2 text-[10px] font-semibold transition-colors ${
                tab.active ? "text-[#008542]" : "text-slate-400"
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
