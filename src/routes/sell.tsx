import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { categories } from "@/lib/demo-data";
import { Navbar } from "@/components/navbar";
import { sanitizeTzPhone } from "@/lib/phone";
import { useEffect } from "react";

const CONDITIONS = ["Like New", "Good", "Fair"] as const;
type Condition = (typeof CONDITIONS)[number];
const DELIVERY_OPTIONS = ["Within 1 Hour", "Same Day", "Next Day", "This Week"] as const;
const MAX_IMAGES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface PickedImage {
  file: File;
  preview: string;
}

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Sell an Item — MUST Market" },
      {
        name: "description",
        content:
          "List your item on MUST Market in under a minute. Free for every Mbeya University student.",
      },
      { property: "og:title", content: "Sell an Item — MUST Market" },
      {
        property: "og:description",
        content: "List an item on MUST Market in under a minute.",
      },
    ],
  }),
  component: SellPage,
});

function SellPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug ?? "");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<PickedImage[]>([]);
  const [condition, setCondition] = useState<Condition>("Good");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [delivery, setDelivery] = useState<(typeof DELIVERY_OPTIONS)[number]>("Same Day");
  const [whatsapp, setWhatsapp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_IMAGES - images.length;
    const accepted: PickedImage[] = [];
    for (const file of files.slice(0, remaining)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is over 5MB`);
        continue;
      }
      accepted.push({ file, preview: URL.createObjectURL(file) });
    }
    setImages((prev) => [...prev, ...accepted]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(idx: number) {
    setImages((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(idx, 1);
      if (removed) URL.revokeObjectURL(removed.preview);
      return copy;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const priceNum = Number(price);
    if (!title.trim() || title.length > 120) return toast.error("Add a title (max 120 chars)");
    if (!categorySlug) return toast.error("Pick a category");
    if (!priceNum || priceNum <= 0 || priceNum > 100_000_000)
      return toast.error("Enter a valid price in TSh");
    if (!description.trim() || description.length > 2000)
      return toast.error("Add a description (max 2000 chars)");
    if (!location.trim()) return toast.error("Add your location on/near campus");
    const waDigits = whatsapp.replace(/\D/g, "");
    if (waDigits.length < 9 || waDigits.length > 15)
      return toast.error("Enter a valid WhatsApp number");

    setSubmitting(true);
    try {
      let { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error || !data.session) throw new Error(error?.message || "Could not start session");
        sessionData = { session: data.session };
      }
      const userId = sessionData.session!.user.id;

      const { data: cat, error: catErr } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .maybeSingle();
      if (catErr) throw catErr;

      const imageUrls: string[] = [];
      for (const [i, img] of images.entries()) {
        const ext = img.file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${userId}/${Date.now()}-${i}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("product-images")
          .upload(path, img.file, { contentType: img.file.type, upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
        imageUrls.push(pub.publicUrl);
      }

      const { error: insErr } = await supabase.from("products").insert({
        seller_id: userId,
        category_id: cat?.id ?? null,
        title: title.trim(),
        description: description.trim(),
        price_tsh: Math.round(priceNum),
        condition,
        location: location.trim(),
        whatsapp_number: waDigits,
        delivery_timeframe: delivery,
        images: imageUrls,
      });
      if (insErr) throw insErr;

      toast.success("Listing published! 🎉");
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate({ to: "/", hash: "browse" });
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to market
        </Link>

        <div className="mt-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
            <Sparkles className="h-3 w-3" /> New Listing
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Sell an item on MUST Market
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Fill in the details below. Takes under a minute — buyers on campus will reach you on
          WhatsApp.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-7 rounded-3xl border border-border bg-surface p-6 shadow-soft sm:p-8"
        >
          <Field
            label="What are you selling?"
            hint="Product title & category"
          >
            <input
              className={inputCls}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. MacBook Air M1 · 8GB / 256GB"
              maxLength={120}
            />
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setCategorySlug(c.slug)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    categorySlug === c.slug
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{c.emoji}</span>
                  {c.name}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Price" hint="In Tanzanian Shillings">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                TSh
              </span>
              <input
                className={`${inputCls} pl-14`}
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))}
                inputMode="numeric"
                placeholder="120,000"
              />
            </div>
          </Field>

          <Field
            label="Images"
            hint={`Optional · up to ${MAX_IMAGES} photos from different angles`}
          >
            <div className="grid grid-cols-3 gap-2.5">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-2"
                >
                  <img src={img.preview} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-slate-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                    aria-label="Remove photo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-surface-2 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  {images.length === 0 ? (
                    <>
                      <Upload className="h-5 w-5" />
                      <span className="text-[11px] font-medium">Upload</span>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-5 w-5" />
                      <span className="text-[11px] font-medium">Add more</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFiles}
            />
          </Field>

          <Field label="Why should someone buy this?" hint="Condition, what's included, why you're selling">
            <div className="mb-2.5 flex gap-1.5">
              {CONDITIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                    condition === c
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <textarea
              className={`${inputCls} min-h-[120px] resize-y py-2.5`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell buyers what makes this a great deal…"
              maxLength={2000}
            />
          </Field>

          <Field label="Where are you located?" hint="Around MUST campus or nearby hostels">
            <input
              className={inputCls}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Hostel Block C, Iyunga"
            />
          </Field>

          <Field label="How fast can you deliver?" hint="Set expectations for the buyer">
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {DELIVERY_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDelivery(d)}
                  className={`rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors ${
                    delivery === d
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Your WhatsApp number" hint="Buyers will contact you here">
            <input
              className={inputCls}
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              inputMode="tel"
              placeholder="+255 7XX XXX XXX"
            />
          </Field>

          <div className="flex items-start gap-2 rounded-xl bg-primary-soft/60 p-3 text-xs text-primary">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Only meet buyers in public campus spots. Never send items before you're paid.
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-shine inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-amber)] transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing…
              </>
            ) : (
              "Submit Listing"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}

const inputCls =
  "block w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label className="text-sm font-semibold text-foreground">{label}</label>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
