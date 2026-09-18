import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BadgeCheck, Wrench } from "lucide-react";
import { fetchActiveServiceCount } from "@/lib/campus-services";

const PILLS = [
  { icon: "📱", label: "Phone Repair" },
  { icon: "🧺", label: "Laundry & Pasi" },
  { icon: "🧹", label: "Usafi wa Gheto" },
  { icon: "🖨️", label: "Printing & Stationery" },
];

/** Scannable overview card that funnels marketplace visitors into /services. */
export function ServiceMallBanner() {
  const { data: count = 0 } = useQuery({
    queryKey: ["campus-services-count"],
    queryFn: fetchActiveServiceCount,
  });

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Link
        to="/services"
        className="card-hover group block rounded-2xl border border-border bg-surface p-5 shadow-card transition-colors hover:border-primary/30 sm:p-7"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary">
              <Wrench className="h-3.5 w-3.5" />
              MUST Campus Service Mall
            </span>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Need a Tech Repair, Laundry, or Room Cleaning?
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
              Find trusted student &amp; local service providers right here on campus.
            </p>

            <div className="scrollbar-none -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              {PILLS.map((pill) => (
                <span
                  key={pill.label}
                  className="shrink-0 rounded-full border border-border bg-surface-2 px-3.5 py-2 text-xs font-semibold text-foreground"
                >
                  <span aria-hidden="true">{pill.icon}</span> {pill.label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
            {count > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                <BadgeCheck className="h-4 w-4" />
                {count}+ Verified Providers Available
              </span>
            )}
            <span className="btn-shine inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-accent-foreground shadow-[var(--shadow-amber)] transition-transform group-hover:-translate-y-0.5">
              Explore Service Mall
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
