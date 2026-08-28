import { Link } from "@tanstack/react-router";
import { ArrowRight, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { Footer } from "@/components/footer";

/**
 * Entrance portal for the MUST Market multi-service ecosystem.
 * Dual conversion cards route users to the Marketplace (/market)
 * or Msosi Fasta express delivery (/msosi).
 */
export function Portal() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAFBF6]">
      {/* Ambient top radial glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
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

      <main className="relative z-10 flex flex-col items-center px-4 pb-16 pt-16 sm:pt-24">
        {/* Hero header */}
        <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-white/90 px-3.5 py-1 text-xs font-semibold text-emerald-800 shadow-2xs">
            Soko la kuaminika la wanafunzi wa MUST
          </span>
          <h1 className="mb-2 text-2xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-3xl">
            Karibu <span className="text-[#008542]">MUST Market</span>
          </h1>
          <p className="text-sm font-medium text-slate-600">
            Chagua huduma uipendayo kuanza:
          </p>
        </div>

        {/* Dual conversion cards */}
        <div className="relative z-10 mx-auto mb-10 grid w-full max-w-3xl grid-cols-1 gap-4 px-4 md:grid-cols-2">
          {/* CARD 1: MARKETPLACE */}
          <Link
            to="/market"
            className="group block rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-2xs backdrop-blur-sm transition-all hover:shadow-sm"
          >
            <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#008542]">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <h2 className="mb-1 text-lg font-semibold text-slate-900">
              Marketplace (Sokoni)
            </h2>
            <p className="mb-3 text-xs leading-relaxed text-slate-600">
              Nunua na uze vitu used, vifaa vya masomo na gheto kwa uhakika.
            </p>
            <div className="mb-2 flex flex-wrap gap-1.5">
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600">
                Vyumba
              </span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600">
                Tech
              </span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600">
                Freshers
              </span>
            </div>
            <span className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#008542] py-2.5 text-xs font-medium text-white shadow-xs transition-colors group-hover:bg-[#006e36] sm:text-sm">
              Ingia Sokoni <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          {/* CARD 2: MSOSI FASTA */}
          <Link
            to="/msosi"
            className="group block rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-2xs backdrop-blur-sm transition-all hover:shadow-sm"
          >
            <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <h2 className="mb-1 text-lg font-semibold text-slate-900">
              Msosi Fasta
            </h2>
            <p className="mb-3 text-xs leading-relaxed text-slate-600">
              Agiza msosi utokeapo cafeterias ufikishiwe mlangoni kwa dk chache.
            </p>
            <div className="mb-2">
              <span className="rounded-md border border-orange-200/60 bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-600">
                Express Campus Delivery
              </span>
            </div>
            <span className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#008542] py-2.5 text-xs font-medium text-white shadow-xs transition-colors group-hover:bg-[#006e36] sm:text-sm">
              Agiza Msosi sasa <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>

        {/* Trust strip */}
        <p className="relative z-10 text-center text-[11px] font-medium text-slate-400">
          MUST Market · kwa wanafunzi, na wanafunzi · Mbeya University of Science and Technology
        </p>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
