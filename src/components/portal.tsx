import { Link } from "@tanstack/react-router";
import { Footer } from "@/components/footer";

/**
 * Landing / Home selection page for the MUST Market super-app.
 * Two service zones: Msosi Fasta (food) and Sokoni (marketplace).
 */
export function Portal() {
  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #F8ECD8 0%, #F1F0DE 45%, #E9F0E4 100%)",
      }}
    >
      <style>{`
        @keyframes drift1 { 0%,100% { transform: translate3d(0,0,0) rotate(0deg); } 50% { transform: translate3d(10px,-18px,0) rotate(6deg); } }
        @keyframes drift2 { 0%,100% { transform: translate3d(0,0,0) rotate(0deg); } 50% { transform: translate3d(-14px,14px,0) rotate(-8deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes steam { 0% { opacity: 0; transform: translateY(4px) scaleX(1); } 40% { opacity: .75; } 100% { opacity: 0; transform: translateY(-14px) scaleX(1.25); } }
        @keyframes bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes wheel { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .mm-drift1 { animation: drift1 9s ease-in-out infinite; }
        .mm-drift2 { animation: drift2 11s ease-in-out infinite; }
        .mm-shimmer {
          background: linear-gradient(90deg, #E4F2E7 0%, #F4FBF3 40%, #E4F2E7 80%);
          background-size: 200% 100%;
          animation: shimmer 3.2s linear infinite;
        }
        .mm-steam { transform-origin: center bottom; animation: steam 2.6s ease-out infinite; }
        .mm-steam-2 { animation-delay: .55s; }
        .mm-steam-3 { animation-delay: 1.1s; }
        .mm-bob { animation: bob 3s ease-in-out infinite; transform-origin: center; }
        .mm-wheel { animation: wheel 3.4s linear infinite; transform-origin: center; transform-box: fill-box; }
        .mm-zone { transition: transform .25s ease, box-shadow .25s ease; }
        .mm-zone:hover { transform: scale(1.012); }
        .mm-zone:active { transform: scale(0.99); }
        @media (prefers-reduced-motion: reduce) {
          .mm-drift1, .mm-drift2, .mm-shimmer, .mm-steam, .mm-bob, .mm-wheel { animation: none !important; }
        }
      `}</style>

      {/* Ambient floating emoji */}
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        <span className="mm-drift1 absolute left-[8%] top-[12%] text-4xl opacity-20">🍲</span>
        <span className="mm-drift2 absolute right-[10%] top-[18%] text-4xl opacity-20">🛒</span>
        <span className="mm-drift2 absolute left-[14%] bottom-[18%] text-4xl opacity-20">🥖</span>
        <span className="mm-drift1 absolute right-[14%] bottom-[12%] text-4xl opacity-20">📚</span>
      </div>

      <main className="relative z-10 flex flex-1 flex-col items-center px-4 pb-14 pt-14 sm:pt-20">
        {/* Hero */}
        <div className="mx-auto mb-8 flex max-w-2xl flex-col items-center text-center">
          <span
            className="mm-shimmer mb-4 inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold shadow-2xs"
            style={{ color: "#1B5E3A" }}
          >
            Soko la kuaminika la wanafunzi wa MUST
          </span>
          <h1 className="mb-2 text-2xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-3xl">
            Karibu <span style={{ color: "#1B5E3A" }}>MUST Market</span>
          </h1>
          <p className="mb-4 text-sm font-medium text-slate-600">
            Chagua huduma uipendayo kuanza
          </p>
          <span
            className="rounded-full px-3.5 py-1 text-[11px] font-semibold"
            style={{ background: "#E4F2E7", color: "#1B5E3A" }}
          >
            800+ wanafunzi · Verified
          </span>
        </div>

        {/* Zones */}
        <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
          {/* Msosi Fasta */}
          <Link
            to="/msosi"
            className="mm-zone relative block overflow-hidden rounded-3xl p-5 text-white shadow-lg"
            style={{ background: "linear-gradient(160deg, #F3B36E 0%, #E2833F 100%)" }}
          >
            <span className="absolute right-4 top-4 rounded-full bg-white/25 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
              Order in 10 min
            </span>
            <svg viewBox="0 0 120 90" className="mb-3 h-24 w-28" aria-hidden>
              <g stroke="#FFF" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9">
                <path className="mm-steam" d="M45 34 c -5 -8 5 -12 0 -20" />
                <path className="mm-steam mm-steam-2" d="M60 32 c -5 -8 5 -12 0 -20" />
                <path className="mm-steam mm-steam-3" d="M75 34 c -5 -8 5 -12 0 -20" />
              </g>
              <path d="M22 44 h76 a38 38 0 0 1 -76 0 z" fill="#FFF" opacity="0.95" />
              <rect x="16" y="41" width="88" height="7" rx="3.5" fill="#FFF" />
              <ellipse cx="60" cy="82" rx="34" ry="5" fill="#FFF" opacity="0.25" />
            </svg>
            <h2 className="text-lg font-bold">Msosi Fasta</h2>
            <p className="mb-4 mt-1 text-xs leading-relaxed text-white/90">
              Msosi utokeapo cafeterias, mlangoni kwa dk chache
            </p>
            <span
              className="flex w-full items-center justify-center rounded-xl bg-white py-2.5 text-sm font-bold shadow-xs"
              style={{ color: "#C4691E" }}
            >
              Agiza Msosi sasa
            </span>
          </Link>

          {/* Sokoni */}
          <Link
            to="/market"
            className="mm-zone relative block overflow-hidden rounded-3xl p-5 text-white shadow-lg"
            style={{ background: "linear-gradient(160deg, #6FAE7F 0%, #2E7A46 100%)" }}
          >
            <span className="absolute right-4 top-4 rounded-full bg-white/25 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
              800+ wanafunzi
            </span>
            <svg viewBox="0 0 120 90" className="mb-3 h-24 w-28" aria-hidden>
              <g className="mm-bob" stroke="#FFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none">
                <path d="M18 20 h12 l12 38 h38 l10 -26 h-52" />
              </g>
              <circle className="mm-wheel" cx="50" cy="70" r="6" fill="#FFF" />
              <circle className="mm-wheel" cx="78" cy="70" r="6" fill="#FFF" />
              <ellipse cx="60" cy="84" rx="34" ry="4" fill="#FFF" opacity="0.25" />
            </svg>
            <h2 className="text-lg font-bold">Sokoni</h2>
            <p className="mb-4 mt-1 text-xs leading-relaxed text-white/90">
              Nunua na uze vitu used, vyumba, vifaa vya masomo
            </p>
            <span
              className="flex w-full items-center justify-center rounded-xl bg-white py-2.5 text-sm font-bold shadow-xs"
              style={{ color: "#1B5E3A" }}
            >
              Ingia Sokoni
            </span>
          </Link>
        </div>

        <p className="relative z-10 mt-10 text-center text-[11px] font-medium text-slate-400">
          MUST Market · kwa wanafunzi, na wanafunzi · Mbeya University of Science and Technology
        </p>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
