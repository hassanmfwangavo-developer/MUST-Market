import { useState } from "react";
import { X, LifeBuoy, MessageCircle } from "lucide-react";

const SUPPORT_WHATSAPP = "255674044676";

const QUICK_ISSUES = [
  "My order is delayed (Oda imechelewa)",
  "Wrong food delivered",
  "Payment issue",
  "Something else",
];

export function HelpDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [issue, setIssue] = useState<string>(QUICK_ISSUES[0]);
  const [message, setMessage] = useState("");

  if (!open) return null;

  const send = () => {
    const text = encodeURIComponent(
      `Hello MUST Food Fasta support 👋\n\nIssue: ${issue}\nDetails: ${
        message.trim() || "—"
      }`,
    );
    window.open(`https://wa.me/${SUPPORT_WHATSAPP}?text=${text}`, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        aria-label="Close help"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
      />
      <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-slate-200 bg-white p-5 shadow-[0_-12px_40px_-20px_rgba(15,23,42,0.5)] sm:mx-auto sm:max-w-md sm:rounded-3xl sm:bottom-6 sm:inset-x-4">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-[#008542]">
              <LifeBuoy className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-slate-900">
                Help &amp; Support
              </h2>
              <p className="text-[11px] text-slate-500">
                We usually reply within a few minutes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {QUICK_ISSUES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setIssue(q)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                issue === q
                  ? "border-[#008542] bg-emerald-50 text-[#008542]"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {q}
            </button>
          ))}
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Tell us what happened (order number helps)..."
          className="w-full resize-none rounded-2xl border border-slate-200 bg-[#FAFBF6] p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#008542] focus:outline-none focus:ring-2 focus:ring-[#008542]/15"
        />

        <button
          type="button"
          onClick={send}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#008542] px-5 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-[#006e36]"
        >
          <MessageCircle className="h-4 w-4" />
          Send to WhatsApp Support
        </button>
      </div>
    </div>
  );
}
