import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, UtensilsCrossed } from "lucide-react";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/msosi")({
  head: () => ({
    meta: [
      { title: "Msosi Fasta — Express Campus Delivery | MUST Market" },
      {
        name: "description",
        content:
          "Agiza msosi utokeapo cafeterias na kufikishiwa mlangoni kwa dakika chache. Msosi Fasta — huduma ya haraka ya wanalunzi wa MUST.",
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

/**
 * Placeholder layout for the upcoming Msosi Fasta express-food delivery service.
 * Live ordering flow will be wired here in a follow-up build.
 */
function MsosiFasta() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAFBF6]">
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

      <main className="relative z-10 mx-auto flex max-w-xl flex-col items-center px-4 pb-16 pt-24 text-center">
        <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          <UtensilsCrossed className="h-7 w-7" />
        </div>
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-orange-200/60 bg-orange-50 px-3.5 py-1 text-xs font-semibold text-orange-600">
          Express Campus Delivery
        </span>
        <h1 className="mb-2 text-2xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-3xl">
          Msosi <span className="text-[#008542]">Fasta</span>
        </h1>
        <p className="mb-8 text-sm font-medium text-slate-600">
          Agiza msosi utokeapo cafeterias ufikishiwe mlangoni kwa dk chache.
        </p>

        <div className="w-full rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-2xs backdrop-blur-sm">
          <p className="text-sm font-semibold text-slate-900">Huduma ijaaja hivi karibuni</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Tunakusanya menu ya cafeterias za MUST na kuruhusu kuagiza chakula
            cha mchana kwa haraka. Tunakusanya feedback yako ili kujenga huduma
            inayokufaa.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#008542] px-4 py-2.5 text-xs font-medium text-white shadow-xs transition-colors hover:bg-[#006e36] sm:text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Rudi kwenye Portal
          </Link>
        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
