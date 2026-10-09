import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarClock,
  ChefHat,
  ExternalLink,
  Images,
  LayoutGrid,
  Loader2,
  Menu,
  MessageCircle,
  PackageOpen,
  ShieldCheck,
  Star,
  Store,
  UtensilsCrossed,
  Wrench,
  X,
  ClipboardList,
  Hourglass,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchPortalAccess } from "@/lib/vendor-portal";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

type NavItem = {
  to: string;
  label: string;
  icon: typeof ShieldCheck;
  exact?: boolean;
  search?: Record<string, string>;
};

const SECTIONS: { title: string; items: NavItem[] }[] = [
  { title: "Overview", items: [{ to: "/admin", label: "Dashboard Home", icon: ShieldCheck, exact: true }] },
  {
    title: "Marketplace",
    items: [
      { to: "/admin", label: "Listings & Moderation", icon: PackageOpen, exact: true },
      { to: "/admin/banners", label: "Banner Slideshows", icon: Images },
      { to: "/admin/categories", label: "Categories", icon: LayoutGrid },
    ],
  },
  {
    title: "Msosi Fasta & Food",
    items: [
      { to: "/admin/food", label: "Msosi Pre-Orders", icon: CalendarClock, search: { tab: "preorders" } },
      { to: "/admin/food", label: "Vyakula & Menus", icon: UtensilsCrossed, search: { tab: "food" } },
      { to: "/admin/food", label: "Migahawa & Logos", icon: Store, search: { tab: "vendors" } },
      { to: "/admin/food", label: "Testimonials & Reviews", icon: Star, search: { tab: "reviews" } },
      { to: "/admin/preorders", label: "Batch Pre-Orders Queue", icon: ClipboardList },
    ],
  },
  { title: "Services & Books", items: [{ to: "/admin/services", label: "Service Mall", icon: Wrench }] },
  { title: "Vendor & Access", items: [{ to: "/admin/staff", label: "Vendor Access", icon: ChefHat }] },
];

async function countOf(q: PromiseLike<{ count: number | null; error: unknown }>) {
  const { count, error } = await q;
  return error ? 0 : (count ?? 0);
}

function AdminLayout() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const access = await fetchPortalAccess();
      if (cancelled) return;
      const ok = access.role === "admin";
      setAllowed(ok);
      if (ok) {
        const { data } = await supabase.auth.getUser();
        if (!cancelled) setEmail(data.user?.email ?? "");
        return;
      }
      toast.error("Unauthorized Access: Administrator rights required.");
      navigate({ to: access.role === "vendor" ? "/vendor/dashboard" : "/", replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const { data: metrics } = useQuery({
    queryKey: ["admin-top-metrics"],
    enabled: allowed === true,
    queryFn: async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const iso = start.toISOString();
      const [active, batch, msosi, pending, clicks] = await Promise.all([
        countOf(supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "active")),
        countOf(supabase.from("batch_preorders").select("id", { count: "exact", head: true }).gte("created_at", iso)),
        countOf(supabase.from("msosi_pre_orders").select("id", { count: "exact", head: true }).gte("created_at", iso)),
        countOf(
          supabase
            .from("msosi_pre_orders")
            .select("id", { count: "exact", head: true })
            .eq("status" as never, "pending" as never),
        ),
        supabase.from("products").select("whatsapp_clicks_count"),
      ]);
      const totalClicks = (clicks.data ?? []).reduce((s, r) => s + (r.whatsapp_clicks_count ?? 0), 0);
      return { active, today: batch + msosi, pending, clicks: totalClicks };
    },
  });

  if (allowed !== true) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const cards = [
    { label: "Active Listings", value: metrics?.active, icon: PackageOpen },
    { label: "Today's Pre-Orders", value: metrics?.today, icon: CalendarClock },
    { label: "Pending Vendor Approvals", value: metrics?.pending, icon: Hourglass },
    { label: "WhatsApp Clicks", value: metrics?.clicks, icon: MessageCircle },
  ];

  const sidebar = (
    <nav className="flex flex-col gap-5 p-4">
      {SECTIONS.map((s) => (
        <div key={s.title}>
          <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {s.title}
          </p>
          <ul className="flex flex-col gap-0.5">
            {s.items.map((it) => (
              <li key={it.label}>
                <Link
                  to={it.to}
                  search={it.search as never}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: it.exact ?? false, includeSearch: !!it.search }}
                  activeProps={{ className: "bg-primary text-primary-foreground shadow-soft" }}
                  inactiveProps={{ className: "text-foreground/80 hover:bg-surface-2" }}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors"
                >
                  <it.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{it.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 overflow-y-auto border-r border-border bg-surface lg:block">
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <span className="font-semibold text-foreground">MUST Admin</span>
        </div>
        {sidebar}
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-surface shadow-soft">
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <span className="font-semibold text-foreground">MUST Admin</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur sm:px-6">
          <button
            className="grid h-9 w-9 place-items-center rounded-xl border border-border lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <span className="hidden items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary sm:flex">
            <span className="h-2 w-2 rounded-full bg-primary" /> System Online
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary hover:text-primary"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Go to Public Site
            </Link>
            <span className="flex items-center gap-2 rounded-full bg-surface-2 px-2 py-1">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {(email[0] ?? "A").toUpperCase()}
              </span>
              <span className="hidden max-w-[10rem] truncate pr-1 text-xs font-medium text-foreground md:block">
                {email || "Admin"}
              </span>
            </span>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {cards.map((c) => (
              <div key={c.label} className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <c.icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{c.label}</span>
                </div>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {c.value === undefined ? "—" : c.value.toLocaleString("en-US")}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
