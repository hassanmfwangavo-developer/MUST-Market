import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  Star,
  Clock,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/msosi-detail")({
  head: () => ({
    meta: [
      { title: "Msosi Fasta — Order Detail | MUST Market" },
      {
        name: "description",
        content:
          "Pitiliza agizo lako la chakula. Ongeza soda, chagua idadi na endelea kwenye malipo. Msosi Fasta — MUST Market.",
      },
      { property: "og:title", content: "Msosi Fasta — Order Detail" },
      {
        property: "og:description",
        content: "Pitiliza agizo lako na endelea kwenye malipo haraka.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://must-campus-swap.lovable.app/msosi-detail" },
    ],
  }),
  component: MsosiDetail,
});

/* ----------------------------- Static template data ----------------------------- */

const BASE_PRICE = 3500;

interface AddOn {
  id: string;
  label: string;
  price: number;
  emoji: string;
}

// Only ONE add-on remains — Soda (Azam/Coca-Cola).
const ADDONS: AddOn[] = [
  { id: "soda", label: "Add Soda (Azam/Coca-Cola)", price: 1000, emoji: "🥤" },
];

function formatTsh(n: number) {
  return `TZS ${n.toLocaleString("en-US")}`;
}

/* ----------------------------- Component ----------------------------- */

function MsosiDetail() {
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});

  const addOnTotal = ADDONS.reduce(
    (sum, a) => sum + (selectedAddons[a.id] ? a.price : 0),
    0,
  );
  const unitTotal = BASE_PRICE + addOnTotal;
  const grandTotal = unitTotal * quantity;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAFBF6] pb-32 md:pb-0">
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
          <div className="flex items-center gap-3">
            <Link
              to="/msosi"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:text-[#008542]"
              aria-label="Rudi kwenye Msosi Fasta"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-extrabold leading-tight tracking-tight text-slate-900 sm:text-lg">
                Msosi <span className="text-[#008542]">Fasta</span>
              </h1>
              <p className="truncate text-[11px] font-medium text-slate-500">
                Pitiliza agizo lako
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#008542]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#008542]">
              <Clock className="h-3 w-3" />
              Dk 15
            </span>
          </div>
        </div>
      </header>

      {/* ===================== HERO DISH IMAGE ===================== */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pt-4">
        <div className="relative overflow-hidden rounded-2xl shadow-xs">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(255,255,255,0.55),transparent_60%)]" />
          <div className="relative grid place-items-center py-10 text-[7rem] drop-shadow-lg sm:py-14 sm:text-[9rem]">
            <span className="select-none">🍗</span>
          </div>

          {/* Rating + popular badge */}
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-slate-900 shadow-xs backdrop-blur">
              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              4.8
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-950 shadow-xs">
              <Flame className="h-3 w-3" />
              Maarufu
            </span>
          </div>
        </div>
      </section>

      {/* ===================== DISH DETAILS ===================== */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pt-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <h2 className="text-lg font-extrabold leading-tight tracking-tight text-slate-900 sm:text-xl">
            Wali Kuku wa Mchana
          </h2>
          <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">
            Cafeteria ya Block E · MUST
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
              <Clock className="h-3 w-3 text-[#008542]" />
              Inafiwa ndani ya 15 dakika
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
              <MapPin className="h-3 w-3 text-[#008542]" />
              Mlangoni mwa hostel
            </span>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Wali wa kupasha joto, kuku wa kupikwa kwa viungo asilia, mtindi na
            kachumbari ya mboga safi za shambani. Sahani kamili ya kumshibisha
            mwanafunzi mzima kwa mchana.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-400 px-2.5 py-1 text-xs font-bold text-amber-950 shadow-xs">
              {formatTsh(BASE_PRICE)}
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              / sahani
            </span>
          </div>
        </div>
      </section>

      {/* ===================== ADD-ONS ===================== */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pt-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <h3 className="text-sm font-bold tracking-tight text-slate-900">
            Ongeza (Optional)
          </h3>
          <p className="mt-0.5 text-[11px] font-medium text-slate-500">
            Chagua nyongeza unazotaka kwenye agizo lako
          </p>

          <div className="mt-3 flex flex-col gap-2">
            {ADDONS.map((addon) => {
              const checked = !!selectedAddons[addon.id];
              return (
                <button
                  key={addon.id}
                  type="button"
                  onClick={() =>
                    setSelectedAddons((prev) => ({
                      ...prev,
                      [addon.id]: !prev[addon.id],
                    }))
                  }
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    checked
                      ? "border-[#008542] bg-[#008542]/5 ring-1 ring-[#008542]/20"
                      : "border-slate-200 bg-white hover:border-[#008542]/40"
                  }`}
                >
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors ${
                      checked
                        ? "border-[#008542] bg-[#008542] text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {checked && (
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-3.5 w-3.5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.1 3.1 6.8-6.8a1 1 0 0 1 1.4 0Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </span>
                  <span className="text-2xl leading-none">{addon.emoji}</span>
                  <span className="flex-1 text-xs font-semibold text-slate-800 sm:text-sm">
                    {addon.label}
                  </span>
                  <span className="whitespace-nowrap text-xs font-bold text-[#008542]">
                    +{formatTsh(addon.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== SAFETY NOTE ===================== */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pt-4">
        <div className="flex items-start gap-2.5 rounded-xl border border-[#008542]/20 bg-[#008542]/5 p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#008542]" />
          <p className="text-[11px] font-medium leading-snug text-slate-600">
            Chakula kinapikwa kwa usafi kamili na kufikishiwa mlangoni. Hakuna
            malipo ya ziada ya usafirishaji ndani ya MUST.
          </p>
        </div>
      </section>

      {/* ===================== FOOTER (desktop) ===================== */}
      <div className="relative z-10 hidden md:block">
        <Footer />
      </div>

      {/* ===================== FIXED STICKY BOTTOM BAR ===================== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          {/* Quantity selector — compact */}
          <div className="flex h-[48px] w-[100px] shrink-0 items-center justify-between rounded-full bg-slate-100 px-2">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Punguza idadi"
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-700 shadow-xs transition-colors hover:text-[#008542] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[1.5rem] text-center text-sm font-extrabold text-slate-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              aria-label="Ongeza idadi"
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-700 shadow-xs transition-colors hover:text-[#008542]"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Continue-to-checkout button — full flex priority */}
          <button
            type="button"
            className="flex h-[48px] flex-1 items-center justify-between rounded-full bg-[#008542] px-4 font-bold text-white shadow-md transition-colors hover:bg-[#006e36]"
          >
            <span className="flex items-center gap-1.5 whitespace-nowrap text-xs sm:text-sm">
              Endelea Kwenye Malipo
              <ChevronRight className="h-4 w-4" />
            </span>
            <span className="whitespace-nowrap rounded-full bg-white/20 px-2.5 py-1 text-xs font-extrabold sm:text-sm">
              {formatTsh(grandTotal)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
