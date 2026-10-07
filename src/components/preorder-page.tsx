import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  Minus,
  Plus,
  ReceiptText,
  Moon,
  Soup,
  Sun,
  Utensils,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { fetchPreorderMeals, PREORDER_MEALS_KEY, submitBatchPreorder } from "@/lib/batch-preorders";
import { sanitizeTzPhoneStrict } from "@/lib/formatters";
import { formatTsh } from "@/lib/menu";
import {
  BATCH_SLOTS,
  HOSTEL_ZONES,
  type BatchSlot,
  type HostelZone,
} from "@/lib/order-batches";

type Receipt = {
  id: string;
  batch: BatchSlot;
  zone: HostelZone;
  name: string;
  phone: string;
  room: string;
  items: Array<{ id: string; name: string; quantity: number; subtotal: number }>;
  total: number;
};

export function PreorderPage() {
  const { data: meals = [], isLoading, isError } = useQuery({
    queryKey: PREORDER_MEALS_KEY,
    queryFn: fetchPreorderMeals,
  });
  const [batch, setBatch] = useState<BatchSlot | "">("");
  const [zone, setZone] = useState<HostelZone | "">("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [room, setRoom] = useState("");
  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const available = useMemo(() => meals.filter((meal) => meal.is_active), [meals]);
  const selected = useMemo(
    () => available.filter((meal) => (quantities[meal.id] ?? 0) > 0),
    [available, quantities],
  );
  const total = selected.reduce(
    (sum, meal) => sum + meal.price_tsh * (quantities[meal.id] ?? 0),
    0,
  );
  const selectedCount = selected.reduce((sum, meal) => sum + (quantities[meal.id] ?? 0), 0);

  const changeQuantity = (id: string, delta: number) => {
    setQuantities((current) => ({
      ...current,
      [id]: Math.max(0, Math.min(20, (current[id] ?? 0) + delta)),
    }));
  };

  const submit = async () => {
    const normalizedPhone = sanitizeTzPhoneStrict(phone);
    if (!batch) return toast.error("Chagua Lunch au Dinner batch.");
    if (selected.length === 0) return toast.error("Chagua angalau chakula kimoja.");
    if (!zone) return toast.error("Chagua hostel drop zone yako.");
    if (name.trim().length < 2) return toast.error("Weka jina lako kamili.");
    if (!normalizedPhone) return toast.error("Weka namba sahihi ya simu, mfano 07XXXXXXXX.");
    if (!room.trim()) return toast.error("Weka namba ya chumba au maelezo ya eneo.");
    if (saving) return;

    setSaving(true);
    try {
      const items = selected.map((meal) => ({
        mealId: meal.id,
        name: meal.name,
        price: meal.price_tsh,
        quantity: quantities[meal.id] ?? 0,
      }));
      const id = await submitBatchPreorder({
        items,
        total,
        batchSlot: batch,
        hostelZone: zone,
        customerName: name,
        phone: normalizedPhone,
        room,
      });
      toast.dismiss();
      setReceipt({
        id,
        batch,
        zone,
        name: name.trim(),
        phone: normalizedPhone,
        room: room.trim(),
        items: selected.map((meal) => ({
          id: meal.id,
          name: meal.name,
          quantity: quantities[meal.id] ?? 0,
          subtotal: meal.price_tsh * (quantities[meal.id] ?? 0),
        })),
        total,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Imeshindikana kutuma pre-order.");
    } finally {
      setSaving(false);
    }
  };

  if (receipt) return <PreorderReceipt receipt={receipt} />;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          <Button asChild variant="ghost" className="-ml-3 text-muted-foreground hover:text-primary">
            <Link to="/msosi">
              <ArrowLeft />
              Rudi Msosi Fasta
            </Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-7 sm:px-6 sm:py-10">
        <section className="border-b border-border pb-7 text-center sm:pb-9">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-accent-soft text-accent-foreground" aria-hidden>
            <Soup className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-foreground sm:text-3xl">
            MSOSI FASTA BATCH PRE-ORDER
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Agiza chakula mapema kulingana na Hostel yako kwa delivery ya pamoja!
          </p>
        </section>

        <div className="space-y-9 py-7 sm:py-9">
          <FormSection number="1" title="Chagua batch" description="Chagua muda unaotaka chakula kifike.">
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Delivery batch">
              {BATCH_SLOTS.map((slot) => {
                const active = batch === slot.value;
                return (
                  <Button
                    key={slot.value}
                    type="button"
                    variant="outline"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setBatch(slot.value)}
                    className={`h-auto min-h-28 justify-start whitespace-normal rounded-lg p-4 text-left ${active ? "border-primary bg-primary-soft ring-2 ring-primary/20 hover:bg-primary-soft" : "bg-surface"}`}
                  >
                    <span className="text-primary" aria-hidden>
                      {slot.value === "lunch" ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-bold text-foreground">{slot.title}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                        Agiza kabla ya {slot.orderBy} → Delivery {slot.deliveryAt}
                      </span>
                    </span>
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${active ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}>
                      {active && <Check className="h-3 w-3" />}
                    </span>
                  </Button>
                );
              })}
            </div>
          </FormSection>

          <FormSection number="2" title="Chagua chakula" description="Ongeza idadi ya kila chakula unachotaka.">
            {isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2" aria-label="Inapakia chakula">
                {[0, 1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />)}
              </div>
            ) : isError ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                Orodha ya chakula haikupatikana. Tafadhali jaribu tena.
              </p>
            ) : available.length === 0 ? (
              <p className="rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
                Hakuna chakula cha pre-order kwa sasa.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {available.map((meal) => {
                  const quantity = quantities[meal.id] ?? 0;
                  return (
                    <article key={meal.id} className={`flex min-h-28 gap-3 rounded-lg border p-3 transition-colors ${quantity > 0 ? "border-primary bg-primary-soft" : "border-border bg-surface"}`}>
                      {meal.image_url ? (
                        <img src={meal.image_url} alt={meal.name} className="h-20 w-20 shrink-0 rounded-md object-cover" />
                      ) : (
                        <span className="grid h-20 w-20 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                          <Utensils className="h-6 w-6" />
                        </span>
                      )}
                      <div className="flex min-w-0 flex-1 flex-col">
                        <h3 className="line-clamp-2 text-sm font-bold text-foreground">{meal.name}</h3>
                        <p className="mt-1 text-sm font-bold text-primary">{formatTsh(meal.price_tsh, "TSh")}</p>
                        <div className="mt-auto flex items-center justify-end gap-2">
                          <Button type="button" variant="outline" size="icon" aria-label={`Punguza ${meal.name}`} disabled={quantity === 0} onClick={() => changeQuantity(meal.id, -1)}>
                            <Minus />
                          </Button>
                          <span className="w-6 text-center text-sm font-bold text-foreground" aria-live="polite">{quantity}</span>
                          <Button type="button" size="icon" aria-label={`Ongeza ${meal.name}`} onClick={() => changeQuantity(meal.id, 1)}>
                            <Plus />
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </FormSection>

          <FormSection number="3" title="Chagua hostel drop zone" description="Chakula chako kitafikishwa kwenye eneo hili.">
            <div className="grid gap-2" role="radiogroup" aria-label="Hostel drop zone">
              {HOSTEL_ZONES.map((hostel) => {
                const active = zone === hostel.value;
                return (
                  <Button
                    key={hostel.value}
                    type="button"
                    variant="outline"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setZone(hostel.value)}
                    className={`h-auto min-h-16 justify-start whitespace-normal rounded-lg px-4 py-3 text-left ${active ? "border-primary bg-primary-soft ring-2 ring-primary/20 hover:bg-primary-soft" : "bg-surface"}`}
                  >
                    <MapPin className="text-primary" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-foreground">{hostel.title}</span>
                      <span className="block text-xs text-muted-foreground">Drop Point: {hostel.dropPoint}</span>
                    </span>
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${active ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}>
                      {active && <Check className="h-3 w-3" />}
                    </span>
                  </Button>
                );
              })}
            </div>
          </FormSection>

          <FormSection number="4" title="Taarifa za mawasiliano" description="Tutatumia taarifa hizi kuthibitisha na kukuletea oda.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" className="sm:col-span-2">
                <input id="preorder-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} autoComplete="name" placeholder="Jina lako kamili" className={inputClass} />
              </Field>
              <Field label="Phone Number">
                <input id="preorder-phone" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={16} inputMode="tel" autoComplete="tel" placeholder="07XXXXXXXX" className={inputClass} />
              </Field>
              <Field label="Room Number / Details">
                <input id="preorder-room" value={room} onChange={(event) => setRoom(event.target.value)} maxLength={200} placeholder="Mfano: Room 24, Block 6A" className={inputClass} />
              </Field>
            </div>
          </FormSection>
        </div>

        <section className="border-t border-border pt-6">
          <div className="rounded-lg border border-accent/50 bg-accent-soft p-4 text-sm font-medium leading-relaxed text-accent-foreground">
            ⚠️ Taarifa: Mwisho wa kubadilisha au kughairi oda ni Saa 11:00 AM (Lunch) na Saa 06:00 PM (Dinner).
          </div>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">{selectedCount} meals</p>
              <p className="text-xl font-extrabold text-foreground">{formatTsh(total, "TSh")}</p>
            </div>
            {batch && <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground"><Clock3 className="h-4 w-4" />{BATCH_SLOTS.find((slot) => slot.value === batch)?.deliveryAt}</span>}
          </div>
          <Button type="button" size="lg" onClick={submit} disabled={saving || isLoading || available.length === 0} className="mt-4 h-14 w-full rounded-lg text-base font-bold">
            {saving ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
            {saving ? "Inatuma oda..." : "Thibitisha Pre-Order"}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">Hakuna malipo yanayohitajika sasa.</p>
        </section>
      </div>
    </main>
  );
}

const inputClass = "h-12 w-full rounded-lg border border-input bg-surface px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";

function FormSection({ number, title, description, children }: { number: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">{number}</span>
        <div>
          <h2 className="text-lg font-extrabold text-foreground">{title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactElement<{ id?: string }> }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-bold text-foreground">{label}</span>
      {children}
    </label>
  );
}

function PreorderReceipt({ receipt }: { receipt: Receipt }) {
  const batchInfo = BATCH_SLOTS.find((slot) => slot.value === receipt.batch);
  const zoneInfo = HOSTEL_ZONES.find((hostel) => hostel.value === receipt.zone);
  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:py-14">
      <div className="mx-auto max-w-xl">
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-8 w-8" />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-foreground">Pre-order Imepokelewa!</h1>
          <p className="mt-2 text-sm text-muted-foreground">Tutakutumia ujumbe kuthibitisha oda yako.</p>
        </div>

        <section className="mt-7 rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6" aria-label="Pre-order receipt">
          <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-2 font-bold text-foreground"><ReceiptText className="text-primary" /> Receipt</div>
            <span className="font-mono text-xs text-muted-foreground">#{receipt.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-3 border-b border-border py-5 text-sm">
            <dt className="text-muted-foreground">Batch</dt><dd className="font-semibold text-foreground">{batchInfo?.icon} {batchInfo?.title} · {batchInfo?.deliveryAt}</dd>
            <dt className="text-muted-foreground">Hostel</dt><dd className="font-semibold text-foreground">{zoneInfo?.title}</dd>
            <dt className="text-muted-foreground">Customer</dt><dd className="font-semibold text-foreground">{receipt.name}</dd>
            <dt className="text-muted-foreground">Phone</dt><dd className="font-semibold text-foreground">{receipt.phone}</dd>
            <dt className="text-muted-foreground">Room</dt><dd className="font-semibold text-foreground">{receipt.room}</dd>
          </dl>
          <div className="space-y-3 py-5">
            {receipt.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 text-sm">
                <span className="text-foreground">{item.name} × {item.quantity}</span>
                <span className="shrink-0 font-semibold text-foreground">{formatTsh(item.subtotal, "TSh")}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="font-bold text-foreground">Total</span>
            <span className="text-xl font-extrabold text-primary">{formatTsh(receipt.total, "TSh")}</span>
          </div>
        </section>

        <Button asChild size="lg" className="mt-5 h-12 w-full rounded-lg font-bold">
          <Link to="/msosi"><ArrowLeft /> Rudi Msosi Fasta</Link>
        </Button>
      </div>
    </main>
  );
}