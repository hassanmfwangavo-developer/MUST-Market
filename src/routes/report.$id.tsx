import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { sanitizeTzPhone } from "@/lib/phone";

const ADMIN_PHONE = "0674044676";

const REASONS = [
  { value: "Scam", desc: "Fake seller, fraudulent listing, phishing" },
  { value: "Counterfeit", desc: "Fake or imitation branded product" },
  { value: "Incorrect Price", desc: "Misleading price or hidden fees" },
  { value: "Inappropriate Content", desc: "Offensive photos, hate speech, banned items" },
  { value: "Other", desc: "Anything else that violates community rules" },
] as const;

export const Route = createFileRoute("/report/$id")({
  head: () => ({
    meta: [
      { title: "Report a listing — MUST Market" },
      { name: "description", content: "Report a problematic listing to MUST Market admins." },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { id } = useParams({ from: "/report/$id" });
  const [reason, setReason] = useState<string>(REASONS[0].value);
  const [comments, setComments] = useState("");
  const [sending, setSending] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    const message =
      `🚩 *MUST Market — Listing Report*%0A%0A` +
      `*Listing ID:* ${id}%0A` +
      `*Reason:* ${reason}%0A` +
      `*Comments:* ${comments.trim() || "(none)"}%0A%0A` +
      `Sent from must-market.app`;
    const url = `https://wa.me/${sanitizeTzPhone(ADMIN_PHONE)}?text=${message}`;
    toast.success("Report ready — opening WhatsApp");
    if (typeof window !== "undefined") window.open(url, "_blank");
    setSending(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <Link
          to="/product/$id"
          params={{ id }}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to listing
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <Flag className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Report this listing
            </h1>
            <p className="text-sm text-muted-foreground">
              Your report goes straight to a MUST Market admin.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-8 rounded-3xl border border-border bg-surface p-6 shadow-soft sm:p-8"
        >
          <div>
            <div className="text-sm font-semibold text-foreground">Why are you reporting this?</div>
            <div className="mt-4 space-y-2.5">
              {REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-all ${
                    reason === r.value
                      ? "border-primary bg-primary-soft"
                      : "border-border bg-surface-2 hover:border-primary/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">{r.value}</div>
                    <div className="text-xs text-muted-foreground">{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="comments" className="text-sm font-semibold text-foreground">
              Your comments
            </label>
            <textarea
              id="comments"
              required
              minLength={10}
              rows={5}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Tell us what happened, screenshots welcome once WhatsApp opens…"
              className="mt-2 w-full resize-none rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Min 10 characters. Be specific.
            </p>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 disabled:opacity-70"
          >
            {sending && <Loader2 className="h-4 w-4 animate-spin" />}
            Send report via WhatsApp
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
