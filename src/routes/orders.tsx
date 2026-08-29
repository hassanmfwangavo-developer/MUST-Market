import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ClipboardList,
  MapPin,
  Phone,
  ShoppingBag,
  Utensils,
} from "lucide-react";
import { Footer } from "@/components/footer";
import { openAuthModal, useAuthUser } from "@/lib/auth-store";
import { fetchOrders, STATUS_LABEL, type FoodOrder } from "@/lib/orders";
import { formatTsh } from "@/lib/menu";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Maagizo Yangu – MUST Food Fasta" },
      {
        name: "description",
        content:
          "Angalia maagizo yako ya Msosi Fasta — status, muda wa kuwasili, na mahali pa kufikishiwa.",
      },
      { property: "og:title", content: "Maagizo Yangu – MUST Food Fasta" },
      {
        property: "og:description",
        content: "Angalia maagizo yako ya Msosi Fasta kwenye MUST Market.",
      },
    ],
    links: [{ rel: "canonical", href: "https://must-campus-swap.lovable.app/orders" }],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const navigate = useNavigate();
  const { user, initialized } = useAuthUser();

  const { data: orders, isLoading } = useQuery<FoodOrder[]>({
    queryKey: ["orders", user?.id ?? "anon"],
    queryFn: () => fetchOrders(user!.id),
    enabled: !!user,
  });

  const hasActive = useMemo(
    () => (orders ?? []).some((o) => ["pending", "preparing", "on_the_way"].includes(o.status)),
    [orders],
  );

  useEffect(() => {
    if (initialized && !user) {
      openAuthModal("/orders");
    }
  }, [initialized, user]);

  if (initialized && !user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <TopBar />
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-semibold tracking-tight">Ingia kwenye akaunti yako</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Unahitaji kuingia ili kuona maagizo yako ya Msosi Fasta.
          </p>
          <button
            onClick={() => openAuthModal("/orders")}
            className="mt-6 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
          >
            Ingia / Jiunge
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Maagizo Yangu</h1>
            <p className="text-sm text-muted-foreground">
              {orders?.length ? `${orders.length} agizo` : "Hakuna agizo bado"}
            </p>
          </div>
          {hasActive && (
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
              ● Agizo haija
            </span>
          )}
        </div>

        <div className="mt-5 space-y-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-2xl border border-border bg-surface"
                />
              ))
            : orders && orders.length > 0
              ? orders.map((o) => <OrderCard key={o.id} order={o} />)
              : (
                <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
                  <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">Bado hakuna agizo</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Agiza msosi kutoka cafeterias za chuo uanze.
                  </p>
                  <Link
                    to="/msosi"
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
                  >
                    <Utensils className="h-4 w-4" />
                    Agiza Sasa
                  </Link>
                </div>
              )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function TopBar() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-2xl items-center gap-3 px-4 sm:px-6">
        <button
          onClick={() => navigate("/msosi")}
          className="grid h-9 w-9 place-items-center rounded-full text-foreground transition-colors hover:bg-surface-2"
          aria-label="Rudi nyuma"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-base font-semibold tracking-tight">Maagizo Yangu</span>
      </div>
    </header>
  );
}

function OrderCard({ order }: { order: FoodOrder }) {
  const firstItem = order.items?.[0];
  const extra = Math.max(0, (order.items?.length ?? 0) - 1);
  const active = ["pending", "preparing", "on_the_way"].includes(order.status);

  return (
    <Link
      to="/msosi/success/$orderId"
      params={{ orderId: order.id }}
      className="block rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {firstItem?.name ?? "Agizo"}
            {extra > 0 && <span className="text-muted-foreground"> +{extra} zaidi</span>}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            #{order.id.slice(0, 8)}
          </p>
        </div>
        <span className="whitespace-nowrap text-sm font-bold text-amber-600">
          {formatTsh(order.total_tsh)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 font-semibold ${
            active
              ? "bg-emerald-500/10 text-emerald-600"
              : "bg-surface-2 text-muted-foreground"
          }`}
        >
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
        {order.delivery_area && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {order.delivery_area}
            {order.room ? ` · ${order.room}` : ""}
          </span>
        )}
        {order.phone && (
          <span className="inline-flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {order.phone}
          </span>
        )}
      </div>
    </Link>
  );
}
