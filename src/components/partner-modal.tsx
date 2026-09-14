import { useState } from "react";
import { X, Send } from "lucide-react";
import { toast } from "sonner";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#008542] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#008542]/10";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";

const WHATSAPP_NUMBER = "255674044676";

type PartnerType = "vendor" | "rider";

export function PartnerModal({ onClose }: { onClose: () => void }) {
  const [partnerType, setPartnerType] = useState<PartnerType>("vendor");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [place, setPlace] = useState("");
  const [notes, setNotes] = useState("");

  const isVendor = partnerType === "vendor";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      toast.error("Tafadhali jaza Jina Kamili na Namba ya Simu.");
      return;
    }
    const message =
      `Habari MUST Market! Naomba kujisajili kama Partner wa Msosi Fasta:\n` +
      `📌 Aina: ${isVendor ? "Vendor" : "Rider"}\n` +
      `👤 Jina: ${fullName.trim()}\n` +
      `📞 Simu: ${phone.trim()}\n` +
      `🏢 Mgahawa/Eneo: ${place.trim() || "-"}\n` +
      `📝 Maelezo: ${notes.trim() || "-"}`;

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    toast.success("Asante! WhatsApp yako inafunguka sasa...");
    onClose();
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
          <h3 className="text-lg font-bold text-slate-900">Jiunge na Msosi Fasta Network</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Funga fomu"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5">
          <fieldset>
            <legend className={labelClass}>Aina ya Partner</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  { value: "vendor", label: "Mwenye Mgahawa / Cafeteria Vendor" },
                  { value: "rider", label: "Delivery Rider (Msafirishaji)" },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-xs font-semibold transition-colors ${
                    partnerType === opt.value
                      ? "border-[#008542] bg-emerald-50 text-[#008542] ring-2 ring-[#008542]/15"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="partnerType"
                    value={opt.value}
                    checked={partnerType === opt.value}
                    onChange={() => setPartnerType(opt.value)}
                    className="mt-0.5 accent-[#008542]"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label className={labelClass} htmlFor="partner-name">
              Jina Kamili
            </label>
            <input
              id="partner-name"
              className={inputClass}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Mfano: Hassani Juma"
              required
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="partner-phone">
              Namba ya Simu / WhatsApp
            </label>
            <input
              id="partner-phone"
              type="tel"
              inputMode="tel"
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0674 044 676"
              required
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="partner-place">
              {isVendor ? "Jina la Mgahawa & Eneo" : "Eneo Unalopatikana / Chombo"}
            </label>
            <input
              id="partner-place"
              className={inputClass}
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder={
                isVendor
                  ? "mfano: Mama Ntilie Block A"
                  : "mfano: Nje ya Kampasi / Pikipiki / Baiskeli / Kwa mguu"
              }
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="partner-notes">
              Maelezo ya ziada au maswali (si lazima)
            </label>
            <textarea
              id="partner-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Maelezo ya ziada au maswali."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#008542] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#008542]/10"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="submit"
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#008542] px-4 text-sm font-bold text-white transition-colors hover:bg-[#006e36]"
          >
            Tuma kwa WhatsApp 📲
            <Send className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 sm:flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
