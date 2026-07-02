import { MapPin, ShieldCheck, Eye } from "lucide-react";
import { type DemoProduct, formatTsh } from "@/lib/demo-data";

const conditionStyle: Record<DemoProduct["condition"], string> = {
  "Like New": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Good: "bg-sky-50 text-sky-700 ring-sky-600/20",
  Fair: "bg-amber-50 text-amber-800 ring-amber-600/20",
};

export function ProductCard({
  product,
  onQuickView,
}: {
  product: DemoProduct;
  onQuickView: (p: DemoProduct) => void;
}) {
  return (
    <article className="card-hover group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${product.gradient} transition-transform duration-700 group-hover:scale-105`}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)]" />
        <div className="absolute inset-0 grid place-items-center text-6xl opacity-90 drop-shadow-lg">
          {product.emoji}
        </div>

        {/* Price badge */}
        <div className="absolute left-3 top-3 rounded-full bg-accent/95 px-3 py-1 text-xs font-bold text-accent-foreground shadow-[var(--shadow-amber)] backdrop-blur">
          {formatTsh(product.price)}
        </div>

        {/* Condition */}
        <div
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${conditionStyle[product.condition]} backdrop-blur`}
        >
          {product.condition}
        </div>

        {/* Quick view */}
        <button
          type="button"
          onClick={() => onQuickView(product)}
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 translate-y-3 items-center gap-1.5 rounded-full bg-surface/95 px-3.5 py-2 text-xs font-semibold text-foreground opacity-0 shadow-lift backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Eye className="h-3.5 w-3.5" /> Quick view
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground sm:text-[15px]">
          {product.title}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{product.location}</span>
          </span>
          {product.seller.verified && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary">
              <ShieldCheck className="h-3 w-3" /> Verified
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
