import { MapPin, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { type DemoProduct, formatTsh } from "@/lib/demo-data";
import { SmartImage } from "@/components/smart-image";
import { thumbUrl, imageSrcSet } from "@/lib/images";

const conditionStyle: Record<DemoProduct["condition"], string> = {
  "Like New": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Good: "bg-sky-50 text-sky-700 ring-sky-600/20",
  Fair: "bg-amber-50 text-amber-800 ring-amber-600/20",
};

export function ProductCard({ product }: { product: DemoProduct }) {
  const isSold = product.status === "sold";

  return (
    <article
      className={`card-hover group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-soft ${
        isSold ? "opacity-90" : ""
      }`}
    >
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="relative block overflow-hidden"
      >
        <div className={isSold ? "saturate-50" : ""}>
          <SmartImage
            src={product.image ? thumbUrl(product.image) : undefined}
            srcSet={product.image ? imageSrcSet(product.image, [200, 400, 600]) : undefined}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            alt={product.title}
            aspect="aspect-[4/5]"
            className="transition-transform duration-700 group-hover:scale-105"
            fallback={
              <>
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${product.gradient} transition-transform duration-700 group-hover:scale-105`}
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)]" />
                <div className="absolute inset-0 grid place-items-center text-6xl opacity-90 drop-shadow-lg">
                  {product.emoji}
                </div>
              </>
            }
          />
        </div>

        {isSold && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-slate-900/55 backdrop-blur-[1px]">
            <span className="-rotate-6 rounded-lg bg-destructive px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-destructive-foreground shadow-lift sm:text-sm">
              Sold out! 🔥
            </span>
          </div>
        )}

        <div className="absolute left-3 top-3 rounded-full bg-accent/95 px-3 py-1 text-xs font-bold text-accent-foreground shadow-[var(--shadow-amber)] backdrop-blur">
          {formatTsh(product.price)}
        </div>

        <div
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${conditionStyle[product.condition]} backdrop-blur`}
        >
          {product.condition}
        </div>
      </Link>



      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground sm:text-[15px]">
          {product.title}
        </h3>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
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
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="mt-1 inline-flex items-center justify-between gap-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          See details
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
