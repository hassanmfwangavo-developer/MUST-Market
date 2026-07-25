import { Sparkles, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { categories } from "@/lib/demo-data";
import { openAuthModal, useAuthUser } from "@/lib/auth-store";

function CountUp({
  target,
  suffix = "",
  duration = 1500,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return (
    <>
      {value.toLocaleString("en-US")}
      {suffix}
    </>
  );
}

export function Hero() {
  const navigate = useNavigate();
  const { user } = useAuthUser();
  const goSell = () => {
    if (user) navigate({ to: "/sell" });
    else openAuthModal("/sell");
  };
  return (
    <section className="hero-gradient relative overflow-hidden">
      <div className="mesh-dots absolute inset-0 opacity-70" />
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8">
        {/* Trust chip */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-surface/70 px-3.5 py-1.5 text-xs font-medium text-primary shadow-soft backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5" />
            Trusted marketplace for Mbeya University students
          </div>
        </div>

        <h1 className="mx-auto mt-6 max-w-3xl text-center text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Buy &amp; sell used student items at{" "}
          <span className="relative inline-block whitespace-nowrap">
            <span className="text-primary">MUST</span> instantly
            <svg
              aria-hidden
              viewBox="0 0 260 12"
              className="absolute -bottom-1.5 left-0 h-2.5 w-full text-accent"
              preserveAspectRatio="none"
            >
              <path
                d="M2 8 Q 65 -2, 130 5 T 258 6"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </span>
          .
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-center text-base text-muted-foreground sm:text-lg">
          Buy & sell campus essentials. Connect via WhatsApp instantly.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={goSell}
            className="btn-shine group inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-accent-foreground shadow-[var(--shadow-amber)] transition-transform hover:-translate-y-0.5 sm:w-auto"
          >
            <Sparkles className="h-4 w-4" strokeWidth={2.5} />
            Sell for Free
          </button>
          <a
            href="#browse"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border-2 border-primary/80 bg-surface px-6 py-3.5 text-sm font-semibold text-primary shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary-soft sm:w-auto"
          >
            Browse the Marketplace
          </a>
        </div>

        {/* Category pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {categories.map((c) => (
            <a
              key={c.slug}
              href={`#${c.slug}`}
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-card"
            >
              <span className="text-base transition-transform group-hover:scale-110">
                {c.emoji}
              </span>
              {c.name}
            </a>
          ))}
        </div>

        {/* Social proof strip */}
        <div className="mt-6 grid grid-cols-3 gap-3 sm:mt-10 sm:gap-6">
          {[
            { node: <CountUp target={90} suffix="+" />, v: "Active listings" },
            { node: <CountUp target={1700} suffix="+" />, v: "MUST students" },
            { node: <>&lt; 2 min</>, v: "Avg. reply time" },
          ].map((s) => (
            <div
              key={s.v}
              className="rounded-2xl border border-border bg-surface/70 px-3 py-4 text-center shadow-soft backdrop-blur sm:px-6"
            >
              <div className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {s.node}
              </div>
              <div className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                {s.v}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
