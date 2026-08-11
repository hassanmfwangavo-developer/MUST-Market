import { openAuthModal } from "@/lib/auth-store";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, MapPin, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { formatTsh, categoryEmoji } from "@/lib/demo-data";
import { fetchProduct, whatsappUrl, recordProductView, recordWhatsappClick, type MarketProduct } from "@/lib/products";
import { SmartImage } from "@/components/smart-image";
import { detailUrl, microUrl, imageSrcSet } from "@/lib/images";


export const Route = createFileRoute("/product/$id")({
  loader: async ({ params }) => {
    const product = await fetchProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Item not found — MUST Market" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    const title = `${product.title} · ${formatTsh(product.price)} — MUST Market`;
    const desc = product.description.slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: product.title },
        { property: "og:description", content: desc },
        ...(product.image ? [{ property: "og:image", content: product.image }] : []),
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: NotFoundPage,
  errorComponent: ({ reset }) => (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-xl font-semibold text-foreground">Could not load this item</h1>
        <button
          onClick={reset}
          className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  ),
});

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Item not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This listing may have been removed or sold.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Back to market
        </Link>
      </div>
    </div>
  );
}

function ProductPage() {
  const { product } = Route.useLoaderData();
  const counted = useRef<string | null>(null);

  useEffect(() => {
    if (counted.current === product.id) return;
    counted.current = product.id;
    void recordProductView(product.id);
  }, [product.id]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to market
        </Link>

        <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-10">
          <ProductGallery product={product} />
          <ProductDetails product={product} />
        </div>
      </main>
    </div>
  );
}

function ProductGallery({ product }: { product: MarketProduct }) {
  const hasImage = Boolean(product.image);
  const [active, setActive] = useState(0);
  // For DB items with multiple images we'd fetch them; here we render primary.
  const images = hasImage ? [product.image] : [];

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-soft">
        <SmartImage
          src={hasImage ? detailUrl(images[active]) : undefined}
          srcSet={hasImage ? imageSrcSet(images[active], [600, 1000, 1400], 80) : undefined}
          sizes="(max-width: 768px) 100vw, 50vw"
          alt={product.title}
          aspect="aspect-[4/5]"
          eager
          fallback={
            <>
              <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient}`} />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)]" />
              <div className="absolute inset-0 grid place-items-center text-8xl drop-shadow-2xl">
                {product.emoji}
              </div>
            </>
          }
        />
        {product.status === "sold" && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-slate-900/55">
            <span className="-rotate-6 rounded-xl bg-destructive px-5 py-2.5 text-lg font-extrabold uppercase tracking-wide text-destructive-foreground shadow-lift">
              Sold out! 🔥
            </span>
          </div>
        )}
        <div className="absolute left-4 top-4 rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-foreground shadow-[var(--shadow-amber)]">
          {formatTsh(product.price)}
        </div>

      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                i === active ? "border-primary" : "border-border"
              }`}
            >
              <SmartImage
                src={microUrl(src)}
                alt=""
                aspect="aspect-square"
                wrapperClassName="h-full w-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


function ProductDetails({ product }: { product: MarketProduct }) {
  const message = `Hi! I saw "${product.title}" (${formatTsh(product.price)}) on MUST Market. Is it still available?`;
  const waHref = whatsappUrl(product.whatsapp, message);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-primary-soft px-2.5 py-1 font-semibold text-primary">
          {categoryEmoji(product.category)} {product.category}
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
          {product.condition}
        </span>
        {product.deliveryTimeframe && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            <Truck className="h-3 w-3" /> {product.deliveryTimeframe}
          </span>
        )}
      </div>

      <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
        {product.title}
      </h1>

      <div className="text-3xl font-bold tracking-tight text-foreground">
        {formatTsh(product.price)}
      </div>

      <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
        {product.description}
      </p>

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

      <div className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 ring-1 ring-inset ring-amber-600/20">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Always meet in a public campus spot, inspect the item, and never pay before you see it.
        </span>
      </div>

      {product.status === "sold" ? (
        <button
          type="button"
          disabled
          className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-muted px-6 py-4 text-base font-semibold text-muted-foreground"
        >
          Item Sold
        </button>
      ) : product.whatsapp ? (
        <a
          href={waHref}
          onClick={() => void recordWhatsappClick(product.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-shine inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 text-base font-semibold text-white shadow-lift transition-transform hover:-translate-y-0.5"
        >
          <MessageCircle className="h-5 w-5" strokeWidth={2.5} />
          Order Now via WhatsApp
        </a>
      ) : (
        <button
          type="button"
          onClick={() => openAuthModal(`/product/${product.id}`)}
          className="btn-shine inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 text-base font-semibold text-white shadow-lift transition-transform hover:-translate-y-0.5"
        >
          <MessageCircle className="h-5 w-5" strokeWidth={2.5} />
          Sign in to order via WhatsApp
        </button>
      )}


      <Link
        to="/report/$id"
        params={{ id: product.id }}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive"
      >
        🚩 Report this listing
      </Link>
    </div>
  );
}
