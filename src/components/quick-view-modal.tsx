import { X, MapPin, ShieldCheck, MessageCircle, AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { type DemoProduct, formatTsh } from "@/lib/demo-data";

export function QuickViewModal({
  product,
  onClose,
}: {
  product: DemoProduct | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!product) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-surface shadow-lift animate-scale-in sm:max-h-[90vh] sm:rounded-3xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-surface/90 text-foreground shadow-soft backdrop-blur transition-transform hover:scale-105"
          aria-label="Close"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <div className="grid flex-1 grid-cols-1 overflow-y-auto md:grid-cols-2">
          {/* Image */}
          <div
            className={`relative min-h-[280px] bg-gradient-to-br ${product.gradient} md:min-h-full`}
          >
            <div className="absolute inset-0 grid place-items-center text-8xl drop-shadow-2xl">
              {product.emoji}
            </div>
            <div className="absolute left-4 top-4 rounded-full bg-accent px-3.5 py-1.5 text-sm font-bold text-accent-foreground shadow-[var(--shadow-amber)]">
              {formatTsh(product.price)}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4 p-6 sm:p-7">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-primary-soft px-2.5 py-1 font-semibold text-primary">
                {product.category}
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                {product.condition}
              </span>
            </div>

            <h2 className="text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
              {product.title}
            </h2>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {/* Seller */}
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-2 p-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {product.seller.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {product.seller.name}
                  </span>
                  {product.seller.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                  )}
                </div>
                <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {product.location}
                </div>
              </div>
            </div>

            {/* Safety */}
            <div className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 ring-1 ring-inset ring-amber-600/20">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Always meet in a public campus spot, inspect the item, and never pay before you see it.
              </span>
            </div>

            {/* CTA */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Hi, I saw "${product.title}" on MUST Market. Is it still available?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shine inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 text-sm font-semibold text-white shadow-lift transition-transform hover:-translate-y-0.5"
            >
              <MessageCircle className="h-4.5 w-4.5" strokeWidth={2.5} />
              Contact Seller via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
