import { ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_ACCEPT } from "@/lib/uploads";
import { microUrl } from "@/lib/images";

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BarChart3,
  Eye,
  Loader2,
  PackageOpen,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { openAuthModal, useAuthUser } from "@/lib/auth-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Seller Dashboard — MUST Market" },
      {
        name: "description",
        content: "Manage your MUST Market listings, edit prices, and delete sold items.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardPage,
});

interface MyProduct {
  id: string;
  title: string;
  description: string;
  price_tsh: number;
  images: string[] | null;
  status: string;
  view_count: number;
  created_at: string;
}

async function fetchMyProducts(userId: string): Promise<MyProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id,title,description,price_tsh,images,status,view_count,created_at")
    .eq("seller_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MyProduct[];
}

function DashboardPage() {
  const { user, initialized } = useAuthUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && !user) openAuthModal();
  }, [initialized, user]);

  if (!initialized) {
    return (
      <FullPageState>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </FullPageState>
    );
  }
  if (!user) {
    return (
      <FullPageState>
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Sign in to view your dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your listings, views, and edit controls live behind sign-in.
          </p>
          <button
            onClick={() => openAuthModal()}
            className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft"
          >
            Sign in
          </button>
        </div>
      </FullPageState>
    );
  }

  return <DashboardContent userId={user.id} onGoSell={() => navigate({ to: "/sell" })} />;
}

function FullPageState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="grid flex-1 place-items-center px-4 py-20">{children}</main>
      <Footer />
    </div>
  );
}

function DashboardContent({ userId, onGoSell }: { userId: string; onGoSell: () => void }) {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["my-products", userId],
    queryFn: () => fetchMyProducts(userId),
  });

  const [editing, setEditing] = useState<MyProduct | null>(null);
  const [deleting, setDeleting] = useState<MyProduct | null>(null);

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status === "active").length;
    const views = products.reduce((s, p) => s + (p.view_count || 0), 0);
    return { total, active, views };
  }, [products]);

  const soldMutation = useMutation({
    mutationFn: async (p: MyProduct) => {
      const next = p.status === "sold" ? "active" : "sold";
      const { error } = await supabase.from("products").update({ status: next }).eq("id", p.id);
      if (error) throw error;
      return next;
    },
    onSuccess: (next) => {
      toast.success(next === "sold" ? "Marked as sold" : "Listing is available again");
      queryClient.invalidateQueries({ queryKey: ["my-products", userId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Listing removed");
      queryClient.invalidateQueries({ queryKey: ["my-products", userId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeleting(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">
              Seller dashboard
            </div>
            <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Seller Dashboard
            </h1>
          </div>
          <button
            onClick={onGoSell}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground shadow-[var(--shadow-amber)] sm:px-5 sm:py-3"
          >
            <Sparkles className="h-4 w-4" strokeWidth={2.4} />
            New listing
          </button>
        </header>

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total posted items"
            value={stats.total}
            icon={<PackageOpen className="h-4 w-4" />}
          />
          <StatCard
            label="Active listings"
            value={stats.active}
            icon={<BarChart3 className="h-4 w-4" />}
          />
          <StatCard label="Total views" value={stats.views} icon={<Eye className="h-4 w-4" />} />
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">Your listings</h2>
          {isLoading ? (
            <div className="mt-4 grid gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-2" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="mt-4 rounded-3xl border border-dashed border-border bg-surface p-10 text-center">
              <p className="text-sm text-muted-foreground">No listings yet.</p>
              <button
                onClick={onGoSell}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                <Plus className="h-4 w-4" /> Create your first listing
              </button>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {products.map((p) => (
                <li
                  key={p.id}
                  className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border bg-surface p-3 shadow-soft sm:grid-cols-[80px_minmax(0,1fr)_auto] sm:p-4"
                >
                  <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-surface-2 sm:h-20 sm:w-20">
                    {p.images?.[0] ? (
                      <img
                        src={microUrl(p.images[0])}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />

                    ) : (
                      <PackageOpen className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground sm:text-base">
                      {p.title}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>TSh {p.price_tsh.toLocaleString("en-US")}</span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {p.view_count}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                          p.status === "active"
                            ? "bg-primary-soft text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      to="/product/$id"
                      params={{ id: p.id }}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-primary"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => soldMutation.mutate(p)}
                      disabled={soldMutation.isPending && soldMutation.variables?.id === p.id}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
                        p.status === "sold"
                          ? "border border-primary/40 text-primary hover:bg-primary-soft"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                    >
                      {p.status === "sold" ? "Mark Available" : "Mark as Sold"}
                    </button>
                    <button
                      onClick={() => setEditing(p)}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/40 hover:text-primary"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleting(p)}
                      className="inline-flex items-center gap-1 rounded-full border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />

      {editing && (
        <EditModal
          product={editing}
          userId={userId}
          onClose={() => setEditing(null)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["my-products", userId] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            setEditing(null);
          }}
        />
      )}

      {deleting && (
        <ConfirmModal
          title="Remove listing?"
          description={`"${deleting.title}" will be pulled off the marketplace immediately.`}
          confirmLabel="Delete"
          busy={deleteMutation.isPending}
          onCancel={() => setDeleting(null)}
          onConfirm={() => deleteMutation.mutate(deleting.id)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-soft text-primary">
          {icon}
        </span>
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        {value.toLocaleString("en-US")}
      </div>
    </div>
  );
}

function EditModal({
  product,
  userId,
  onClose,
  onSaved,
}: {
  product: MyProduct;
  userId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price_tsh));
  const [images, setImages] = useState<string[]>(product.images ?? []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleAddImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      e.target.value = "";
      return toast.error("Only JPEG, PNG, WebP or GIF images are allowed");
    }
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5MB");
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const { data: signed, error: sErr } = await supabase.storage
        .from("product-images")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (sErr || !signed) throw sErr ?? new Error("Sign url failed");
      setImages((prev) => [...prev, signed.signedUrl]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({
          title: title.trim(),
          description: description.trim(),
          price_tsh: Math.max(0, Math.round(Number(price) || 0)),
          images,
        })
        .eq("id", product.id);
      if (error) throw error;
      toast.success("Listing updated");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
      />
      <form
        onSubmit={handleSave}
        className="relative z-10 w-full max-w-lg space-y-5 rounded-t-3xl bg-surface p-6 shadow-lift sm:rounded-3xl sm:p-8 animate-scale-in max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold text-foreground">Edit listing</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <Field label="Title">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </Field>
        <Field label="Description">
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </Field>
        <Field label="Price (TSh)">
          <input
            required
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))}
            className="w-full rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </Field>

        <Field label="Photos">
          <div className="grid grid-cols-3 gap-2">
            {images.map((url, i) => (
              <div
                key={url + i}
                className="group relative aspect-square overflow-hidden rounded-xl bg-surface-2"
              >
                <img
                  src={microUrl(url)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-foreground/70 text-white opacity-0 group-hover:opacity-100"
                  aria-label="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {images.length < 3 && (
              <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border border-dashed border-border bg-surface-2 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "+ Add"}
                <input type="file" accept={ALLOWED_IMAGE_ACCEPT} className="hidden" onChange={handleAddImage} />
              </label>
            )}
          </div>
        </Field>

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-70"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save changes
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function ConfirmModal({
  title,
  description,
  confirmLabel,
  busy,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <button
        aria-label="Close"
        onClick={onCancel}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-surface p-6 shadow-lift animate-scale-in">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <Trash2 className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-2"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-full bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground disabled:opacity-70"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
