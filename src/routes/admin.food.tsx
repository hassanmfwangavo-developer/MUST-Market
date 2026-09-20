import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ClipboardList,
  Loader2,
  Pencil,
  Plus,
  Search,
  Star,
  Store,
  Trash2,
  UtensilsCrossed,
  CalendarClock,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AdminTabs } from "@/components/admin-tabs";
import { SmartImage } from "@/components/smart-image";
import { microUrl } from "@/lib/images";
import { formatTsh } from "@/lib/menu";
import { fetchAllReviews } from "@/lib/reviews";
import { fetchPreOrders } from "@/lib/pre-orders";
import { ALLOWED_IMAGE_ACCEPT, ALLOWED_IMAGE_TYPES } from "@/lib/uploads";
import { uploadAdminImage } from "@/lib/admin-media";
import {
  PAYMENT_STATUSES,
  fetchAdminFoodOrders,
  fetchAdminMenuItems,
  fetchVendors,
  orderRef,
  type AdminMenuItem,
  type MenuAddon,
  type Vendor,
} from "@/lib/vendors";

export const Route = createFileRoute("/admin/food")({
  head: () => ({
    meta: [
      { title: "Food & Vendor Manager — MUST Market Admin" },
      {
        name: "description",
        content:
          "Monitor Msosi Fasta orders and payment outcomes, manage dishes with add-ons and ratings, and curate campus restaurant logos.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminFoodManager,
});

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-surface-2 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/80 focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground";
const cardClass = "rounded-3xl border border-border bg-surface p-5 shadow-soft";

const DAY_BADGES = [
  "Monday Only",
  "Tuesday Only",
  "Wednesday Only",
  "Thursday Only",
  "Friday Only",
  "Saturday Only",
  "Sunday Only",
  "Weekend Only",
];

const TABS = [
  { key: "orders", label: "Maagizo & Hali ya Malipo", icon: ClipboardList },
  { key: "food", label: "Vyakula & Menus", icon: UtensilsCrossed },
  { key: "vendors", label: "Migahawa & Logos", icon: Store },
  { key: "reviews", label: "Testimonials & Reviews", icon: Star },
  { key: "preorders", label: "Msosi Pre-Orders", icon: CalendarClock },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function AdminFoodManager() {
  const [tab, setTab] = useState<TabKey>("orders");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-24 sm:px-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Food &amp; Vendor Manager
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Msosi Fasta orders, dish catalogue and campus restaurant branding in one console.
          </p>
        </header>
        <AdminTabs />

        <nav className="mt-6 flex flex-wrap gap-1.5 rounded-2xl border border-border bg-surface-2 p-1.5">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors sm:text-sm ${
                tab === key
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-6">
          {tab === "orders" && <OrdersTab />}
          {tab === "food" && <FoodTab />}
          {tab === "vendors" && <VendorsTab />}
          {tab === "reviews" && <ReviewsTab />}
          {tab === "preorders" && <PreOrdersTab />}
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* ------------------------------- Tab 1 --------------------------------- */

function paymentTone(status: string) {
  if (status === "success") return "bg-primary/10 text-primary";
  if (status === "failed") return "bg-destructive/10 text-destructive";
  return "bg-accent/15 text-accent-foreground";
}

function OrdersTab() {
  const [filter, setFilter] = useState<"all" | "success" | "failed" | "pending">("all");
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-food-orders"],
    queryFn: fetchAdminFoodOrders,
  });

  const rows = useMemo(
    () => (filter === "all" ? orders : orders.filter((o) => o.payment_status === filter)),
    [orders, filter],
  );

  return (
    <section className={cardClass}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Maagizo &amp; Hali ya Malipo</h2>
        <div className="flex flex-wrap gap-1.5 rounded-full border border-border bg-surface-2 p-1">
          {(["all", "success", "failed", "pending"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filter === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {value === "all" ? "Zote" : PAYMENT_STATUSES.find((s) => s.value === value)?.en}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : rows.length === 0 ? (
        <p className="py-14 text-center text-sm text-muted-foreground">Hakuna maagizo bado.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2.5 pr-3 font-semibold">Order</th>
                <th className="py-2.5 pr-3 font-semibold">Muda</th>
                <th className="py-2.5 pr-3 font-semibold">Mteja</th>
                <th className="py-2.5 pr-3 font-semibold">Delivery</th>
                <th className="py-2.5 pr-3 font-semibold">Vyakula</th>
                <th className="py-2.5 pr-3 font-semibold">Jumla</th>
                <th className="py-2.5 font-semibold">Malipo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} className="border-b border-border/60 align-top">
                  <td className="py-3 pr-3 font-semibold text-foreground">{orderRef(o.id)}</td>
                  <td className="py-3 pr-3 text-muted-foreground">
                    {new Date(o.created_at).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-3 pr-3">
                    <span className="block font-medium text-foreground">{o.customer_name || "—"}</span>
                    <span className="text-xs text-muted-foreground">{o.phone || "—"}</span>
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">
                    {[o.delivery_area, o.room].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">
                    {o.items.length === 0
                      ? "—"
                      : o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                  </td>
                  <td className="py-3 pr-3 font-semibold text-foreground">{formatTsh(o.total_tsh)}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${paymentTone(o.payment_status)}`}
                    >
                      {PAYMENT_STATUSES.find((s) => s.value === o.payment_status)?.label ?? "Inasubiri"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ------------------------------- Tab 2 --------------------------------- */

interface FoodDraft {
  id: string | null;
  name: string;
  price: string;
  description: string;
  vendorId: string;
  rating: string;
  imageUrl: string;
  category: string;
  addons: MenuAddon[];
  deliveryFee: string;
  dayBadge: string;
}

const emptyDraft = (): FoodDraft => ({
  id: null,
  name: "",
  price: "",
  description: "",
  vendorId: "",
  rating: "4.5",
  imageUrl: "",
  category: "Zote",
  addons: [],
  deliveryFee: "1000",
  dayBadge: "",
});

function FoodTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [draft, setDraft] = useState<FoodDraft | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-menu-items"],
    queryFn: fetchAdminMenuItems,
  });
  const { data: vendors = [] } = useQuery({ queryKey: ["admin-vendors"], queryFn: fetchVendors });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(
      (i) =>
        (vendorFilter === "all" || i.vendor_id === vendorFilter) &&
        (q === "" || i.name.toLowerCase().includes(q) || i.vendor_name.toLowerCase().includes(q)),
    );
  }, [items, search, vendorFilter]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] });
    queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    queryClient.invalidateQueries({ queryKey: ["menu_items"] });
  };

  const toggleAvailability = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: boolean }) => {
      const { error } = await supabase
        .from("menu_items")
        .update({ is_available: next })
        .eq("id", id);
      if (error) {
        throw new Error(
          error.code === "42501"
            ? "Update failed: administrator access could not be verified."
            : error.message,
        );
      }
      return next;
    },
    onSuccess: (next) => {
      toast.success(next ? "In Stock" : "Chakula kwa sasa Kimeisha");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });


  const save = useMutation({
    mutationFn: async (d: FoodDraft) => {
      if (!d.name.trim()) throw new Error("Jina la chakula linahitajika.");
      const price = Number(d.price);
      if (!Number.isFinite(price) || price <= 0) throw new Error("Weka bei sahihi ya TZS.");
      const rating = Math.min(5, Math.max(0, Number(d.rating) || 0));

      let imageUrl = d.imageUrl.trim() || null;
      if (file) imageUrl = (await uploadAdminImage(file, "food-items")).url;

      const vendor = vendors.find((v) => v.id === d.vendorId);
      const payload = {
        name: d.name.trim(),
        price: Math.round(price),
        description: d.description.trim(),
        vendor_id: vendor?.id ?? null,
        vendor_name: vendor?.name ?? "",
        rating,
        image_url: imageUrl,
        category: d.category,
        addons: d.addons.filter((a) => a.title.trim()) as unknown as never,
        delivery_fee: Math.max(0, Math.round(Number(d.deliveryFee) || 0)),
        day_badge: d.dayBadge.trim() || null,
      };

      const { error } = d.id
        ? await supabase.from("menu_items").update(payload).eq("id", d.id)
        : await supabase.from("menu_items").insert(payload);
      if (error) {
        throw new Error(
          error.code === "42501"
            ? "Save failed: administrator access could not be verified."
            : error.message,
        );
      }
    },
    onSuccess: () => {
      toast.success("Chakula kimehifadhiwa.");
      setDraft(null);
      setFile(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Chakula kimefutwa.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEdit = (item: AdminMenuItem) => {
    setFile(null);
    setDraft({
      id: item.id,
      name: item.name,
      price: String(item.price),
      description: item.description,
      vendorId: item.vendor_id ?? "",
      rating: String(item.rating),
      imageUrl: item.image_url ?? "",
      category: item.category,
      addons: item.addons,
      deliveryFee: String(item.delivery_fee ?? 1000),
      dayBadge: item.day_badge ?? "",
    });
  };

  return (
    <section className={cardClass}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tafuta chakula au mgahawa…"
            className={`${inputClass} pl-9`}
          />
        </div>
        <select
          value={vendorFilter}
          onChange={(e) => setVendorFilter(e.target.value)}
          className={`${inputClass} w-auto min-w-[180px]`}
        >
          <option value="all">Migahawa yote</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            setFile(null);
            setDraft(emptyDraft());
          }}
          className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" /> Ongeza Chakula
        </button>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="flex gap-3 rounded-2xl border border-border bg-surface-2 p-3 transition-colors hover:border-primary/40"
            >
              <SmartImage
                src={microUrl(item.image_url ?? "")}
                alt={item.name}
                className="h-20 w-20 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-foreground">{item.name}</h3>
                <p className="truncate text-xs text-muted-foreground">{item.vendor_name || "Hakuna mgahawa"}</p>
                <p className="mt-1 text-sm font-bold text-primary">{formatTsh(item.price)}</p>
                <p className="text-xs text-muted-foreground">
                  ⭐ {item.rating.toFixed(1)} · {item.addons.length} add-ons
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
                  aria-label={`Edit ${item.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Futa "${item.name}"?`)) remove.mutate(item.id);
                  }}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-border text-destructive hover:bg-destructive/10"
                  aria-label={`Delete ${item.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
              Hakuna chakula kilichopatikana.
            </p>
          )}
        </div>
      )}

      {draft && (
        <FoodModal
          draft={draft}
          vendors={vendors}
          saving={save.isPending}
          onFile={setFile}
          onChange={setDraft}
          onClose={() => setDraft(null)}
          onSave={() => save.mutate(draft)}
        />
      )}
    </section>
  );
}

function FoodModal({
  draft,
  vendors,
  saving,
  onFile,
  onChange,
  onClose,
  onSave,
}: {
  draft: FoodDraft;
  vendors: Vendor[];
  saving: boolean;
  onFile: (f: File | null) => void;
  onChange: (d: FoodDraft) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const set = <K extends keyof FoodDraft>(key: K, value: FoodDraft[K]) =>
    onChange({ ...draft, [key]: value });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-foreground/50 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-lg rounded-3xl border border-border bg-surface p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {draft.id ? "Edit Chakula" : "Ongeza Chakula"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5">
          <div>
            <label className={labelClass}>Picha ya chakula</label>
            <input
              type="file"
              accept={ALLOWED_IMAGE_ACCEPT}
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                if (f && !ALLOWED_IMAGE_TYPES.includes(f.type)) {
                  toast.error("Only JPG, PNG, WEBP or GIF images are allowed.");
                  return;
                }
                onFile(f);
              }}
              className="w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-foreground"
            />
            <input
              value={draft.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="…au weka image URL"
              className={`${inputClass} mt-2`}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Jina</label>
              <input value={draft.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Bei (TZS)</label>
              <input
                inputMode="numeric"
                value={draft.price}
                onChange={(e) => set("price", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Maelezo</label>
            <textarea
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className={`${inputClass} h-auto py-2.5`}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Mgahawa / Hoteli</label>
              <select
                value={draft.vendorId}
                onChange={(e) => set("vendorId", e.target.value)}
                className={inputClass}
              >
                <option value="">Hakuna</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Delivery Fee (TZS)</label>
              <input
                inputMode="numeric"
                value={draft.deliveryFee}
                onChange={(e) => set("deliveryFee", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Rating (0 – 5)</label>
              <input
                inputMode="decimal"
                value={draft.rating}
                onChange={(e) => set("rating", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Day Badge (booking)</label>
              <input
                list="day-badge-options"
                value={draft.dayBadge}
                onChange={(e) => set("dayBadge", e.target.value)}
                placeholder="e.g. Friday Only"
                className={inputClass}
              />
              <datalist id="day-badge-options">
                {DAY_BADGES.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface-2 p-3.5">
            <div className="flex items-center justify-between">
              <span className={`${labelClass} mb-0`}>Add-ons</span>
              <button
                type="button"
                onClick={() => set("addons", [...draft.addons, { title: "", price: 0 }])}
                className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
              >
                <Plus className="h-3.5 w-3.5" /> Ongeza
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {draft.addons.map((addon, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={addon.title}
                    placeholder="Add Soda"
                    onChange={(e) => {
                      const next = [...draft.addons];
                      next[index] = { ...addon, title: e.target.value };
                      set("addons", next);
                    }}
                    className={`${inputClass} flex-1`}
                  />
                  <input
                    inputMode="numeric"
                    value={String(addon.price)}
                    placeholder="1000"
                    onChange={(e) => {
                      const next = [...draft.addons];
                      next[index] = { ...addon, price: Number(e.target.value) || 0 };
                      set("addons", next);
                    }}
                    className={`${inputClass} w-28`}
                  />
                  <button
                    type="button"
                    onClick={() => set("addons", draft.addons.filter((_, i) => i !== index))}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border text-destructive hover:bg-destructive/10"
                    aria-label="Delete add-on"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {draft.addons.length === 0 && (
                <p className="text-xs text-muted-foreground">Hakuna add-ons bado.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Ghairi
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Hifadhi
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- Tab 3 --------------------------------- */

function VendorsTab() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ["admin-vendors"],
    queryFn: fetchVendors,
  });
  const { data: items = [] } = useQuery({
    queryKey: ["admin-menu-items"],
    queryFn: fetchAdminMenuItems,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
    queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] });
  };

  const create = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Weka jina la mgahawa.");
      const logo = file ? (await uploadAdminImage(file, "vendor-logos")).url : null;
      const { error } = await supabase
        .from("vendors")
        .insert({ name: name.trim(), logo_url: logo, display_order: vendors.length });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Mgahawa umeongezwa.");
      setName("");
      setFile(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: { name?: string; is_featured?: boolean };
    }) => {
      const { error } = await supabase.from("vendors").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vendors").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Mgahawa umefutwa.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reassign = useMutation({
    mutationFn: async ({ itemId, vendorId }: { itemId: string; vendorId: string }) => {
      const vendor = vendors.find((v) => v.id === vendorId);
      const { error } = await supabase
        .from("menu_items")
        .update({ vendor_id: vendor?.id ?? null, vendor_name: vendor?.name ?? "" })
        .eq("id", itemId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Chakula kimehamishwa.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-foreground">Ongeza Mgahawa</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Jina la mgahawa</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Cafeteria Kuu"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Logo</label>
              <input
                type="file"
                accept={ALLOWED_IMAGE_ACCEPT}
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  if (f && !ALLOWED_IMAGE_TYPES.includes(f.type)) {
                    toast.error("Only JPG, PNG, WEBP or GIF logos are allowed.");
                    return;
                  }
                  setFile(f);
                }}
                className="w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-foreground"
              />
            </div>
          </div>
          <button
            type="button"
            disabled={create.isPending}
            onClick={() => create.mutate()}
            className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-xl bg-accent px-5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
          >
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Hifadhi
          </button>
        </div>
      </section>

      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-foreground">Migahawa &amp; Logos</h2>
        {isLoading ? (
          <div className="grid place-items-center py-14">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {vendors.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface-2 p-3">
                <SmartImage
                  src={microUrl(v.logo_url ?? "")}
                  alt={v.name}
                  className="h-12 w-12 shrink-0 rounded-xl object-cover"
                />
                <input
                  defaultValue={v.name}
                  onBlur={(e) => {
                    const value = e.target.value.trim();
                    if (value && value !== v.name) update.mutate({ id: v.id, patch: { name: value } });
                  }}
                  className={`${inputClass} min-w-[160px] flex-1`}
                />
                <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={v.is_featured}
                    onChange={(e) => update.mutate({ id: v.id, patch: { is_featured: e.target.checked } })}
                    className="h-4 w-4 accent-[hsl(var(--primary))]"
                  />
                  Logo Marquee
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Futa "${v.name}"?`)) remove.mutate(v.id);
                  }}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-border text-destructive hover:bg-destructive/10"
                  aria-label={`Delete ${v.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
            {vendors.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">Hakuna migahawa bado.</p>
            )}
          </ul>
        )}
      </section>

      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-foreground">Panga Vyakula kwa Migahawa</h2>
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface-2 p-3">
              <span className="min-w-[140px] flex-1 truncate text-sm font-medium text-foreground">
                {item.name}
              </span>
              <select
                value={item.vendor_id ?? ""}
                onChange={(e) => reassign.mutate({ itemId: item.id, vendorId: e.target.value })}
                className={`${inputClass} w-auto min-w-[180px]`}
              >
                <option value="">Hakuna mgahawa</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </li>
          ))}
          {items.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">Hakuna vyakula bado.</p>
          )}
        </ul>
      </section>
    </div>
  );
}

/* ------------------------------- Tab 4 --------------------------------- */

function ReviewsTab() {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-order-reviews"],
    queryFn: fetchAllReviews,
  });

  const average = useMemo(
    () =>
      reviews.length
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : "—",
    [reviews],
  );

  return (
    <section className={cardClass}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Testimonials &amp; Reviews</h2>
          <p className="text-sm text-muted-foreground">
            Live customer ratings and feedback from delivered orders.
          </p>
        </div>
        <div className="rounded-2xl bg-primary/10 px-4 py-2 text-center">
          <p className="text-lg font-bold text-primary">{average}</p>
          <p className="text-[11px] font-medium text-muted-foreground">
            {reviews.length} review{reviews.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-2" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No reviews yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {reviews.map((r) => (
            <article key={r.id} className="rounded-2xl border border-border bg-surface-2 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {r.customer_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Order {orderRef(r.order_id)} · {formatTsh(r.total_tsh, "TSh")} ·{" "}
                    {new Date(r.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-0.5" aria-label={`${r.rating} out of 5`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-4 w-4 ${
                        n <= r.rating ? "fill-accent text-accent" : "text-muted-foreground/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
              {r.comment.trim() && (
                <p className="mt-2 text-sm text-foreground/80">{r.comment}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

/* ------------------------------- Tab 5 --------------------------------- */

function PreOrdersTab() {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["msosi-pre-orders"],
    queryFn: fetchPreOrders,
  });

  if (isLoading) {
    return (
      <div className="grid place-items-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className={cardClass}>
      <h2 className="text-lg font-semibold text-foreground">Msosi Pre-Orders</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Day-specific booking requests submitted from Msosi Fasta dishes.
      </p>

      {bookings.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-border bg-surface-2 p-6 text-center text-sm text-muted-foreground">
          No booking requests yet.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Dish</th>
                <th className="py-2 pr-3">Customer</th>
                <th className="py-2 pr-3">Phone</th>
                <th className="py-2 pr-3">Location</th>
                <th className="py-2 pr-3">Message</th>
                <th className="py-2 pr-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-border align-top">
                  <td className="py-3 pr-3 text-muted-foreground">
                    {new Date(b.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 pr-3 font-semibold text-foreground">{b.item_name}</td>
                  <td className="py-3 pr-3 text-foreground">{b.customer_name}</td>
                  <td className="py-3 pr-3 text-foreground">{b.phone_number}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{b.delivery_location}</td>
                  <td className="max-w-[240px] py-3 pr-3 text-muted-foreground">{b.message}</td>
                  <td className="py-3 pr-3">
                    <span className="inline-flex rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
