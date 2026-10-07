import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Search,
  Home,
  ClipboardList,
  LifeBuoy,
  User,
  Plus,
  Star,
  ChevronRight,
  Utensils,
  Store,
} from "lucide-react";
import { Footer } from "@/components/footer";
import { fetchMenuItems, formatTsh, type MenuItem } from "@/lib/menu";
import { BookingModal } from "@/components/booking-modal";
import { fetchFoodCategories, type FoodCategory } from "@/lib/admin-media";
import { fetchActiveBanners, claimOffer } from "@/lib/offers";
import { fetchVendors } from "@/lib/vendors";
import { matchesCategory } from "@/lib/category-match";
import { HowItWorks, ReferralCard } from "@/components/msosi-sections";
import { HelpDrawer } from "@/components/help-drawer";
import { PartnerModal } from "@/components/partner-modal";


export const Route = createFileRoute("/msosi/")({
  head: () => ({
    meta: [
      { title: "Msosi Fasta | Campus Food Delivery at Mbeya University" },
      {
        name: "description",
        content:
          "Order fast food from MUST campus cafeterias and get it delivered to your doorstep in minutes. Browse menus, offers and trusted restaurants.",
      },
      { property: "og:title", content: "MUST Food Fasta — Express Campus Delivery" },
      {
        property: "og:description",
        content: "Order food delivered to your doorstep in minutes. MUST Market.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://mustmarket.store/msosi" },
    ],
    links: [{ rel: "canonical", href: "https://mustmarket.store/msosi" }],
  }),
  component: MsosiFasta,
});



const BANNER_GRADIENTS: Record<string, string> = {
  flash_sale: "from-orange-500 to-amber-500",
  first_order: "from-[#008542] to-emerald-500",
  ijumaa_booking: "from-emerald-600 to-teal-500",
  jpili_booking: "from-rose-500 to-orange-500",
};

const BANNER_CTA: Record<string, string> = {
  flash_sale: "Order Now",
  first_order: "Order Now",
  ijumaa_booking: "Book Now",
  jpili_booking: "Book Now",
};

function useCountdown(endsAt: string | null) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    if (!endsAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  if (!endsAt) return null;
  if (!now) return "--:--:--";
  const diff = new Date(endsAt).getTime() - now;
  if (Number.isNaN(diff) || diff <= 0) return null;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

const BOTTOM_TABS = [
  { key: "home", label: "Home", icon: Home, active: true },
  { key: "orders", label: "Orders", icon: ClipboardList, active: false },
  { key: "help", label: "Help", icon: LifeBuoy, active: false },
  { key: "account", label: "Account", icon: User, active: false },
] as const;

function MsosiFasta() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [booking, setBooking] = useState<MenuItem | null>(null);
  const [partnerOpen, setPartnerOpen] = useState(false);

  const { data: menu = [], isLoading } = useQuery({
    queryKey: ["menu_items"],
    queryFn: fetchMenuItems,
  });

  const { data: banners = [], isLoading: bannersLoading } = useQuery({
    queryKey: ["active_banners"],
    queryFn: fetchActiveBanners,
  });

  const { data: dbCategories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["food_categories_public"],
    queryFn: fetchFoodCategories,
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors_public"],
    queryFn: fetchVendors,
  });

  const categories = useMemo(() => {
    return dbCategories.filter((c) => c.is_active).slice(0, 5);
  }, [dbCategories]);

  const slide = banners[activeSlide] ?? banners[0];
  const countdown = useCountdown(
    slide?.banner_type === "flash_sale" ? (slide?.countdown_ends_at ?? null) : null,
  );

  // Auto-play the banner carousel.
  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => {
      setActiveSlide((i) => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menu.filter((item) => {
      const catOk = !activeCategory || matchesCategory(item, activeCategory);
      const qOk =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.vendor_name.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [menu, activeCategory, query]);

  const openDish = (id: string) => navigate({ to: "/msosi/$id", params: { id } });

  const handleClaim = () => {
    if (!slide) return;
    // The offer is held in memory only, and strictly for the dish it is tied to.
    const offer = claimOffer(slide);
    if (offer) {
      toast.success(`${offer.discountPercent}% off applied to this dish — order now!`);
      openDish(offer.menuItemId);
      return;
    }
    if (slide.menu_item_id) {
      openDish(slide.menu_item_id);
      return;
    }
    const first = menu[0];
    if (first) openDish(first.id);
  };


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
              aria-label="Back to portal"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="sr-only">Order Food from MUST Campus Cafeterias</h1>
              <p className="truncate text-base font-extrabold leading-tight tracking-tight text-slate-900 sm:text-lg">
                MUST Food <span className="text-[#008542]">Fasta</span>
              </p>
              <p className="truncate text-[11px] font-medium text-slate-500">
                Order fast food delivered to your doorstep
              </p>
            </div>
          </div>

          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search food or restaurant"
              placeholder="Search food or restaurant..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-[#008542] focus:outline-none focus:ring-2 focus:ring-[#008542]/15"
            />
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-5xl px-4 pt-4" aria-label="Hostel batch pre-order notice">
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:px-5">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400 text-xl" aria-hidden>
              🥣
            </span>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-slate-900 sm:text-base">Pre-Order System</p>
              <p className="mt-0.5 text-xs font-medium leading-relaxed text-slate-700 sm:text-sm">
                Agiza chakula mapema kulingana na Hostel yako kwa delivery ya pamoja!
              </p>
            </div>
          </div>
          <Link
            to="/preorder"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 active:scale-[0.98]"
          >
            Weka Order Sasa
          </Link>
        </div>
      </section>

      {/* ===================== PROMO BANNER CAROUSEL ===================== */}
      {bannersLoading ? (
        <section className="relative z-10 mx-auto max-w-5xl px-4 pt-4" aria-label="Loading offers">
          <div className="h-36 animate-pulse rounded-3xl border border-slate-200 bg-slate-100 motion-reduce:animate-none sm:h-40" />
        </section>
      ) : slide ? (
        <section className="relative z-10 mx-auto max-w-5xl px-4 pt-4">
          {slide.banner_type === "advertising" && slide.image_url ? (
            /* Clean advertising banner: raw image, no overlay, text, badges or countdown */
            <div className="relative overflow-hidden rounded-3xl shadow-sm">
              <img
                src={slide.image_url}
                alt={slide.title || "Advertisement"}
                loading="lazy"
                decoding="async"
                className="w-full object-cover"
              />
            </div>
          ) : (
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-sm sm:min-h-[160px]">
            {slide.image_url ? (
              <img
                src={slide.image_url}
                alt={slide.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div
                className={`absolute inset-0 bg-gradient-to-r ${
                  BANNER_GRADIENTS[slide.banner_type] ?? "from-orange-500 to-amber-500"
                }`}
              />
            )}
            {/* Very subtle scrim so text stays readable without dimming the image */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent"
            />
            <div className="relative flex items-center gap-3 p-4 sm:gap-4 sm:p-7">
              <div className="min-w-0 flex-1">
                {slide.promo_code && (
                  <span className="inline-flex items-center rounded-full bg-white/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur sm:px-3 sm:text-[11px]">
                    Use code {slide.promo_code}
                  </span>
                )}
                <h2 className="mt-1.5 text-base font-extrabold leading-tight tracking-tight text-white drop-shadow-sm sm:mt-2 sm:text-2xl">
                  {slide.title}
                </h2>
                {slide.subtitle && (
                  <p className="mt-1 line-clamp-2 text-[11px] font-medium text-white/90 drop-shadow-sm sm:text-sm">
                    {slide.subtitle}
                  </p>
                )}
                {countdown && (
                  <p className="mt-2 inline-flex items-center rounded-lg bg-black/40 px-2.5 py-1 font-mono text-xs font-bold text-white backdrop-blur">
                    ⏳ {countdown}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleClaim}
                  className="mt-2.5 inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-900 shadow-xs transition-transform hover:scale-[1.03] sm:mt-3 sm:gap-1.5 sm:px-4 sm:text-sm"
                >
                  {BANNER_CTA[slide.banner_type] ?? "Order Now"}
                  <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
              {slide.discount_percent ? (
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/20 text-center text-white backdrop-blur sm:h-20 sm:w-20 sm:rounded-2xl"
                  aria-label={`${slide.discount_percent} percent off`}
                >
                  <p className="text-sm font-extrabold leading-none sm:text-3xl">
                    {slide.discount_percent}%
                  </p>
                  <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wide sm:text-[11px]">
                    Off
                  </p>
                </div>
              ) : null}
            </div>
          </div>
          )}

          {banners.length > 1 && (
            <div className="mt-2.5 flex justify-center gap-1.5">
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => setActiveSlide(i)}
                  aria-label={`Banner ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeSlide ? "w-5 bg-[#008542]" : "w-1.5 bg-slate-400/60"
                  }`}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}

      {/* ===================== TOP 5 CATEGORY CARDS ===================== */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pt-5">
        <div className="flex items-start justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categoriesLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex shrink-0 basis-0 grow flex-col items-center" aria-hidden="true">
                  <span className="h-16 w-16 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 motion-reduce:animate-none sm:h-20 sm:w-20" />
                  <span className="mt-2 h-3 w-14 animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
                </div>
              ))
            : categories.map((cat) => {
            const active = activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(active ? null : cat.name)}
                className="flex shrink-0 basis-0 grow flex-col items-center"
              >
                <span
                  className={`flex h-16 w-16 cursor-pointer items-center justify-center rounded-2xl bg-white p-2 shadow-sm transition-transform hover:scale-105 sm:h-20 sm:w-20 ${
                    active
                      ? "border-2 border-[#008542] ring-4 ring-[#008542]/15"
                      : "border border-slate-200"
                  }`}
                >
                  {cat.icon_url ? (
                    <img
                      src={cat.icon_url}
                      alt={cat.name}
                      loading="lazy"
                      decoding="async"
                      className="h-12 w-12 rounded-xl object-contain"
                    />
                  ) : (
                    <Utensils className="h-7 w-7 text-[#008542]" />
                  )}
                </span>
                <span
                  className={`mt-1 text-center text-xs font-semibold sm:text-sm ${
                    active ? "text-[#008542]" : "text-slate-800"
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
              })}
        </div>
      </section>



      {/* ===================== FOOD GRID FEED ===================== */}
      <section id="todays-menu" className="relative z-10 mx-auto max-w-5xl px-4 pb-6 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight text-slate-900 sm:text-base">
            Today's Menu
          </h2>
          <button
            onClick={() => {
              setActiveCategory(null);
              setQuery("");
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#008542] hover:underline"
          >
            All <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white" aria-hidden="true">
                <div className="aspect-square animate-pulse bg-slate-100 motion-reduce:animate-none" />
                <div className="space-y-2 p-3">
                  <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
                  <div className="h-3 w-3/5 animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
                  <div className="h-8 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            No food found for this search.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
            {visible.map((food) => {
              const soldOut = food.is_available === false;
              return (
              <article
                key={food.id}
                onClick={() => {
                  if (soldOut) {
                    toast.error("Kimeisha kwa Leo · Sold Out");
                    return;
                  }
                  openDish(food.id);
                }}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all ${
                  soldOut ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:shadow-sm"
                }`}
              >
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  {food.image_url && (
                    <img
                      src={food.image_url}
                      alt={food.name}
                      loading="lazy"
                      decoding="async"
                      className={`h-full w-full object-cover transition-transform duration-700 ${
                        soldOut ? "grayscale" : "group-hover:scale-105"
                      }`}
                    />
                  )}
                  {soldOut && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/45">
                      <span className="rounded-full bg-slate-900/90 px-3 py-1 text-center text-[10px] font-extrabold uppercase tracking-wide text-white shadow-md">
                        Kimeisha kwa Leo · Sold Out
                      </span>
                    </div>
                  )}
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-slate-900 shadow-xs backdrop-blur">
                    <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                    {food.rating}
                  </span>
                  {food.day_badge && (
                    <span className="absolute right-2 top-2 inline-flex items-center rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-slate-900 shadow-xs">
                      {food.day_badge}
                    </span>
                  )}
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
                    {soldOut ? (
                      <button
                        type="button"
                        disabled
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex h-8 shrink-0 cursor-not-allowed items-center justify-center rounded-full bg-slate-200 px-3 text-[11px] font-extrabold text-slate-500"
                      >
                        Kimeisha
                      </button>
                    ) : food.day_badge ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBooking(food);
                        }}
                        className="inline-flex h-8 shrink-0 items-center justify-center rounded-full bg-amber-400 px-3 text-[11px] font-extrabold text-slate-900 shadow-xs transition-colors hover:bg-amber-500"
                      >
                        Book Now
                      </button>
                    ) : (
                      <button
                        type="button"
                        aria-label={`Add ${food.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openDish(food.id);
                        }}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#008542] text-white shadow-xs transition-colors hover:bg-[#006e36]"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
              );
            })}

          </div>
        )}
      </section>

      {/* ============ POPULAR CAMPUS RESTAURANTS ============ */}
      {vendors.length > 0 && (
        <section className="relative z-10 mx-auto max-w-5xl px-4 pb-8">
          <h2 className="text-lg font-bold text-foreground sm:text-xl">Migahawa Maarufu Chuoni</h2>
          <p className="mb-4 text-xs text-slate-500 sm:text-sm">
            Chagua mgahawa kuona menu, delivery pre-order au kuweka akiba.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {vendors.map((v) => (
                  <Link
                    key={v.id}
                    to="/msosi/vendor/$id"
                    params={{ id: v.id }}
                    className="group flex min-h-28 items-center gap-4 rounded-lg border border-border bg-surface p-4 shadow-card transition hover:border-primary/40 hover:shadow-soft"
                  >
                    {v.logo_url ? (
                      <img
                        src={v.logo_url}
                        alt={v.name}
                        loading="lazy"
                        decoding="async"
                        className="h-16 w-16 rounded-lg border border-border object-cover"
                      />
                    ) : (
                      <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border border-border bg-primary-soft text-primary">
                        <Store className="h-6 w-6" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1 text-left"><strong className="block truncate text-sm text-foreground">{v.name}</strong><span className="mt-1 block truncate text-xs text-muted-foreground">{v.location || "MUST Campus"}</span><span className="mt-1 block truncate text-xs text-muted-foreground">{v.operating_hours || "View menu & hours"}</span></span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                  </Link>
              ))}
          </div>
        </section>
      )}

      {/* ============ PARTNER WITH US ============ */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pb-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent-foreground">
                MUST Market Partners
              </span>
              <h2 className="mt-3 text-xl font-extrabold leading-tight tracking-tight text-foreground sm:text-2xl">
                Je, una Mgahawa,  au Unataka Kufanya Delivery?
              </h2>
              <p className="mt-2 max-w-xl text-sm font-medium text-muted-foreground">
                Kuza biashara yako ya chakula au pata kipato cha ziada kwa kuwafikia wanafunzi
                wote wa MUST!
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 sm:items-end">
              <div className="grid h-20 w-20 place-items-center rounded-2xl bg-primary-soft text-primary sm:h-24 sm:w-24">
                <Store className="h-9 w-9 sm:h-10 sm:w-10" />
              </div>
              <button
                type="button"
                onClick={() => setPartnerOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-accent-foreground shadow-md transition-transform hover:scale-[1.02]"
              >
                Jisajili Kama Partner
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS + REFERRAL ============ */}
      <HowItWorks />
      <ReferralCard />

      <div className="relative z-10 hidden md:block">
        <Footer />
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-around border-t border-slate-200 bg-white/95 py-2.5 backdrop-blur-md md:hidden">
        {BOTTOM_TABS.map((tab) => {
          const Icon = tab.icon;
          const cls = `flex flex-col items-center gap-0.5 px-2 text-[10px] font-semibold transition-colors ${
            tab.active ? "text-[#008542]" : "text-slate-400"
          }`;
          if (tab.key === "help") {
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setHelpOpen(true)}
                className={cls}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          }
          const to =
            tab.key === "account"
              ? "/profile"
              : tab.key === "orders"
                ? "/orders"
                : "/msosi";
          return (
            <Link key={tab.key} to={to} className={cls}>
              <Icon className="h-5 w-5" />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <HelpDrawer open={helpOpen} onClose={() => setHelpOpen(false)} />

      {partnerOpen && <PartnerModal onClose={() => setPartnerOpen(false)} />}

      {booking && (
        <BookingModal
          itemId={booking.id}
          itemName={booking.name}
          dayBadge={booking.day_badge}
          onClose={() => setBooking(null)}
        />
      )}
    </div>
  );
}
