import { useState } from "react";
import { ShieldCheck, X, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface SafetyModalProps {
  open: boolean;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SafetyModal({ open, submitting, onClose, onConfirm }: SafetyModalProps) {
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [c3, setC3] = useState(false);
  const [master, setMaster] = useState(false);

  if (!open) return null;

  const canConfirm = master && !submitting;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={submitting ? undefined : onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              🛡️ Final Safety Check
            </h2>
          </div>
          {!submitting && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          Please confirm each requirement before your listing goes live.
        </p>

        <div className="mt-5 space-y-3">
          <Row checked={c1} onChange={setC1}>
            I certify that I am a current MUST Student.
          </Row>
          <Row checked={c2} onChange={setC2}>
            I confirm this is a Used/Personal item, not a commercial shop product.
          </Row>
          <Row checked={c3} onChange={setC3}>
            I agree to meet buyers only in safe, public campus areas (Cafeteria, Block C,
            Library).
          </Row>
        </div>

        <div className="mt-5 rounded-xl border border-primary/30 bg-primary-soft/50 p-3">
          <Row checked={master} onChange={setMaster} strong>
            I accept the Community Rules and want to publish my listing.
          </Row>
        </div>

        <button
          type="button"
          disabled={!canConfirm}
          onClick={onConfirm}
          className="btn-shine mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-amber)] transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Publishing…
            </>
          ) : (
            "Confirm & Publish Live"
          )}
        </button>
      </div>
    </div>
  );
}

function Row({
  checked,
  onChange,
  children,
  strong,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onChange(v === true)}
        className="mt-0.5"
      />
      <span
        className={`text-sm leading-snug ${strong ? "font-semibold text-foreground" : "text-foreground/90"}`}
      >
        {children}
      </span>
    </label>
  );
}
