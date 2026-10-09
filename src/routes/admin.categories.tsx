import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, LayoutGrid, Loader2, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ALLOWED_IMAGE_ACCEPT, ALLOWED_IMAGE_TYPES } from "@/lib/uploads";
import {
  MAX_ACTIVE_CATEGORIES,
  fetchFoodCategories,
  removeAdminImage,
  uploadAdminImage,
  type FoodCategory,
} from "@/lib/admin-media";
import { microUrl } from "@/lib/images";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({
    meta: [
      { title: "Category Manager — MUST Market Admin" },
      {
        name: "description",
        content: "Curate the five food category icon cards students see on the Msosi Fasta home rail.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminCategoriesPage,
});

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-surface-2 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/80 focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground";

function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-food-categories"],
    queryFn: fetchFoodCategories,
  });

  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const active = useMemo(() => categories.filter((c) => c.is_active), [categories]);
  const atLimit = active.length >= MAX_ACTIVE_CATEGORIES;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-food-categories"] });

  const pickFile = (f: File | null) => {
    if (!f) return;
    if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
      toast.error("Only JPG, PNG, WEBP or GIF icons are allowed.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const create = useMutation({
    mutationFn: async () => {
      if (atLimit) throw new Error(`Only ${MAX_ACTIVE_CATEGORIES} active categories are allowed.`);
      const uploaded = file ? await uploadAdminImage(file, "category-icons") : null;
      const nextOrder = (categories.at(-1)?.display_order ?? 0) + 1;
      const { error } = await supabase
        .from("food_categories")
        .insert({ name: name.trim(), icon_url: uploaded?.url ?? null, display_order: nextOrder });
      if (error) {
        if (uploaded) await removeAdminImage(uploaded.path);
        if (error.code === "42501") {
          throw new Error("Category save failed: administrator access could not be verified.");
        }
        throw new Error(`Category save failed: ${error.message}`);
      }
    },
    onSuccess: () => {
      setName("");
      setFile(null);
      setPreview("");
      invalidate();
      toast.success("Category added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async (c: FoodCategory) => {
      if (!c.is_active && atLimit) {
        throw new Error(`Switch one off first — max ${MAX_ACTIVE_CATEGORIES} active categories.`);
      }
      const { error } = await supabase
        .from("food_categories")
        .update({ is_active: !c.is_active })
        .eq("id", c.id);
      if (error) throw error;
      return !c.is_active;
    },
    onSuccess: (next) => {
      invalidate();
      toast.success(next ? "Category is live" : "Category hidden");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const move = useMutation({
    mutationFn: async ({ c, dir }: { c: FoodCategory; dir: -1 | 1 }) => {
      const idx = categories.findIndex((x) => x.id === c.id);
      const target = categories[idx + dir];
      if (!target) return;
      await supabase
        .from("food_categories")
        .update({ display_order: target.display_order })
        .eq("id", c.id);
      await supabase
        .from("food_categories")
        .update({ display_order: c.display_order })
        .eq("id", target.id);
    },
    onSuccess: () => invalidate(),
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (c: FoodCategory) => {
      const { error } = await supabase.from("food_categories").delete().eq("id", c.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Category deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const canSubmit = name.trim().length > 1 && !atLimit && !create.isPending;

  return (
    <div className="flex flex-col bg-background">
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
            <LayoutGrid className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Category Manager
            </h1>
            <p className="text-sm text-muted-foreground">
              Exactly {MAX_ACTIVE_CATEGORIES} icon cards show on the food home rail.
            </p>
          </div>
        </div>


        {/* Frontend preview */}
        <section className="mt-6 rounded-3xl border border-border bg-surface p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Frontend preview</h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                active.length === MAX_ACTIVE_CATEGORIES
                  ? "bg-primary-soft text-primary"
                  : "bg-accent/15 text-accent-foreground"
              }`}
            >
              {active.length}/{MAX_ACTIVE_CATEGORIES} active
            </span>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2 sm:gap-4">
            {Array.from({ length: MAX_ACTIVE_CATEGORIES }).map((_, i) => {
              const c = active[i];
              return (
                <div key={c?.id ?? `slot-${i}`} className="flex flex-col items-center gap-2">
                  <div
                    className={`grid aspect-square w-full place-items-center overflow-hidden rounded-2xl border ${
                      c ? "border-border bg-surface-2" : "border-dashed border-border bg-muted/40"
                    }`}
                  >
                    {c?.icon_url ? (
                      <img
                        src={microUrl(c.icon_url)}
                        alt={c.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xl">{c ? "🍽️" : "＋"}</span>
                    )}
                  </div>
                  <span className="truncate text-center text-[11px] font-medium text-foreground sm:text-xs">
                    {c?.name ?? "Empty slot"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          {/* Add form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (canSubmit) create.mutate();
            }}
            className="h-fit rounded-3xl border border-border bg-surface p-5 shadow-soft"
          >
            <h2 className="text-base font-semibold text-foreground">New category</h2>

            <label className="mt-4 block cursor-pointer">
              <span className={labelClass}>3D / food icon</span>
              <div className="grid place-items-center overflow-hidden rounded-2xl border border-dashed border-border bg-surface-2 p-4 transition-colors hover:border-primary">
                {preview ? (
                  <img
                    src={preview}
                    alt="Icon preview"
                    className="h-24 w-24 rounded-2xl object-cover"
                  />
                ) : (
                  <span className="flex flex-col items-center gap-1.5 py-6 text-sm text-muted-foreground">
                    <Upload className="h-5 w-5" />
                    Tap to upload icon
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
              <label className={labelClass} htmlFor="cat-name">
                Category name
              </label>
              <input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Burger, Pizza, Biryani, Swahili, Drinks"
                className={inputClass}
              />
            </div>

            {atLimit && (
              <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                You already have {MAX_ACTIVE_CATEGORIES} active categories. Switch one off to add a
                new one.
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-sm font-semibold text-accent-foreground shadow-soft transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
            >
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add category
            </button>
          </form>

          {/* List */}
          <section className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
            <h2 className="text-base font-semibold text-foreground">All categories</h2>
            {isLoading ? (
              <div className="grid place-items-center py-16">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : categories.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No categories yet — add your first one.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {categories.map((c, i) => (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface-2 p-3"
                  >
                    <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-surface">
                      {c.icon_url ? (
                        <img
                          src={microUrl(c.icon_url)}
                          alt={c.name}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">🍽️</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">Position {i + 1}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => move.mutate({ c, dir: -1 })}
                        disabled={i === 0 || move.isPending}
                        aria-label={`Move ${c.name} up`}
                        className="grid h-8 w-8 place-items-center rounded-full bg-surface text-muted-foreground hover:text-primary disabled:opacity-30"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move.mutate({ c, dir: 1 })}
                        disabled={i === categories.length - 1 || move.isPending}
                        aria-label={`Move ${c.name} down`}
                        className="grid h-8 w-8 place-items-center rounded-full bg-surface text-muted-foreground hover:text-primary disabled:opacity-30"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={c.is_active}
                      aria-label={`Toggle ${c.name}`}
                      onClick={() => toggle.mutate(c)}
                      disabled={toggle.isPending}
                      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                        c.is_active ? "bg-primary" : "bg-border"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-surface shadow transition-all ${
                          c.is_active ? "left-6" : "left-1"
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete category "${c.name}"?`)) remove.mutate(c);
                      }}
                      disabled={remove.isPending}
                      aria-label={`Delete ${c.name}`}
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
    </div>
  );
}
