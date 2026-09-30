import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, CheckCircle2, Loader2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatTsh } from "@/lib/menu";
import { fetchPreorderMeals, PREORDER_MEALS_KEY, submitBatchPreorder } from "@/lib/batch-preorders";
import { sanitizeTzPhoneStrict } from "@/lib/formatters";
import {
  BATCH_SLOTS,
  HOSTEL_ZONES,
  type BatchSlot,
  type HostelZone,
} from "@/lib/order-batches";

const STEPS = ["Meal", "Batch", "Hostel", "Details", "Confirm"] as const;

/** Standalone hostel batch pre-order (no payment): meals → batch → hostel → details → confirm. */
export function PreOrderWizard({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: meals = [], isLoading } = useQuery({
    queryKey: PREORDER_MEALS_KEY,
    queryFn: fetchPreorderMeals,
    enabled: open,
  });
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [batch, setBatch] = useState<BatchSlot | "">("");
  const [zone, setZone] = useState<HostelZone | "">("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const available = meals.filter((m) => m.is_active);
  const selected = available.filter((m) => (qty[m.id] ?? 0) > 0);
  const total = selected.reduce((s, m) => s + m.price_tsh * qty[m.id], 0);
  const batchInfo = BATCH_SLOTS.find((b) => b.value === batch);
  const zoneInfo = HOSTEL_ZONES.find((z) => z.value === zone);

  const canNext = useMemo(() => {
    if (step === 0) return selected.length > 0;
    if (step === 1) return !!batch;
    if (step === 2) return !!zone;
    if (step === 3) return name.trim().length > 1 && !!sanitizeTzPhoneStrict(phone) && note.trim().length > 0;
    return true;
  }, [step, selected.length, batch, zone, name, phone, note]);

  const change = (id: string, d: number) =>
    setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(20, (q[id] ?? 0) + d)) }));

  const next = () => {
    if (!canNext) {
      const msg = [
        "Chagua angalau chakula kimoja.",
        "Chagua Lunch au Dinner batch.",
        "Chagua hostel yako.",
        "Weka jina, namba sahihi ya simu (07XXXXXXXX) na chumba/landmark.",
      ][step];
      toast.error(msg);
      return;
    }
    setStep((s) => Math.min(4, s + 1));
  };

  const reset = () => {
    setStep(0); setQty({}); setBatch(""); setZone(""); setName(""); setPhone(""); setNote(""); setDone(false);
  };

  const close = (v: boolean) => {
    onOpenChange(v);
    if (!v && done) reset();
  };

  const confirm = async () => {
    if (!batch || !zone || saving) return;
    setSaving(true);
    try {
      await submitBatchPreorder({
        items: selected.map((m) => ({ mealId: m.id, name: m.name, price: m.price_tsh, quantity: qty[m.id] })),
        total,
        batchSlot: batch,
        hostelZone: zone,
        customerName: name,
        phone: sanitizeTzPhoneStrict(phone) ?? phone,
        room: note,
      });
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Imeshindikana kutuma pre-order.");
    } finally {
      setSaving(false);
    }
  };

  const card = (active: boolean) =>
    `flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
      active ? "border-[#008542] bg-[#008542]/5 ring-2 ring-[#008542]/20" : "border-slate-200 hover:border-slate-300"
    }`;
  const dot = (active: boolean) =>
    `mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
      active ? "border-[#008542] bg-[#008542] text-white" : "border-slate-300"
    }`;
  const input =
    "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 focus:border-[#008542] focus:bg-white focus:outline-none";

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-slate-100 p-5 pb-4">
          <DialogTitle>Weka Order Sasa</DialogTitle>
          <DialogDescription>
            Step {step + 1} of 5 · {STEPS[step]}
          </DialogDescription>
          <div className="mt-3 flex gap-1.5">
            {STEPS.map((s, i) => (
              <span key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-[#008542]" : "bg-slate-200"}`} />
            ))}
          </div>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <CheckCircle2 className="h-14 w-14 text-[#008542]" />
            <p className="text-base font-bold text-slate-900">
              Pre-order yako imepokelewa kikamilifu! Utatumiwa ujumbe mfupi wa kuthibitisha.
            </p>
            <button type="button" onClick={() => close(false)} className="mt-2 h-11 rounded-xl bg-[#008542] px-6 font-bold text-white">
              Sawa
            </button>
          </div>
        ) : (
        <>
        <div className="flex-1 overflow-y-auto p-5 text-sm">
          {step === 0 && (
            <div className="space-y-2">
              <p className="mb-2 font-bold text-slate-900">Chagua chakula</p>
              {isLoading && <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#008542]" />}
              {!isLoading && available.length === 0 && <p className="text-slate-500">Hakuna chakula cha pre-order kwa sasa.</p>}
              {available.map((m) => {
                const q = qty[m.id] ?? 0;
                return (
                  <div key={m.id} className={card(q > 0)}>
                    {m.image_url && <img src={m.image_url} alt={m.name} className="h-12 w-12 rounded-lg object-cover" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">{m.name}</p>
                      <p className="text-xs text-slate-500">{formatTsh(m.price_tsh, "TSh")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" aria-label={`Less ${m.name}`} onClick={() => change(m.id, -1)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center font-bold">{q}</span>
                      <button type="button" aria-label={`More ${m.name}`} onClick={() => change(m.id, 1)} className="grid h-8 w-8 place-items-center rounded-lg bg-[#008542] text-white">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-2" role="radiogroup" aria-label="Batch delivery">
              <p className="mb-2 font-bold text-slate-900">Chagua Batch ya Delivery</p>
              {BATCH_SLOTS.map((b) => (
                <button key={b.value} type="button" role="radio" aria-checked={batch === b.value} onClick={() => setBatch(b.value)} className={card(batch === b.value)}>
                  <span className={dot(batch === b.value)}>{batch === b.value && <Check className="h-3 w-3" />}</span>
                  <span>
                    <span className="block font-semibold text-slate-900">{b.title}</span>
                    <span className="text-xs text-slate-600">Order before {b.orderBy} | Delivery at {b.deliveryAt}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2" role="radiogroup" aria-label="Hostel zone">
              <p className="mb-2 font-bold text-slate-900">Chagua Hostel yako</p>
              {HOSTEL_ZONES.map((z) => (
                <button key={z.value} type="button" role="radio" aria-checked={zone === z.value} onClick={() => setZone(z.value)} className={card(zone === z.value)}>
                  <span className={dot(zone === z.value)}>{zone === z.value && <Check className="h-3 w-3" />}</span>
                  <span>
                    <span className="block font-semibold text-slate-900">{z.title}</span>
                    <span className="text-xs text-slate-600">Drop Point: {z.dropPoint}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="font-bold text-slate-900">Taarifa zako</p>
              <input className={input} placeholder="Full Name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
              <input className={input} placeholder="Phone Number (07XXXXXXXX)" inputMode="tel" value={phone} maxLength={16} onChange={(e) => setPhone(e.target.value)} />
              <textarea className={`${input} h-auto py-2.5`} rows={2} placeholder="Room Number / Landmark" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <p className="font-bold text-slate-900">Hakiki Order yako</p>
              <div className="space-y-1.5 rounded-xl border border-slate-200 p-3">
                {selected.map((m) => (
                  <div key={m.id} className="flex justify-between">
                    <span>{m.name} × {qty[m.id]}</span>
                    <span>{formatTsh(m.price_tsh * qty[m.id], "TSh")}</span>
                  </div>
                ))}
              </div>
              <dl className="grid grid-cols-3 gap-y-1.5 text-xs">
                <dt className="text-slate-500">Batch</dt>
                <dd className="col-span-2 font-medium">{batchInfo?.title} · {batchInfo?.deliveryAt}</dd>
                <dt className="text-slate-500">Hostel</dt>
                <dd className="col-span-2 font-medium">{zoneInfo?.title}</dd>
                <dt className="text-slate-500">Customer</dt>
                <dd className="col-span-2 font-medium">{name} · {phone}</dd>
                <dt className="text-slate-500">Room</dt>
                <dd className="col-span-2 font-medium">{note}</dd>
              </dl>
              <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
                Hakuna malipo sasa. Tutakutumia ujumbe kuthibitisha pre-order yako.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-slate-100 p-4">
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Total</p>
            <p className="text-lg font-extrabold text-slate-900">{formatTsh(total, "TSh")}</p>
          </div>
          {step > 0 && (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="h-11 rounded-xl border border-slate-200 px-4 font-semibold">
              Back
            </button>
          )}
          {step < 4 ? (
            <button type="button" onClick={next} className={`h-11 rounded-xl bg-[#008542] px-5 font-bold text-white ${canNext ? "" : "opacity-50"}`}>
              Next
            </button>
          ) : (
            <button type="button" onClick={confirm} disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-500 px-5 font-bold text-slate-900 hover:bg-amber-400 disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Thibitisha Pre-Order
            </button>
          )}
        </div>
        </>
        )}
      </DialogContent>
    </Dialog>
  );
}
