import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle, Sparkles } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const ADMIN_WHATSAPP = "255674044676";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Feedback & Suggestions — MUST Market" },
      {
        name: "description",
        content:
          "Share ideas, bugs, or suggestions to help make MUST Market better for every Mbeya University student.",
      },
      { property: "og:title", content: "Feedback & Suggestions — MUST Market" },
      {
        property: "og:description",
        content:
          "Help us improve MUST Market. Your feedback goes straight to the team on WhatsApp.",
      },
      { property: "og:url", content: "https://must-campus-swap.lovable.app/feedback" },
    ],
    links: [{ rel: "canonical", href: "https://must-campus-swap.lovable.app/feedback" }],
  }),
  component: FeedbackPage,
});

function FeedbackPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  function handleSend(e: FormEvent) {
    e.preventDefault();
    const trimmed = message.trim();
    if (trimmed.length < 5) {
      toast.error("Please write a bit more so we can help.");
      return;
    }
    const who = name.trim() ? `From: ${name.trim()}\n\n` : "";
    const text = `MUST Market — Feedback\n\n${who}${trimmed}`;
    const url = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Opening WhatsApp with your message…");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to market
        </Link>

        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
          <Sparkles className="h-3 w-3" /> Feedback & Suggestions
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Help us make MUST Market better
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Spotted a bug? Got an idea? Tell us here — your message goes straight to the team on
          WhatsApp.
        </p>

        <form
          onSubmit={handleSend}
          className="mt-8 space-y-5 rounded-3xl border border-border bg-surface p-6 shadow-soft sm:p-8"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              Your name <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Neema"
              maxLength={80}
              className="block w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              Your feedback
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What's on your mind? Bugs, ideas, missing features…"
              maxLength={2000}
              className="block min-h-[160px] w-full resize-y rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10"
            />
            <div className="mt-1 text-right text-[11px] text-muted-foreground">
              {message.length}/2000
            </div>
          </div>

          <button
            type="submit"
            className="btn-shine inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 text-sm font-semibold text-white shadow-lift transition-transform hover:-translate-y-0.5"
          >
            <MessageCircle className="h-5 w-5" strokeWidth={2.5} />
            Send via WhatsApp
          </button>

          <p className="text-center text-[11px] text-muted-foreground">
            Your message will open in WhatsApp addressed to the MUST Market admin (0674 044 676).
          </p>
        </form>
      </main>
      <Footer />
    </div>
  );
}
