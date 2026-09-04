import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { createPreOrder } from "@/lib/pre-orders";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#008542] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#008542]/10";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";

/** Booking dialog used by Msosi Fasta day-specific dishes. */
export function BookingModal({
  itemId,
  itemName,
  dayBadge,
  onClose,
}: {
  itemId: string | null;
  itemName: string;
  dayBadge?: string | null;
  onClose: () => void;
}) {
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await createPreOrder({
        itemId,
        itemName,
        customerName,
        phoneNumber,
        deliveryLocation,
        message,
      });
      toast.success("Oda yako ya booking imepokelewa!");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Booking imeshindikana.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="my-8 w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-lg"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Book {itemName}</h3>
            {dayBadge && (
              <span className="mt-1 inline-flex rounded-full bg-amber-400 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-slate-900">
                {dayBadge}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking form"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5">
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Hassani Mfwangavo"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Phone Number</label>
            <input
              required
              inputMode="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="07XXXXXXXX"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Delivery Location</label>
            <input
              required
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              placeholder="Ikuti, Block C, Room 12"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Message / Notes (required)</label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us the day and time you want this delivered…"
              className={`${inputClass} h-auto py-2.5`}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#008542] text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#006e36] disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Inatuma booking…" : "Place Order"}
        </button>
      </form>
    </div>
  );
}
