import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { X, Upload, Loader2, CheckCircle2, Image as ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { categories } from "@/lib/demo-data";

type Condition = "Like New" | "Good" | "Fair";

interface SellItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CONDITIONS: Condition[] = ["Like New", "Good", "Fair"];
const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface PickedImage {
  file: File;
  preview: string;
}

export function SellItemDialog({ open, onClose, onSuccess }: SellItemDialogProps) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [categorySlug, setCategorySlug] = useState<string>(categories[0]?.slug ?? "");
  const [condition, setCondition] = useState<Condition>("Good");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [images, setImages] = useState<PickedImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  function reset() {
    setTitle("");
    setPrice("");
    setCategorySlug(categories[0]?.slug ?? "");
    setCondition("Good");
    setDescription("");
    setLocation("");
    setWhatsapp("");
    images.forEach((i) => URL.revokeObjectURL(i.preview));
    setImages([]);
    setDone(false);
  }

  function handleClose() {
    if (submitting) return;
    reset();
    onClose();
  }

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

    // Validation
    const priceNum = Number(price);
    if (!title.trim() || title.length > 120) return toast.error("Add a title (max 120 chars)");
    if (!priceNum || priceNum <= 0 || priceNum > 100_000_000) return toast.error("Enter a valid price in TSh");
    if (!categorySlug) return toast.error("Pick a category");
    if (!description.trim() || description.length > 2000) return toast.error("Add a description (max 2000 chars)");
    if (!location.trim()) return toast.error("Add a pickup location");
    const waDigits = whatsapp.replace(/\D/g, "");
    if (waDigits.length < 9 || waDigits.length > 15) return toast.error("Enter a valid WhatsApp number");
    if (images.length === 0) return toast.error("Add at least one photo");

    setSubmitting(true);
    try {
      // Ensure we have a session (anonymous auth for quick posting)
      let { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error || !data.session) throw new Error(error?.message || "Could not start session");
        sessionData = { session: data.session };
      }
      const userId = sessionData.session!.user.id;

      // Look up category id
      const { data: cat, error: catErr } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .maybeSingle();
      if (catErr) throw catErr;

      // Upload images
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
        images: imageUrls,
      });
      if (insErr) throw insErr;

      setDone(true);
      toast.success("Listing published! 🎉");
      onSuccess?.();
      setTimeout(() => {
        reset();
        onClose();
      }, 1600);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={handleClose}
    >
      <div
        className="relative flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-surface shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-7">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              New Listing
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              Sell an item on MUST Market
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-40"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-primary-soft text-primary">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Your item is live</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Buyers on campus can now discover it. WhatsApp messages will come straight to you.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              {/* Photos */}
              <Field label="Photos" hint={`${images.length}/${MAX_IMAGES} · JPG, PNG · up to 5MB each`}>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
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
                          <ImageIcon className="h-5 w-5" />
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

              <Field label="Title">
                <input
                  className={inputCls}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. MacBook Air M1 · 8GB / 256GB"
                  maxLength={120}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Price (TSh)">
                  <input
                    className={inputCls}
                    value={price}
                    onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))}
                    inputMode="numeric"
                    placeholder="120000"
                  />
                </Field>
                <Field label="Condition">
                  <div className="flex gap-1.5">
                    {CONDITIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCondition(c)}
                        className={`flex-1 rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors ${
                          condition === c
                            ? "border-primary bg-primary-soft text-primary"
                            : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              <Field label="Category">
                <div className="flex flex-wrap gap-1.5">
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

              <Field label="Description">
                <textarea
                  className={`${inputCls} min-h-[110px] resize-y py-2.5`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Condition details, what's included, why you're selling…"
                  maxLength={2000}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Pickup location">
                  <input
                    className={inputCls}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Hostel Block C"
                  />
                </Field>
                <Field label="WhatsApp number">
                  <input
                    className={inputCls}
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    inputMode="tel"
                    placeholder="+255 7XX XXX XXX"
                  />
                </Field>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-2/60 px-5 py-4 sm:px-7">
              <p className="hidden text-[11px] text-muted-foreground sm:block">
                By posting you agree to the MUST Market community rules.
              </p>
              <div className="flex flex-1 justify-end gap-2 sm:flex-none">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-2 disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-amber)] transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Publishing…
                    </>
                  ) : (
                    "Publish listing"
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
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
    <div className="mb-4">
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
          {label}
        </label>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
