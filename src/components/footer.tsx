import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Facebook, Instagram } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  MSOSI_INSTAGRAM_URL,
  WHATSAPP_COMMUNITY_URL,
} from "@/lib/site";
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
    href: MSOSI_INSTAGRAM_URL,
    icon: Instagram,
  },
  {
    label: "WhatsApp",
    href: WHATSAPP_COMMUNITY_URL,
    icon: WhatsAppIcon,
  },
  {
    label: "Facebook",
    href: MSOSI_INSTAGRAM_URL,
    icon: Facebook,
  },
  {
    label: "Twitter",
    href: MSOSI_INSTAGRAM_URL,
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
              href="#"
              onClick={(event) => event.preventDefault()}
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
              Join Our Whatsapp Group.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Get campus deals, Msosi Fasta drops, and marketplace highlights straight to your inbox.
            </p>
            <a
              href="https://chat.whatsapp.com/G7w7qs8O2d24OJeJcyuNK5?s=cl&p=a&iam=2"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1faa4b] sm:w-auto"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.43 9.43 0 0 1-4.8-1.31l-.35-.2-3.57.93.95-3.48-.23-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.24-9.44 9.46-9.44 2.52 0 4.9.99 6.68 2.77a9.38 9.38 0 0 1 2.77 6.68c0 5.21-4.24 9.44-9.46 9.44zm8.05-17.5A11.32 11.32 0 0 0 12.04.67C5.77.67.66 5.77.66 12.05c0 2 .53 3.96 1.52 5.69L.57 23.33l5.73-1.5a11.36 11.36 0 0 0 5.73 1.46h.01c6.27 0 11.38-5.1 11.38-11.38 0-3.04-1.18-5.9-3.33-8.05z"/></svg>
              Join WhatsApp Group
              <ArrowRight className="h-4 w-4" />
            </a>
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

