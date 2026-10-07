import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock3, MapPin, Phone, Store, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingModal } from "@/components/booking-modal";
import { VendorPreorderDialog } from "@/components/vendor-preorder-dialog";
import { fetchVendorMenuItems, formatTsh, type MenuItem } from "@/lib/menu";
import { fetchVendor } from "@/lib/vendors";

export const Route = createFileRoute("/msosi/vendor/$id")({
  head: () => ({ meta: [
    { title: "Restaurant Menu — Msosi Fasta" },
    { name: "description", content: "Browse an active campus restaurant menu, pre-order delivery, or reserve a meal for pickup and dine-in." },
    { property: "og:title", content: "Restaurant Menu — Msosi Fasta" },
    { property: "og:description", content: "Campus restaurant menus with delivery pre-orders and meal reservations." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: VendorMenuPage,
  errorComponent: () => <PageMessage text="Menu ya mgahawa haikupatikana." />,
  notFoundComponent: () => <PageMessage text="Mgahawa huu haupatikani." />,
});

const categoryOrder = ["Mchana", "Usiku", "Vinywaji / Extras"] as const;
function groupLabel(category: string) {
  const value = category.toLowerCase();
  if (/drink|soda|juice|water|extra|kinywaji|vinywaji/.test(value)) return "Vinywaji / Extras";
  if (/dinner|night|usiku|jioni/.test(value)) return "Usiku";
  return "Mchana";
}

function VendorMenuPage() {
  const { id } = Route.useParams();
  const [deliveryMeal, setDeliveryMeal] = useState<MenuItem | null>(null);
  const [bookingMeal, setBookingMeal] = useState<MenuItem | null>(null);
  const vendorQuery = useQuery({ queryKey: ["vendor", id], queryFn: () => fetchVendor(id) });
  const menuQuery = useQuery({ queryKey: ["vendor-menu-public", id], queryFn: () => fetchVendorMenuItems(id) });
  const groups = useMemo(() => categoryOrder.map((label) => ({ label, meals: (menuQuery.data ?? []).filter((meal) => groupLabel(meal.category) === label) })).filter((group) => group.meals.length > 0), [menuQuery.data]);
  const vendor = vendorQuery.data;

  if (vendorQuery.isLoading || menuQuery.isLoading) return <VendorSkeleton />;
  if (!vendor) return <PageMessage text="Mgahawa huu haupatikani." />;

  return (
    <main className="min-h-screen bg-background pb-16">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <Button asChild variant="ghost" className="-ml-3 text-muted-foreground hover:text-primary"><Link to="/msosi"><ArrowLeft />Rudi Kwenye Migahawa Zote</Link></Button>
        </div>
      </header>
      <section className="border-b border-border bg-surface-2">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
          {vendor.logo_url ? <img src={vendor.logo_url} alt={vendor.name} className="h-24 w-24 rounded-lg border border-border bg-surface object-cover" /> : <span className="grid h-24 w-24 place-items-center rounded-lg border border-border bg-surface text-primary"><Store className="h-10 w-10" /></span>}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">{vendor.name}</h1>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <Info icon={MapPin}>{vendor.location || "MUST Campus"}</Info>
              <Info icon={Clock3}>{vendor.operating_hours || "Hours available from restaurant"}</Info>
              {vendor.support_phone && <Info icon={Phone}><a href={`tel:${vendor.support_phone}`} className="font-semibold text-primary">{vendor.support_phone}</a></Info>}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">{(vendor.dropoff_zones.length ? vendor.dropoff_zones : ["Campus pickup & delivery"]).map((zone) => <span key={zone} className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-foreground">{zone}</span>)}</div>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-8 sm:px-6">
        {groups.length === 0 ? <PageMessage text="Hakuna chakula kwenye menu hii kwa sasa." compact /> : groups.map((group) => (
          <section key={group.label}>
            <div className="mb-4 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-md bg-primary-soft text-primary"><Utensils /></span><div><h2 className="text-xl font-extrabold text-foreground">{group.label}</h2><p className="text-xs text-muted-foreground">{group.meals.length} meal{group.meals.length === 1 ? "" : "s"}</p></div></div>
            <div className="grid gap-4 md:grid-cols-2">{group.meals.map((meal) => <MealCard key={meal.id} meal={meal} onDelivery={() => setDeliveryMeal(meal)} onBooking={() => setBookingMeal(meal)} />)}</div>
          </section>
        ))}
      </div>
      <VendorPreorderDialog meal={deliveryMeal} vendorId={vendor.id} open={Boolean(deliveryMeal)} onOpenChange={(open) => { if (!open) setDeliveryMeal(null); }} />
      {bookingMeal && <BookingModal itemId={bookingMeal.id} itemName={bookingMeal.name} dayBadge={bookingMeal.day_badge} quickReservation onClose={() => setBookingMeal(null)} />}
    </main>
  );
}

function MealCard({ meal, onDelivery, onBooking }: { meal: MenuItem; onDelivery: () => void; onBooking: () => void }) {
  const soldOut = !meal.is_available;
  return <article className={`overflow-hidden rounded-lg border border-border bg-surface shadow-card ${soldOut ? "opacity-65" : ""}`}><div className="flex gap-3 p-3">{meal.image_url ? <img src={meal.image_url} alt={meal.name} className="h-24 w-24 shrink-0 rounded-md object-cover" /> : <span className="grid h-24 w-24 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground"><Utensils /></span>}<div className="min-w-0 flex-1"><h3 className="font-extrabold text-foreground">{meal.name}</h3><p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{meal.description}</p><p className="mt-2 font-extrabold text-primary">{formatTsh(meal.price, "TSh")}</p></div></div><div className="grid grid-cols-2 gap-2 border-t border-border p-3">{soldOut ? <Button disabled className="col-span-2">Kimeisha kwa Leo</Button> : <><Button type="button" onClick={onDelivery}>Pre-Order (Delivery)</Button><Button type="button" variant="outline" onClick={onBooking} className="whitespace-normal">Book / Weka Akiba</Button></>}</div></article>;
}

function Info({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) { return <span className="inline-flex items-center gap-1.5"><Icon className="h-4 w-4 text-primary" />{children}</span>; }
function PageMessage({ text, compact = false }: { text: string; compact?: boolean }) { return <main className={`grid place-items-center bg-background p-6 text-center ${compact ? "min-h-40" : "min-h-screen"}`}><div><Store className="mx-auto h-9 w-9 text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">{text}</p>{!compact && <Button asChild variant="link" className="mt-2"><Link to="/msosi">Rudi Msosi Fasta</Link></Button>}</div></main>; }
function VendorSkeleton() { return <main className="min-h-screen bg-background"><div className="mx-auto max-w-5xl space-y-5 px-4 py-8"><div className="h-28 animate-pulse rounded-lg bg-muted" /><div className="grid gap-4 md:grid-cols-2">{[0,1,2,3].map((item) => <div key={item} className="h-44 animate-pulse rounded-lg bg-muted" />)}</div></div></main>; }