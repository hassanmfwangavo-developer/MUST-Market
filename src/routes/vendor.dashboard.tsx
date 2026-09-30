import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CalendarClock,
  ChefHat,
  ClipboardList,
  Coins,
  Loader2,
  Phone,
  ShoppingBag,
  Timer,
  UtensilsCrossed,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SmartImage } from "@/components/smart-image";
import { microUrl } from "@/lib/images";
import { formatTsh } from "@/lib/menu";
import { fetchVendors } from "@/lib/vendors";
import {
  fetchPortalAccess,
  fetchVendorMenu,
  fetchVendorOrders,
  fetchVendorPreOrders,
  groupPreOrders,
  ORDER_STATUS_LABEL,
  paymentBadgeClass,
  setMenuAvailability,
  statusBadgeClass,
  summarise,
  summariseOrderBatches,
  updateOrderStatus,
  type OrderStatus,
} from "@/lib/vendor-portal";
import { batchSlotLabel, hostelZoneLabel } from "@/lib/order-batches";

export const Route = createFileRoute("/vendor/dashboard")({
  head: () => ({
    meta: [
      { title: "Vendor Kitchen Portal — MUST Market" },
      {
        name: "description",
        content:
          "Private restaurant portal for Msosi Fasta vendors: live orders, pre-orders and menu availability.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: VendorDashboard,
});

const cardClass = "rounded-3xl border border-border bg-surface p-5 shadow-soft";
const TABS = [
  { key: "orders", label: "Live Orders", icon: ClipboardList },
  { key: "preorders", label: "Pre-Orders / Scheduled Days", icon: CalendarClock },
  { key: "menu", label: "Menu & Availability", icon: UtensilsCrossed },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const NEXT_ACTIONS: { status: OrderStatus; label: string }[] = [
  { status: "preparing", label: "Mark as Preparing" },
  { status: "delivering", label: "Mark as Delivering" },
  { status: "completed", label: "Mark as Completed" },
  { status: "cancelled", label: "Cancel" },
];

function VendorDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabKey>("orders");
  const [selectedVendor, setSelectedVendor] = useState<string>("all");

  const access = useQuery({ queryKey: ["portal-access"], queryFn: fetchPortalAccess });
  const role = access.data?.role ?? "none";
  const isAdmin = role === "admin";

  useEffect(() => {
    if (access.isLoading || !access.data) return;
    if (access.data.role === "none") {
      toast.error("Unauthorized Access — vendor portal is for restaurant partners only.");
      navigate({ to: "/", replace: true });
    }
  }, [access.data, access.isLoading, navigate]);

  const vendorsQuery = useQuery({
    queryKey: ["vendors"],
    queryFn: fetchVendors,
    enabled: isAdmin,
  });

  /** Vendors see only their own restaurant; admins can switch or view all. */
  const activeVendorId = isAdmin
    ? selectedVendor === "all"
      ? null
      : selectedVendor
    : (access.data?.vendorId ?? null);

  const enabled = role === "admin" || (role === "vendor" && Boolean(access.data?.vendorId));

  const orders = useQuery({
    queryKey: ["vendor-orders", activeVendorId ?? "all"],
    queryFn: () => fetchVendorOrders(activeVendorId),
    enabled,
  });
  const preOrders = useQuery({
    queryKey: ["vendor-pre-orders", activeVendorId ?? "all"],
    queryFn: () => fetchVendorPreOrders(activeVendorId),
    enabled,
  });
  const menu = useQuery({
    queryKey: ["vendor-menu", activeVendorId ?? "all"],
    queryFn: () => fetchVendorMenu(activeVendorId),
    enabled,
  });

  // Live order feed
  useEffect(() => {
    if (!enabled) return;
    const channel = supabase
      .channel("vendor-orders-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "food_orders" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["vendor-orders"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, queryClient]);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: (_d, vars) => {
      toast.success(`Order marked as ${ORDER_STATUS_LABEL[vars.status]}`);
      void queryClient.invalidateQueries({ queryKey: ["vendor-orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const availabilityMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: boolean }) => setMenuAvailability(id, next),
    onSuccess: (_d, vars) => {
      toast.success(vars.next ? "In Stock" : "Chakula kwa sasa Kimeisha");
      void queryClient.invalidateQueries({ queryKey: ["vendor-menu"] });
      void queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const stats = useMemo(() => summarise(orders.data ?? []), [orders.data]);
  const batchSummaries = useMemo(
    () => summariseOrderBatches(orders.data ?? []),
    [orders.data],
  );
  const grouped = useMemo(() => groupPreOrders(preOrders.data ?? []), [preOrders.data]);

  if (access.isLoading || role === "none") {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const vendorName = isAdmin
    ? selectedVendor === "all"
      ? "All Restaurants"
      : (vendorsQuery.data?.find((v) => v.id === selectedVendor)?.name ?? "Restaurant")
    : ((menu.data ?? []).find((m) => m.vendor_name)?.vendor_name || "Your Restaurant");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              <ChefHat className="h-3.5 w-3.5" /> Vendor Kitchen Portal
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {vendorName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Simamia oda za leo, pre-orders na upatikanaji wa chakula (Kimeisha).
            </p>
          </div>

          {isAdmin && (
            <label className="text-xs font-semibold text-muted-foreground">
              Switch Restaurant
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="mt-1 block h-11 w-56 rounded-xl border border-border bg-surface-2 px-3 text-sm font-medium text-foreground focus:border-primary focus:outline-none"
              >
                <option value="all">All Restaurants</option>
                {(vendorsQuery.data ?? []).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </header>

        {role === "vendor" && !access.data?.vendorId && (
          <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
            Your account is not linked to a restaurant yet. Please contact MUST Market support.
          </p>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={ShoppingBag} label="Total Lifetime Orders" value={String(stats.lifetime)} />
          <StatCard
            icon={ClipboardList}
            label="Today's Completed Orders"
            value={String(stats.completedToday)}
          />
          <StatCard icon={Coins} label="Total Revenue" value={formatTsh(stats.revenue, "TSh")} />
          <StatCard icon={Timer} label="Active / Pending Orders" value={String(stats.active)} />
        </div>

        {batchSummaries.length > 0 && (
          <section className={`${cardClass} mt-6`} aria-labelledby="batch-summary-title">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 id="batch-summary-title" className="text-lg font-bold text-foreground">
                  Batch Preparation Summary
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Jumla ya chakula cha kuandaa kwa kila delivery batch.
                </p>
              </div>
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent-foreground">
                {batchSummaries.reduce((total, batch) => total + batch.orderCount, 0)} orders
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {batchSummaries.map((batch) => (
                <article key={batch.slot} className="rounded-2xl border border-border bg-surface-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        {batchSlotLabel(batch.slot)}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {batch.orderCount} customer orders
                      </p>
                    </div>
                    <CalendarClock className="h-5 w-5 shrink-0 text-primary" />
                  </div>

                  <div className="mt-3 grid gap-2">
                    {batch.itemTotals.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2"
                      >
                        <span className="truncate text-sm font-medium text-foreground">{item.name}</span>
                        <span className="shrink-0 text-sm font-bold text-primary">Total: {item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {batch.zoneTotals.map((zone) => (
                      <span
                        key={zone.zone}
                        className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                      >
                        {hostelZoneLabel(zone.zone)} · {zone.orderCount}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <nav className="mt-6 flex flex-wrap gap-1.5 rounded-full border border-border bg-surface-2 p-1.5">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                tab === key
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        {tab === "orders" && (
          <section className={`${cardClass} mt-5`}>
            {orders.isLoading ? (
              <Spinner />
            ) : (orders.data ?? []).length === 0 ? (
              <Empty text="Hakuna oda bado." />
            ) : (
              <div className="grid gap-3">
                {(orders.data ?? []).map((o) => (
                  <article
                    key={o.id}
                    className="rounded-2xl border border-border bg-surface-2 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-foreground">
                          {o.customer_name || "Mteja"}
                        </h3>
                        <a
                          href={`tel:${o.phone}`}
                          className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-primary"
                        >
                          <Phone className="h-3 w-3" /> {o.phone || "—"}
                        </a>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {o.delivery_area || "—"} · Room {o.room || "—"}
                        </p>
                        {o.batch_slot && (
                          <p className="mt-1 text-xs font-semibold text-primary">
                            {batchSlotLabel(o.batch_slot)} · {hostelZoneLabel(o.hostel_zone)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusBadgeClass(o.status)}`}
                        >
                          {ORDER_STATUS_LABEL[o.status] ?? o.status}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${paymentBadgeClass(o.payment_status)}`}
                        >
                          {o.payment_status}
                        </span>
                      </div>
                    </div>

                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {o.items.map((it, i) => (
                        <li
                          key={`${o.id}-${i}`}
                          className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-foreground"
                        >
                          {it.quantity}× {it.name}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-base font-bold text-primary">
                        {formatTsh(o.total_tsh, "TSh")}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {NEXT_ACTIONS.filter((a) => a.status !== o.status).map((a) => (
                          <button
                            key={a.status}
                            type="button"
                            disabled={statusMutation.isPending}
                            onClick={() => statusMutation.mutate({ id: o.id, status: a.status })}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-transform hover:-translate-y-0.5 ${
                              a.status === "cancelled"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-primary-soft text-primary"
                            }`}
                          >
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "preorders" && (
          <section className={`${cardClass} mt-5`}>
            {preOrders.isLoading ? (
              <Spinner />
            ) : grouped.length === 0 ? (
              <Empty text="Hakuna pre-order bado." />
            ) : (
              <div className="grid gap-5">
                {grouped.map(([slot, list]) => (
                  <div key={slot}>
                    <h3 className="text-sm font-bold text-foreground">
                      {slot}{" "}
                      <span className="font-medium text-muted-foreground">({list.length})</span>
                    </h3>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {list.map((p) => (
                        <article
                          key={p.id}
                          className="rounded-2xl border border-border bg-surface-2 p-3"
                        >
                          <p className="text-sm font-semibold text-foreground">{p.item_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.customer_name} · {p.phone_number}
                          </p>
                          <p className="text-xs text-muted-foreground">{p.delivery_location}</p>
                          {p.message && (
                            <p className="mt-1 text-xs italic text-muted-foreground">“{p.message}”</p>
                          )}
                          <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                            {p.status}
                          </span>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "menu" && (
          <section className={`${cardClass} mt-5`}>
            {menu.isLoading ? (
              <Spinner />
            ) : (menu.data ?? []).length === 0 ? (
              <Empty text="Hakuna chakula kwenye menu." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {(menu.data ?? []).map((item) => (
                  <article
                    key={item.id}
                    className="flex gap-3 rounded-2xl border border-border bg-surface-2 p-3"
                  >
                    <SmartImage
                      src={microUrl(item.image_url ?? "")}
                      alt={item.name}
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-foreground">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                      <p className="text-sm font-bold text-primary">{formatTsh(item.price)}</p>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={item.is_available}
                        aria-label={`Availability for ${item.name}`}
                        disabled={availabilityMutation.isPending}
                        onClick={() =>
                          availabilityMutation.mutate({ id: item.id, next: !item.is_available })
                        }
                        className="mt-2 inline-flex items-center gap-2"
                      >
                        <span
                          className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                            item.is_available ? "bg-primary" : "bg-destructive/60"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                              item.is_available ? "left-[1.125rem]" : "left-0.5"
                            }`}
                          />
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            item.is_available ? "text-primary" : "text-destructive"
                          }`}
                        >
                          {item.is_available ? "In Stock" : "Kimeisha"}
                        </span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShoppingBag;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
      <span className="inline-grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-2 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function Spinner() {
  return (
    <div className="grid place-items-center py-16">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-12 text-center text-sm text-muted-foreground">{text}</p>;
}
