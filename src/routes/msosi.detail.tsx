import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Heart,
  Star,
  Flame,
  Clock,
  Plus,
  Minus,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/msosi/detail")({
  head: () => ({
    meta: [
      { title: "Chips Kuku — Msosi Fasta | MUST Market" },
      {
        name: "description",
        content:
          "Agiza Chips Kuku kutoka Mama Lishe, MUST Cafeteria. Ongeza viongezo, eleza maelezo, na malipo kwa haraka — Msosi Fasta.",
      },
      { property: "og:title", content: "Chips Kuku — Msosi Fasta" },
      {
        property: "og:description",
        content: "Agiza Chips Kuku ufiwe mlangoni kwa dk chache. Msosi Fasta.",
      },
      { property: "og:url", content: "https://must-campus-swap.lovable.app/msosi/detail" },
    ],
    links: [{ rel: "canonical", href: "https://must-campus-swap.lovable.app/msosi/detail" }],
  }),
  component: MsosiDetail,
});

/* ----------------------------- Static dish data ----------------------------- */

const BASE_PRICE = 7500;
const SODA_PRICE = 1000;

function formatTsh(n: number) {
  return `TSh ${n.toLocaleString("en-US")}`;
}

/* ----------------------------- Component ----------------------------- */

function MsosiDetail() {
  const [quantity, setQuantity] = useState(1);
  const [addSoda, setAddSoda] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [notes, setNotes] = useState("");

  const unitPrice = BASE_PRICE + (addSoda ? SODA_PRICE : 0);
  const total = unitPrice * quantity;

  const increment = () => setQuantity((q) => Math.min(q + 1, 20));
  const decrement = () => setQuantity((q) => Math.max(q - 1, 1));

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAFBF6]">
      {/* Dot-matrix pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* ===================== HERO IMAGE + OVERLAY NAV ===================== */}
      <div className="relative">
        {/* Hero banner */}
        <div className="relative h-[280px] w-full overflow-hidden md:h-[350px]">
          {/* Simulated dish image — gradient + emoji stand-in for the photo */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(255,255,255,0.55),transparent_60%)]" />
          <div className="absolute inset-0 grid place-items-center text-[7rem] drop-shadow-lg md:text-[9rem]">
            <span className="select-none">🍗</span>
          </div>
          {/* Dark gradient at top for nav contrast */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 to-transparent" />

          {/* Top nav overlay */}
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4">
            <Link
              to="/msosi"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white shadow-md backdrop-blur-md transition-colors hover:bg-black/50"
              aria-label="Rudi kwenye menu"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <button
              type="button"
              onClick={() => setFavorite((f) => !f)}
              aria-label={favorite ? "Ondoa kwenye vipendwa" : "Ongeza kwenye vipendwa"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white shadow-md backdrop-blur-md transition-colors hover:bg-black/50"
            >
              <Heart
                className={`h-5 w-5 transition-colors ${favorite ? "fill-rose-500 text-rose-500" : "text-white"}`}
              />
            </button>
          </div>
        </div>

        {/* Rounded top-sheet transition for content */}
        <div className="relative z-10 -mt-4 rounded-t-3xl bg-[#FAFBF6]" />
      </div>

      {/* ===================== MAIN CONTENT ===================== */}
      <main className="relative z-10 mx-auto max-w-2xl px-4 pb-32">
        {/* Dish header */}
        <div className="-mt-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-900">
              Chips Kuku
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Vendor: Mama Lishe, MUST Cafeteria
            </p>
          </div>
          <span className="shrink-0 rounded-lg bg-amber-400 px-3 py-1.5 text-sm font-bold text-amber-950 shadow-xs">
            {formatTsh(BASE_PRICE)}
          </span>
        </div>

        {/* Badges row */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-900 shadow-xs ring-1 ring-slate-200">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            4.8 (85+ ratings)
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-[#008542] ring-1 ring-emerald-100">
            <Flame className="h-3 w-3" />
            Popular
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-xs ring-1 ring-slate-200">
            <Clock className="h-3 w-3" />
            15-20 min
          </span>
        </div>

        {/* Description */}
        <p className="mt-5 text-sm leading-relaxed text-slate-600">
          Chips kavu za dhahabu zilizokaangwa vizuri, pamoja na kuku wa kuchoma
          wenye viungo vya asili, mchuzi wa kawaida na kachumbari safi. Sehemu
          kubwa ya kutosha kwa mwanafunzi mwenye njaa!
        </p>

        {/* ===================== ADD-ONS ===================== */}
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-bold tracking-tight text-slate-900">
            Viongezo (hiari)
          </h2>
          <button
            type="button"
            onClick={() => setAddSoda((v) => !v)}
            aria-pressed={addSoda}
            className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
              addSoda
                ? "border-[#008542] bg-emerald-50/60 ring-1 ring-[#008542]/30"
                : "border-slate-200 bg-white hover:border-[#008542]/40"
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                addSoda ? "border-[#008542] bg-[#008542] text-white" : "border-slate-300 bg-white"
              }`}
            >
              {addSoda && <Check className="h-3.5 w-3.5" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-900">
                Add Soda (Azam/Coca-Cola)
              </span>
              <span className="block text-xs text-slate-500">Baridi, tatu 500ml</span>
            </span>
            <span className="shrink-0 text-sm font-bold text-[#008542]">
              + {formatTsh(SODA_PRICE)}
            </span>
          </button>
        </section>

        {/* ===================== SPECIAL INSTRUCTIONS ===================== */}
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-bold tracking-tight text-slate-900">
            Maelezo ya ziada
          </h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g., No salt on chips, weka pilipili pembeni..."
            className="h-24 w-full rounded-xl border border-slate-200 bg-white p-4 placeholder:text-slate-400 outline-none focus:border-[#008542]"
          />
        </section>

        {/* Summary line */}
        <div className="mt-5 flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm shadow-xs ring-1 ring-slate-200">
          <span className="font-medium text-slate-500">Bei ya kitengo</span>
          <span className="font-bold text-slate-900">{formatTsh(unitPrice)}</span>
        </div>
      </main>

      {/* ===================== FIXED BOTTOM ACTION BAR ===================== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 border-t border-slate-200 bg-white/95 p-4 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md">
        {/* Quantity selector */}
        <div className="flex h-[48px] w-[100px] shrink-0 items-center justify-between rounded-full bg-slate-100 px-2">
          <button
            type="button"
            onClick={decrement}
            aria-label="Punguza idadi"
            className="grid h-8 w-8 place-items-center rounded-full text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-40"
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-6 text-center text-sm font-bold text-slate-900">
            {quantity}
          </span>
          <button
            type="button"
            onClick={increment}
            aria-label="Ongeza idadi"
            className="grid h-8 w-8 place-items-center rounded-full text-slate-700 transition-colors hover:bg-slate-200"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* CTA button */}
        <button
          type="button"
          className="flex h-[48px] flex-1 items-center justify-between overflow-hidden rounded-full bg-[#008542] px-4 text-white shadow-md transition-colors hover:bg-[#006e36]"
        >
          <span className="whitespace-nowrap text-xs font-bold sm:text-sm">
            Endelea Kwenye Malipo
          </span>
          <span className="whitespace-nowrap text-xs font-bold sm:text-sm">
            {formatTsh(total)}
          </span>
        </button>
      </div>
    </div>
  );
}
