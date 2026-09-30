import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Facebook, Instagram } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { BOOKS24_URL } from "@/lib/site";
import { syncBrevoContact } from "@/lib/brevo.functions";

const MARKETPLACE_LINKS = [
  { label: "Used Electronics", to: "/market/electronics" as const },
  { label: "Rooms & Gheto", to: "/market/rooms-gheto" as const },
  { label: "Used Items", to: "/market/used-items" as const },
  { label: "Post an Ad", to: "/sell" as const },
];

const MSOSI_LINKS = [
  { label: "CR's Offer", to: "/cr" as const },
  { label: "Cafeteria Menus", to: "/msosi" as const },
  { label: "Order Food", to: "/msosi" as const },
  { label: "My Orders", to: "/orders" as const },
];

const COMPANY_LINKS = [
  { label: "Meet the Founder", to: "/meet-the-founder" as const },
  { label: "Careers", to: "/careers" as const },
];

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/must_market01?igsh=MTUwdHhoMXNkZ3kxcA==",
    icon: Instagram,
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/255674044676",
    icon: WhatsAppIcon,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/196sZmikW4/",
    icon: Facebook,
  },
  {
    label: "Twitter",
    href: "https://x.com/must_market01",
    icon: TwitterIcon,
  },
];

type FooterLink = {
  label: string;
  to:
    | "/browse"
    | "/sell"
    | "/msosi"
    | "/cr"
    | "/orders"
    | "/careers"
    | "/meet-the-founder"
    | "/feedback"
    | "/market"
    | "/services"
    | "/market/electronics"
    | "/market/rooms-gheto"
    | "/market/books-stationery"
    | "/market/used-items"
    | "/privacy"
    | "/terms";
  search?: { category: string };
};

function FooterLinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-black/90">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              {...(link.search ? { search: link.search } : {})}
              className="text-sm text-slate-400 transition-colors hover:text-[#008542]"
            >
              {link.label}
            </Link>
          </li>
        ))}
        {title === "Marketplace" && (
          <li>
            <a
              href={BOOKS24_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-[#008542]"
            >
              Books &amp; Study Supplies <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubscribe(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || trimmed.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: trimmed, source: "footer" });

      // 23505 = already subscribed; treat as success.
      if (error && error.code !== "23505") {
        console.error("[Newsletter] Insert failed:", error);
        toast.error("Could not subscribe right now. Please try again.");
        return;
      }

      // Fire-and-forget Brevo contact sync — never blocks the UI.
      void syncBrevoContact({ data: { email: trimmed, firstName: "Mwanafunzi" } }).catch(() => {
        /* subscriber is saved; Brevo can retry later */
      });

      toast.success("Thanks for subscribing! We'll keep you in the loop.");
      setEmail("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer className="border-t border-border bg-surface-2">


      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(260px,320px)_1fr] lg:gap-16">
          {/* Newsletter */}
          <div className="max-w-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#006e36]"> 
  To always be informed 
</p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-black">
              Sign up for our newsletter.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Get campus deals, Msosi Fasta drops, and marketplace highlights straight to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="mt-6 space-y-3">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                aria-label="Email address for newsletter"
                className="h-11 border-slate-300 bg-white text-black placeholder:text-slate-500 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/30"
              />
              <Button
                type="submit"
                disabled={submitting}
                className="h-11 w-full bg-[#008542] text-white hover:bg-[#006e36] sm:w-auto sm:px-6"
              >
                {submitting ? "Subscribing…" : "Subscribe"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
            <FooterLinkColumn title="Marketplace" links={MARKETPLACE_LINKS} />
            <FooterLinkColumn title="Msosi Fasta" links={MSOSI_LINKS} />
            <FooterLinkColumn title="Company" links={COMPANY_LINKS} />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} MUST Market. All rights reserved.
          </p>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              <Link to="/privacy" className="text-slate-400 transition-colors hover:text-[#008542]">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-slate-400 transition-colors hover:text-[#008542]">
                Terms of Service
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-400 transition-all hover:border-[#008542]/40 hover:bg-white/5 hover:text-[#008542]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

