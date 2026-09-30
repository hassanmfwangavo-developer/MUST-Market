import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, GraduationCap, MessageCircle, Send, Users } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const ADMIN_WHATSAPP = "255674044676";

export const Route = createFileRoute("/cr")({
  head: () => ({
    meta: [
      { title: "CR's Offer — Msosi Fasta Ambassador | MUST Market" },
      {
        name: "description",
        content:
          "Kusanya oda za darasa lako, pata Offer za Kumwaga na Commission kila siku! Register as a CR Ambassador for Msosi Fasta at MUST Market.",
      },
      { property: "og:title", content: "CR's Offer — Msosi Fasta Ambassador | MUST Market" },
      {
        property: "og:description",
        content:
          "Kusanya oda za darasa lako, pata Offer za Kumwaga na Commission kila siku! Register as a CR Ambassador today.",
      },
      { property: "og:url", content: "https://mustmarket.store/cr" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
],
    links: [{ rel: "canonical", href: "https://mustmarket.store/cr" }],
  }),
  component: CrOfferPage,
});

function CrOfferPage() {
  const [fullName, setFullName] = useState("");
  const [program, setProgram] = useState("");
  const [phone, setPhone] = useState("");
  const [classSize, setClassSize] = useState("");
  const [sending, setSending] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const name = fullName.trim();
    const prog = program.trim();
    const phoneDigits = phone.replace(/\D/g, "");
    const size = classSize.trim();

    if (!name || !prog || !phoneDigits || !size) {
      toast.error("Tafadhali jaza sehemu zote za fomu.");
      return;
    }
    if (phoneDigits.length < 9) {
      toast.error("Tafadhali weka namba ya simu sahihi.");
      return;
    }

    const text =
      `Habari Hassani! Ningependa kujisajili kuwa CR Ambassador wa Msosi Fasta.\n\n` +
      `Jina: ${name}\n` +
      `Kozi na Mwaka: ${prog}\n` +
      `Namba ya Simu: ${phone.trim()}\n` +
      `Ukubwa wa Darasa: ${size} wanafunzi.`;

    setSending(true);
    window.open(
      `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
    toast.success("Asante! WhatsApp yako inafunguka sasa...");
    setSending(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <a
          href="/msosi"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Msosi Fasta
        </a>

        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
          <GraduationCap className="h-3 w-3" /> CR Ambassador Program
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          CR's Offer
        </h1>
        <p className="mt-2 text-sm font-medium text-primary sm:text-base">
          Kusanya oda za darasa lako, pata Offer za Kumwaga na Commission kila siku!
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Jisajili kama Class Representative Ambassador wa Msosi Fasta — timu yetu itakupigia na
          kukupa maelezo ya commission na Offer za kumwaga za darasa lako.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-3xl border border-border bg-surface p-6 shadow-soft sm:p-8"
        >
          <div>
            <label htmlFor="cr-name" className="mb-2 block text-sm font-semibold text-foreground">
              Jina Kamili
            </label>
            <input
              id="cr-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="mfano: Juma Hassan"
              maxLength={80}
              required
              className="block w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <div>
            <label htmlFor="cr-program" className="mb-2 block text-sm font-semibold text-foreground">
              Kozi na Mwaka wa Masomo
            </label>
            <input
              id="cr-program"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              placeholder="mfano: CoET Year 2"
              maxLength={100}
              required
              className="block w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <div>
            <label htmlFor="cr-phone" className="mb-2 block text-sm font-semibold text-foreground">
              Namba ya Simu / WhatsApp
            </label>
            <input
              id="cr-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="mfano: 0674 044 676"
              maxLength={20}
              required
              className="block w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <div>
            <label htmlFor="cr-size" className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Users className="h-3.5 w-3.5" /> Ukubwa wa Darasa (wanafunzi)
            </label>
            <input
              id="cr-size"
              type="number"
              min={1}
              max={2000}
              value={classSize}
              onChange={(e) => setClassSize(e.target.value)}
              placeholder="mfano: 120"
              required
              className="block w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="btn-shine inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 text-sm font-semibold text-white shadow-lift transition-transform hover:-translate-y-0.5 disabled:opacity-70"
          >
            {sending ? (
              "Inatuma…"
            ) : (
              <>
                <MessageCircle className="h-5 w-5" strokeWidth={2.5} />
                Tuma Taarifa WhatsApp <Send className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-muted-foreground">
            Taarifa zako zitaungwa na WhatsApp ya MUST Market admin (0674 044 676).
          </p>
        </form>
      </main>
      <Footer />
    </div>
  );
}
