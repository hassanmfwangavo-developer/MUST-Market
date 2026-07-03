import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { categories } from "@/lib/demo-data";

export function Hero() {
  return (
    <section className="hero-gradient relative overflow-hidden">
      <div className="mesh-dots absolute inset-0 opacity-70" />
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8">
        {/* Trust chip */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-surface/70 px-3.5 py-1.5 text-xs font-medium text-primary shadow-soft backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5" />
            Trusted marketplace for Mbeya University students
          </div>
        </div>

        <h1 className="mx-auto mt-6 max-w-3xl text-center text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Buy & sell used student gear
          <br className="hidden sm:block" />
          <span className="relative inline-block">
            at{" "}
            <span className="text-primary">MUST</span>{" "}
            <span className="relative">
              instantly
              <svg
                aria-hidden
                viewBox="0 0 220 12"
                className="absolute -bottom-1.5 left-0 h-2.5 w-full text-accent"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 8 Q 55 -2, 110 5 T 218 6"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>
            .
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-center text-base text-muted-foreground sm:text-lg">
          From laptops to lamps to lecture notes. Buy nearby, pay less, and reach fellow
          students on WhatsApp in one tap — no shipping, no strangers.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/sell"
            className="btn-shine group inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-amber)] transition-transform hover:-translate-y-0.5 sm:w-auto"
          >
            <Sparkles className="h-4 w-4" strokeWidth={2.5} />
            Sell an Item — it's free
          </Link>
          <a
            href="#browse"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-surface px-6 py-3.5 text-sm font-semibold text-foreground shadow-soft transition-colors hover:border-primary/40 hover:text-primary sm:w-auto"
          >
            Browse the market
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        {/* Category pills */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
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
        <div className="mt-14 grid grid-cols-3 gap-3 sm:mt-16 sm:gap-6">
          {[
            { k: "1,200+", v: "Active listings" },
            { k: "3,400+", v: "MUST students" },
            { k: "< 2 min", v: "Avg. reply time" },
          ].map((s) => (
            <div
              key={s.v}
              className="rounded-2xl border border-border bg-surface/70 px-3 py-4 text-center shadow-soft backdrop-blur sm:px-6"
            >
              <div className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {s.k}
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
