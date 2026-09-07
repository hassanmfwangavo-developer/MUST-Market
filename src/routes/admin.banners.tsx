import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Images, Loader2, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AdminTabs } from "@/components/admin-tabs";
import { SmartImage } from "@/components/smart-image";
import { thumbUrl } from "@/lib/images";
import { ALLOWED_IMAGE_ACCEPT, ALLOWED_IMAGE_TYPES } from "@/lib/uploads";
import {
  BANNER_TYPES,
  bannerTypeLabel,
  fetchBanners,
  removeAdminImage,
  uploadAdminImage,
  type Banner,
} from "@/lib/admin-media";
import { fetchMenuItems } from "@/lib/menu";

export const Route = createFileRoute("/admin/banners")({
  head: () => ({
    meta: [
      { title: "Banner Manager — MUST Market Admin" },
      {
        name: "description",
        content: "Create, schedule and switch promotional banners on and off across MUST Market.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminBannersPage,
});

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-surface-2 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/80 focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground";

function AdminBannersPage() {
  const queryClient = useQueryClient();
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: fetchBanners,
  });

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [bannerType, setBannerType] = useState<string>(BANNER_TYPES[0].value);
  const [endsAt, setEndsAt] = useState("");
  const [menuItemId, setMenuItemId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const { data: menuItems = [] } = useQuery({
    queryKey: ["admin-menu-items-for-banners"],
    queryFn: fetchMenuItems,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-banners"] });

  const pickFile = (f: File | null) => {
    if (!f) return;
    if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
      toast.error("Only JPG, PNG, WEBP or GIF images are allowed.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setPromoCode("");
    setDiscount("");
    setBannerType(BANNER_TYPES[0].value);
    setEndsAt("");
    setMenuItemId("");
    setFile(null);
    setPreview("");
  };

  const isAdvertising = bannerType === "advertising";

  const create = useMutation({
    mutationFn: async () => {
      const uploaded = file ? await uploadAdminImage(file, "banners") : null;
      const { error } = await supabase.from("banners").insert({
        title: title.trim() || (isAdvertising ? "Tangazo" : ""),
        subtitle: isAdvertising ? "" : subtitle.trim(),
        promo_code: isAdvertising ? null : promoCode.trim() || null,
        discount_percent: !isAdvertising && discount ? Number(discount) : null,
        banner_type: bannerType,
        countdown_ends_at:
          !isAdvertising && endsAt ? new Date(endsAt).toISOString() : null,
        menu_item_id: isAdvertising ? null : menuItemId || null,
        image_url: uploaded?.url ?? null,
      });
      if (error) {
        if (uploaded) await removeAdminImage(uploaded.path);
        if (error.code === "42501") {
          throw new Error("Banner save failed: administrator access could not be verified.");
        }
        throw new Error(`Banner save failed: ${error.message}`);
      }
    },
    onSuccess: () => {
      resetForm();
      invalidate();
      toast.success("Banner published 🎉");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async (b: Banner) => {
      const { error } = await supabase
        .from("banners")
        .update({ is_active: !b.is_active })
        .eq("id", b.id);
      if (error) throw error;
      return !b.is_active;
    },
    onSuccess: (next) => {
      invalidate();
      toast.success(next ? "Banner is live" : "Banner switched off");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (b: Banner) => {
      const { error } = await supabase.from("banners").delete().eq("id", b.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Banner deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const canSubmit =
    !create.isPending &&
    (isAdvertising ? file !== null : title.trim().length > 2);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
            <Images className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Banner Manager</h1>
            <p className="text-sm text-muted-foreground">
              Publish flash sales, booking pushes and promo codes.
            </p>
          </div>
        </div>

        <AdminTabs />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          {/* Create form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (canSubmit) create.mutate();
            }}
            className="h-fit rounded-3xl border border-border bg-surface p-5 shadow-soft"
          >
            <h2 className="text-base font-semibold text-foreground">New banner</h2>

            <label className="mt-4 block cursor-pointer">
              <span className={labelClass}>Banner image</span>
              <div className="grid place-items-center overflow-hidden rounded-2xl border border-dashed border-border bg-surface-2 p-4 transition-colors hover:border-primary">
                {preview ? (
                  <img
                    src={preview}
                    alt="Banner preview"
                    className="h-32 w-full rounded-xl object-cover"
                  />
                ) : (
                  <span className="flex flex-col items-center gap-1.5 py-6 text-sm text-muted-foreground">
                    <Upload className="h-5 w-5" />
                    Tap to upload artwork
                  </span>
                )}
              </div>
              <input
                type="file"
                accept={ALLOWED_IMAGE_ACCEPT}
                className="sr-only"
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              />
            </label>

            <div className="mt-4">
              <label className={labelClass} htmlFor="banner-title">
                Title {isAdvertising && <span className="normal-case">(optional, internal label)</span>}
              </label>
              <input
                id="banner-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  isAdvertising ? "e.g. September Tangazo" : "Flash Sale — 30% off lunch"
                }
                className={inputClass}
              />
            </div>

            {!isAdvertising && (
            <div className="mt-3">
              <label className={labelClass} htmlFor="banner-subtitle">
                Subtitle
              </label>
              <input
                id="banner-subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Today only, hostel deliveries included"
                className={inputClass}
              />
            </div>
            )}

            {!isAdvertising && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="banner-promo">
                  Promo code
                </label>
                <input
                  id="banner-promo"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="MUST30"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="banner-discount">
                  Discount %
                </label>
                <input
                  id="banner-discount"
                  type="number"
                  min={0}
                  max={100}
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="30"
                  className={inputClass}
                />
              </div>
            </div>
            )}

            {!isAdvertising && (
            <div className="mt-3">
              <label className={labelClass} htmlFor="banner-item">
                Dish this offer applies to
              </label>
              <select
                id="banner-item"
                value={menuItemId}
                onChange={(e) => setMenuItemId(e.target.value)}
                className={inputClass}
              >
                <option value="">No dish (no discount will be applied)</option>
                {menuItems.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.vendor_name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                The discount only applies to this dish, and only when a customer taps this banner.
              </p>
            </div>
            )}

            <div className="mt-3">
              <label className={labelClass} htmlFor="banner-type">
                Banner type
              </label>
              <select
                id="banner-type"
                value={bannerType}
                onChange={(e) => setBannerType(e.target.value)}
                className={inputClass}
              >
                {BANNER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {!isAdvertising && (
            <div className="mt-3">
              <label className={labelClass} htmlFor="banner-ends">
                Expiry / countdown ends
              </label>
              <input
                id="banner-ends"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className={inputClass}
              />
            </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-sm font-semibold text-accent-foreground shadow-soft transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
            >
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Publish banner
            </button>
          </form>

          {/* Existing banners */}
          <section className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
            <h2 className="text-base font-semibold text-foreground">
              All banners{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({banners.filter((b) => b.is_active).length} live)
              </span>
            </h2>

            {isLoading ? (
              <div className="grid place-items-center py-16">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : banners.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No banners yet — publish your first one on the left.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {banners.map((b) => (
                  <li
                    key={b.id}
                    className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface-2 p-3"
                  >
                    <SmartImage
                      src={thumbUrl(b.image_url ?? "")}
                      alt={b.title}
                      aspect="aspect-square"
                      wrapperClassName="h-14 w-14 shrink-0 rounded-xl"
                      fallback={<div className="grid h-full w-full place-items-center text-lg">🎉</div>}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{b.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {bannerTypeLabel(b.banner_type)}
                        {b.promo_code ? ` · ${b.promo_code}` : ""}
                        {b.discount_percent ? ` · ${b.discount_percent}% off` : ""}
                        {b.countdown_ends_at
                          ? ` · ends ${new Date(b.countdown_ends_at).toLocaleString("en-GB")}`
                          : ""}
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={b.is_active}
                      aria-label={`Toggle ${b.title}`}
                      onClick={() => toggle.mutate(b)}
                      disabled={toggle.isPending}
                      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                        b.is_active ? "bg-primary" : "bg-border"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-surface shadow transition-all ${
                          b.is_active ? "left-6" : "left-1"
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete banner "${b.title}"?`)) remove.mutate(b);
                      }}
                      disabled={remove.isPending}
                      aria-label={`Delete ${b.title}`}
                      className="grid h-9 w-9 place-items-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
