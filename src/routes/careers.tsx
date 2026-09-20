import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Bike,
  Check,
  Copy,
  Mail,
  Rocket,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { canonical } from "@/lib/site";

const ADMIN_WHATSAPP = "255674044676";
const FOUNDER_EMAIL = "hassani@mustmarket.store";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers & Partners — Build with MUST Market" },
      {
        name: "description",
        content:
          "Join MUST Market as a delivery rider, restaurant vendor, campus service provider, or core team member. Apply in minutes via WhatsApp or email.",
      },
      { property: "og:title", content: "Careers & Partners — Build with MUST Market" },
      {
        property: "og:description",
        content:
          "Earn as a rider, grow your cafeteria, list your repair or laundry services, or join the MUST Market core team.",
      },
      { property: "og:url", content: canonical("/careers") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonical("/careers") }],
  }),
  component: CareersPage,
});

type RoleKey = "rider" | "vendor" | "service";

const ROLE_COPY: Record<
  RoleKey,
  { title: string; subtitle: string; detailLabel: string; detailPlaceholder: string }
> = {
  rider: {
    title: "Apply as a Delivery Rider",
    subtitle: "Tell us who you are and we'll continue on WhatsApp.",
    detailLabel: "Area / Hostel you can cover",
    detailPlaceholder: "e.g. Iyunga, Block E, Mwakibete",
  },
  vendor: {
    title: "Register Your Restaurant",
    subtitle: "Reach thousands of MUST students daily.",
    detailLabel: "Business name & location",
    detailPlaceholder: "e.g. Mama Lishe Cafeteria, Iyunga gate",
  },
  service: {
    title: "Join the Campus Service Mall",
    subtitle: "Get verified and receive direct customer leads.",
    detailLabel: "Service type & location",
    detailPlaceholder: "e.g. Phone repair, Block C shops",
  },
};

const CARDS: {
  key: RoleKey;
  icon: typeof Bike;
  emoji: string;
  title: string;
  summary: string;
  features: string[];
  cta: string;
}[] = [
  {
    key: "rider",
    icon: Bike,
    emoji: "",
    title: "Delivery Rider (Msafirishaji)",
    summary:
      "Earn daily income delivering hot meals to hostels and blocks around MUST campus.",
    features: ["Flexible hours", "Smartphone order alerts", "Direct daily payouts"],
    cta: "Apply as Rider ",
  },
  {
    key: "vendor",
    icon: UtensilsCrossed,
    emoji: "",
    title: "Restaurant & Cafeteria Vendor",
    summary:
      "Expand your food business and reach thousands of hungry students daily without extra marketing costs.",
    features: ["Free vendor dashboard", "Live order management", '1-tap "Sold Out" controls'],
    cta: "Register Restaurant ",
  },
  {
    key: "service",
    icon: Wrench,
    emoji: "",
    title: "Campus Service Mall Vendor",
    summary:
      "List your phone/laptop repair, laundry, gheto cleaning, printing, or beauty services.",
    features: ["Verified provider badge", "Direct WhatsApp customer leads", "Full profile page"],
    cta: "Join Service Mall ",
  },
];

function CareersPage() {
  const [openRole, setOpenRole] = useState<RoleKey | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [detail, setDetail] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  function reset() {
    setName("");
    setPhone("");
    setDetail("");
    setMessage("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!openRole) return;
    if (name.trim().length < 3) {
      toast.error("Please enter your full name.");
      return;
    }
    if (phone.trim().length < 9) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    const role = ROLE_COPY[openRole];
    const text = [
      `MUST Market — ${role.title}`,
      "",
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      detail.trim() ? `${role.detailLabel}: ${detail.trim()}` : "",
      message.trim() ? `Message: ${message.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    window.open(
      `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
    toast.success("Opening WhatsApp with your application…");
    setOpenRole(null);
    reset();
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(FOUNDER_EMAIL);
      setCopied(true);
      toast.success("Email copied to clipboard");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy. Please copy it manually.");
    }
  }

  const activeRole = openRole ? ROLE_COPY[openRole] : null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <Link
          to="/market"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to market
        </Link>

        <header className="mt-6 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-700">
            <Rocket className="h-3.5 w-3.5" />
            Join Our Growing Network
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Build &amp; Grow with MUST Market
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Whether you want to earn as a rider, grow your cafeteria, list your repair/laundry
            services, or join our core team, there is a place for you.
          </p>
        </header>

        <section className="mt-10 grid gap-5 sm:grid-cols-2">
          {CARDS.map((card) => (
            <article
              key={card.key}
              className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-soft"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                  <card.icon className="h-5 w-5" />
                </span>
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  {card.title} <span aria-hidden="true">{card.emoji}</span>
                </h2>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{card.summary}</p>
              <ul className="mt-4 space-y-2">
                {card.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => {
                  reset();
                  setOpenRole(card.key);
                }}
                className="mt-6 w-full bg-amber-500 text-slate-950 hover:bg-amber-600"
              >
                {card.cta}
              </Button>
            </article>
          ))}

          <article className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                <Mail className="h-5 w-5" />
              </span>
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Open Applications &amp; Skilled Services <span aria-hidden="true"></span>
              </h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              We are constantly expanding and looking for talented individuals in software
              development, graphic design, social media content, logistics, and ground operations.
            </p>
            <p className="mt-4 text-sm font-medium text-foreground">
              Have a skill, service, or proposal? Send your CV or application directly to our
              founder:
            </p>
            <div className="mt-3 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm font-semibold text-primary break-all">
              {FOUNDER_EMAIL}
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button
                asChild
                className="flex-1 bg-amber-500 text-slate-950 hover:bg-amber-600"
              >
                <a
                  href={`mailto:${FOUNDER_EMAIL}?subject=${encodeURIComponent(
                    "Career/Service Application - MUST Market",
                  )}`}
                >
                  Send CV via Email 📧
                </a>
              </Button>
              <Button variant="outline" className="flex-1" onClick={copyEmail}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copy Email 📋
              </Button>
            </div>
          </article>
        </section>
      </main>
      <Footer />

      <Dialog
        open={openRole !== null}
        onOpenChange={(open) => {
          if (!open) setOpenRole(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{activeRole?.title ?? ""}</DialogTitle>
            <DialogDescription>{activeRole?.subtitle ?? ""}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              aria-label="Full name"
            />
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number (e.g. 0674044676)"
              aria-label="Phone number"
              inputMode="tel"
            />
            <Input
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder={activeRole?.detailPlaceholder ?? ""}
              aria-label={activeRole?.detailLabel ?? "Details"}
            />
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Short message (optional)"
              aria-label="Short message"
              rows={3}
            />
            <Button
              type="submit"
              className="w-full bg-[#008542] text-white hover:bg-[#006e36]"
            >
              Send via WhatsApp 📲
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
