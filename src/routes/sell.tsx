import { ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_ACCEPT } from "@/lib/uploads";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ImagePlus, Loader2, ShieldCheck, Sparkles, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { categories } from "@/lib/demo-data";
import { MUST_LOCATIONS } from "@/lib/locations";
import { Navbar } from "@/components/navbar";
import { SafetyModal } from "@/components/safety-modal";
import { sanitizeTzPhone } from "@/lib/phone";

const CONDITIONS = ["Like New", "Good", "Fair"] as const;
type Condition = (typeof CONDITIONS)[number];
const DELIVERY_OPTIONS = ["Within 1 Hour", "Same Day", "Next Day", "This Week"] as const;
const MAX_IMAGES = 1;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const TARGET_IMAGE_SIZE = 150 * 1024;

interface PickedImage {
  file: File;
  preview: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to read image"));
    img.src = src;
  });
}

async function compressImageFile(file: File, maxBytes = TARGET_IMAGE_SIZE): Promise<File> {
  if (file.size <= maxBytes) return file;

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return file;

    const maxDimension = 1600;
    let width = img.width;
    let height = img.height;

    if (width > maxDimension || height > maxDimension) {
      const scale = Math.min(maxDimension / width, maxDimension / height);
      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));
    }

    canvas.width = width;
    canvas.height = height;
    context.drawImage(img, 0, 0, width, height);

    const mimeType = file.type === "image/png" ? "image/jpeg" : file.type;
    const extension = mimeType.split("/")[1] ?? "jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "");

    let quality = 0.92;
    let blob: Blob | null = null;

    while (quality >= 0.2) {
      blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, mimeType, quality);
      });
      if (blob && blob.size <= maxBytes) break;
      quality -= 0.1;
    }

    if (!blob || blob.size > maxBytes) {
      blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, mimeType, 0.75);
      });
    }

    if (!blob) return file;

    return new File([blob], `${baseName}.${extension}`, {
      type: mimeType,
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
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
  const [safetyOpen, setSafetyOpen] = useState(false);

  async function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const file = files[0];
    if (!file) return;

    if (images.length >= MAX_IMAGES) {
      toast.error("You can upload exactly 1 photo for this listing.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error(`${file.name} is not a supported image (JPEG, PNG, WebP or GIF)`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name} is over 5MB`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      const compressedFile = await compressImageFile(file);
      const nextImage = {
        file: compressedFile,
        preview: URL.createObjectURL(compressedFile),
      };

      setImages((prev) => {
        if (prev.length > 0) {
          const [existing] = prev;
          if (existing) URL.revokeObjectURL(existing.preview);
          return [nextImage];
        }
        return [nextImage];
      });
    } catch (error) {
      console.error(error);
      toast.error("Could not prepare the image for upload.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(idx: number) {
    setImages((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(idx, 1);
      if (removed) URL.revokeObjectURL(removed.preview);
      return copy;
    });
  }

  function handleSubmit(e: FormEvent) {
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
    const waDigits = sanitizeTzPhone(whatsapp);
    if (waDigits.length < 9 || waDigits.length > 15)
      return toast.error("Enter a valid WhatsApp number");

    // Intercept: open safety modal instead of writing to DB.
    setSafetyOpen(true);
  }

  async function publishListing() {
    if (submitting) return;
    const priceNum = Number(price);
    const waDigits = sanitizeTzPhone(whatsapp);
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
        const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
        const { data: signed, error: signErr } = await supabase.storage
          .from("product-images")
          .createSignedUrl(path, TEN_YEARS);
        if (signErr || !signed) throw signErr ?? new Error("Could not sign image URL");
        imageUrls.push(signed.signedUrl);
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
      setSafetyOpen(false);
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
          <Field label="What are you selling?" hint="Product title & category">
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
            hint={`Optional · exactly ${MAX_IMAGES} photo`}
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
                  <Upload className="h-5 w-5" />
                  <span className="text-[11px] font-medium">Upload 1 photo</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_IMAGE_ACCEPT}
              className="hidden"
              onChange={(e) => void handleFiles(e)}
            />
          </Field>

          <Field
            label="Why should someone buy this?"
            hint="Condition, what's included, why you're selling"
          >
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

          <Field label="Where are you located?" hint="Around MUST campus or nearby areas">
            <select
              className={inputCls}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">Select a location…</option>
              <optgroup label="On campus">
                {MUST_LOCATIONS.slice(0, 5).map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Off campus (nearby)">
                {MUST_LOCATIONS.slice(5).map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </optgroup>
            </select>
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
      <SafetyModal
        open={safetyOpen}
        submitting={submitting}
        onClose={() => setSafetyOpen(false)}
        onConfirm={publishListing}
      />
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
