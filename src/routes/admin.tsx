import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BadgeCheck,
  Eye,
  Loader2,
  MessageCircle,
  PackageOpen,
  Search,
  ShieldCheck,
  Trash2,
  ArrowUp,
  ArrowDown,
  LayoutList,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SmartImage } from "@/components/smart-image";
import { microUrl } from "@/lib/images";
import { ADMIN_EMAIL } from "@/lib/admin";
import { fetchShelves, SHELF_OPTIONS, type HomepageShelf } from "@/lib/shelves";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — MUST Market" },
      {
        name: "description",
        content: "Private moderation console for MUST Market listings, views and WhatsApp clicks.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

interface AdminProduct {
  id: string;
  title: string;
  price_tsh: number;
  status: string;
  view_count: number;
  whatsapp_clicks_count: number;
  whatsapp_number: string | null;
  images: string[] | null;
  featured_shelf: string | null;
  created_at: string;
}

async function fetchAllProducts(): Promise<AdminProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,title,price_tsh,status,view_count,whatsapp_clicks_count,whatsapp_number,images,featured_shelf,created_at",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminProduct[];
}

/** Pulls the storage object path out of a signed/public product image URL. */
function storagePath(url: string): string | null {
  const marker = "/product-images/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length).split("?")[0]);
}

const tsh = (n: number) => `TSh ${n.toLocaleString("en-US")}`;

function AdminPage() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email?.toLowerCase();
      const ok = email === ADMIN_EMAIL;
      if (cancelled) return;
      setAllowed(ok);
      if (!ok) {
        toast.error("Access Denied: Administrator rights required.");
        navigate({ to: "/", replace: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (allowed !== true) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return <AdminConsole />;
}

function AdminConsole() {
  const queryClient = useQueryClient();
  const [term, setTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "sold">("all");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: fetchAllProducts,
  });

  const kpis = useMemo(() => {
    return {
      active: products.filter((p) => p.status === "active").length,
      sold: products.filter((p) => p.status === "sold").length,
      views: products.reduce((s, p) => s + (p.view_count ?? 0), 0),
      clicks: products.reduce((s, p) => s + (p.whatsapp_clicks_count ?? 0), 0),
    };
  }, [products]);

  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase();
    return products.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        (p.whatsapp_number ?? "").toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q)
      );
    });
  }, [products, term, statusFilter]);

  const toggleStatus = useMutation({
    mutationFn: async (p: AdminProduct) => {
      const next = p.status === "active" ? "sold" : "active";
      const { error } = await supabase
        .from("products")
        .update({ status: next as "active" | "sold" })
        .eq("id", p.id);
      if (error) throw error;
      return next;
    },
    onSuccess: (next) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(next === "sold" ? "Marked as SOLD OUT 🔥" : "Listing is live again");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (p: AdminProduct) => {
      const paths = (p.images ?? []).map(storagePath).filter((v): v is string => Boolean(v));
      if (paths.length) {
        await supabase.storage.from("product-images").remove(paths);
      }
      const { error } = await supabase.from("products").delete().eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Listing deleted permanently");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const assignShelf = useMutation({
    mutationFn: async ({ id, shelf }: { id: string; shelf: string }) => {
      const { error } = await supabase
        .from("products")
        .update({ featured_shelf: shelf === "" ? null : shelf })
        .eq("id", id);
      if (error) throw error;
      return shelf;
    },
    onSuccess: (shelf) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(shelf ? "Shelf updated" : "Removed from shelf");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">
              Moderate listings, watch traffic, remove scams.
            </p>
          </div>
        </div>

        <ShelfManager />

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Active listings" value={kpis.active} icon={<PackageOpen className="h-4 w-4" />} />
          <KpiCard label="Sold items" value={kpis.sold} icon={<BadgeCheck className="h-4 w-4" />} />
          <KpiCard label="Total page views" value={kpis.views} icon={<Eye className="h-4 w-4" />} />
          <KpiCard
            label="WhatsApp clicks"
            value={kpis.clicks}
            icon={<MessageCircle className="h-4 w-4" />}
          />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search by title, seller phone or status…"
              className="h-11 w-full rounded-full border border-border bg-surface-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/80 focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10"
            />
          </div>
          <div className="flex gap-1.5">
            {(["all", "active", "sold"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
          {isLoading ? (
            <div className="grid place-items-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">No listings match.</p>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
                  <SmartImage
                    src={microUrl(p.images?.[0] ?? "")}
                    alt={p.title}
                    aspect="aspect-square"
                    wrapperClassName="h-14 w-14 shrink-0 rounded-xl"
                    fallback={
                      <div className="grid h-full w-full place-items-center text-lg">📦</div>
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{p.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {tsh(p.price_tsh)} · {p.whatsapp_number ?? "no phone"} · {p.view_count} views ·{" "}
                      {p.whatsapp_clicks_count} clicks
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${
                      p.status === "active"
                        ? "bg-primary-soft text-primary"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {p.status}
                  </span>
                  <select
                    value={p.featured_shelf ?? ""}
                    onChange={(e) => assignShelf.mutate({ id: p.id, shelf: e.target.value })}
                    aria-label={`Assigned shelf for ${p.title}`}
                    className="h-9 rounded-full border border-border bg-surface-2 px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                  >
                    {SHELF_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStatus.mutate(p)}
                      disabled={toggleStatus.isPending}
                      className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary hover:text-primary disabled:opacity-50"
                    >
                      {p.status === "active" ? "Mark sold" : "Reactivate"}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Permanently delete "${p.title}"? This cannot be undone.`)) {
                          remove.mutate(p);
                        }
                      }}
                      disabled={remove.isPending}
                      aria-label={`Delete ${p.title}`}
                      className="grid h-8 w-8 place-items-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {value.toLocaleString("en-US")}
      </p>
    </div>
  );
}

function ShelfManager() {
  const queryClient = useQueryClient();
  const { data: shelves = [], isLoading } = useQuery<HomepageShelf[]>({
    queryKey: ["homepage-shelves"],
    queryFn: fetchShelves,
  });

  const save = useMutation({
    mutationFn: async (rows: { id: string; position_order?: number; is_visible?: boolean }[]) => {
      for (const r of rows) {
        const patch: { position_order?: number; is_visible?: boolean } = {};
        if (r.position_order !== undefined) patch.position_order = r.position_order;
        if (r.is_visible !== undefined) patch.is_visible = r.is_visible;
        const { error } = await supabase.from("homepage_shelves").update(patch).eq("id", r.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage-shelves"] });
      toast.success("Homepage shelves updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= shelves.length) return;
    const a = shelves[index];
    const b = shelves[target];
    save.mutate([
      { id: a.id, position_order: b.position_order },
      { id: b.id, position_order: a.position_order },
    ]);
  };

  return (
    <div className="mt-6 rounded-2xl border border-border bg-surface p-4 shadow-soft sm:p-5">
      <div className="flex items-center gap-2">
        <LayoutList className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Manage homepage shelves</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Reorder shelves or hide them seasonally. Changes apply to the homepage instantly.
      </p>

      {isLoading ? (
        <div className="grid place-items-center py-8">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
          {shelves.map((s, i) => (
            <li key={s.id} className="flex flex-wrap items-center gap-3 p-3">
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {s.display_name}
              </span>
              <button
                onClick={() => save.mutate([{ id: s.id, is_visible: !s.is_visible }])}
                disabled={save.isPending}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                  s.is_visible
                    ? "bg-primary-soft text-primary"
                    : "bg-surface-2 text-muted-foreground"
                }`}
              >
                {s.is_visible ? "Visible" : "Hidden"}
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0 || save.isPending}
                  aria-label={`Move ${s.display_name} up`}
                  className="grid h-8 w-8 place-items-center rounded-full border border-border bg-surface-2 text-foreground hover:border-primary hover:text-primary disabled:opacity-40"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === shelves.length - 1 || save.isPending}
                  aria-label={`Move ${s.display_name} down`}
                  className="grid h-8 w-8 place-items-center rounded-full border border-border bg-surface-2 text-foreground hover:border-primary hover:text-primary disabled:opacity-40"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
