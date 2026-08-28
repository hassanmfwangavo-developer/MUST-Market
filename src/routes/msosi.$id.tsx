import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Heart,
  Star,
  Flame,
  Clock,
  Plus,
  Minus,
  Check,
  MapPin,
} from "lucide-react";
import { fetchMenuItem, formatTsh, SODA_PRICE } from "@/lib/menu";

export const Route = createFileRoute("/msosi/$id")({
  head: () => ({
    meta: [
      { title: "Agiza Chakula — Msosi Fasta | MUST Market" },
      {
        name: "description",
        content:
          "Chagua chakula chako, ongeza viongezo na maelezo ya ziada, kisha endelea kwenye malipo — Msosi Fasta ya MUST Market.",
      },
      { property: "og:title", content: "Agiza Chakula — Msosi Fasta" },
      {
        property: "og:description",
        content: "Agiza chakula ufikishiwe mlangoni kwa dakika chache. Msosi Fasta.",
      },
      { property: "og:type", content: "product" },
    ],
  }),
  component: MsosiDetail,
  errorComponent: ({ error }) => (
    <div className="grid min-h-screen place-items-center p-6 text-center" role="alert">
      <p className="text-sm text-slate-600">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <p className="text-sm text-slate-600">Chakula hiki hakipatikani.</p>
    </div>
  ),
});

function MsosiDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [addSoda, setAddSoda] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [notes, setNotes] = useState("");

  const { data: dish, isLoading } = useQuery({
    queryKey: ["menu_item", id],
    queryFn: () => fetchMenuItem(id),
  });

  const increment = () => setQuantity((q) => Math.min(q + 1, 20));
  const decrement = () => setQuantity((q) => Math.max(q - 1, 1));

  if (isLoading || !dish) {
    return (
      <div className="min-h-screen bg-[#FAFBF6]">
        <div className="h-[280px] w-full animate-pulse bg-slate-200 md:h-[350px]" />
        <div className="mx-auto max-w-2xl space-y-3 p-4">
          <div className="h-7 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
          <div className="h-24 w-full animate-pulse rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }

  const total = dish.price * quantity + (addSoda ? SODA_PRICE : 0);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAFBF6]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* ===================== HERO IMAGE + OVERLAY NAV ===================== */}
      <div className="relative h-[280px] w-full overflow-hidden bg-slate-200 md:h-[350px]">
        {dish.image_url && (
          <img
            src={dish.image_url}
            alt={dish.name}
            decoding="async"
            className="h-full w-full object-cover"
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent" />

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

      {/* ===================== CONTENT SHEET (overlaps hero) ===================== */}
      <main className="relative z-10 mx-auto -mt-6 max-w-2xl rounded-t-3xl bg-[#FAFBF6] px-4 pb-32 pt-6">
        {/* Title row */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl">
              {dish.name}
            </h1>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#008542]" />
              <span className="truncate">{dish.vendor_name}</span>
            </p>
          </div>
          <span className="shrink-0 rounded-xl bg-amber-400 px-3 py-1.5 text-sm font-bold text-amber-950 shadow-xs">
            {formatTsh(dish.price, "TSh")}
          </span>
        </div>

        {/* Badges row */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-900 shadow-xs ring-1 ring-slate-200">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {dish.rating} (85+ ratings)
          </span>
          {dish.is_popular && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-[#008542] ring-1 ring-emerald-100">
              <Flame className="h-3 w-3" />
              Popular
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-xs ring-1 ring-slate-200">
            <Clock className="h-3 w-3" />
            {dish.prep_time}
          </span>
        </div>

        {dish.description && (
          <p className="mt-5 text-sm leading-relaxed text-slate-600">
            {dish.description}
          </p>
        )}

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
              <span className="block text-xs text-slate-500">Baridi, 500ml</span>
            </span>
            <span className="shrink-0 text-sm font-bold text-[#008542]">
              + {formatTsh(SODA_PRICE, "TSh")}
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

        <div className="mt-5 flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm shadow-xs ring-1 ring-slate-200">
          <span className="font-medium text-slate-500">Bei ya kitengo</span>
          <span className="font-bold text-slate-900">{formatTsh(dish.price, "TSh")}</span>
        </div>
      </main>

      {/* ===================== FIXED BOTTOM ACTION BAR ===================== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 border-t border-slate-200 bg-white/95 p-4 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md">
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

        <button
          type="button"
          onClick={() =>
            navigate({
              to: "/msosi/checkout",
              state: {
                itemId: dish.id,
                name: dish.name,
                price: dish.price,
                imageUrl: dish.image_url,
                vendorName: dish.vendor_name,
                quantity,
                addSoda,
              },
            })
          }
          className="flex h-[48px] flex-1 items-center justify-between overflow-hidden rounded-full bg-[#008542] px-4 text-white shadow-md transition-colors hover:bg-[#006e36]"
        >
          <span className="whitespace-nowrap text-xs font-bold sm:text-sm">
            Endelea Kwenye Malipo
          </span>
          <span className="whitespace-nowrap text-xs font-bold sm:text-sm">
            {formatTsh(total, "TSh")}
          </span>
        </button>
      </div>
    </div>
  );
}
