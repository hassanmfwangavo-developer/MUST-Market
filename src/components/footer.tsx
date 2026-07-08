import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {  Instagram, Twitter, X, MessageSquare } from "lucide-react";

type InfoKey =
  | "buyer-tips"
  | "seller-tips"
  | "report"
  | "rules"
  | "mission"
  | "contact"
  | "privacy"
  | "terms";

const INFO: Record<InfoKey, { title: string; body: string[] }> = {
  "buyer-tips": {
    title: "Buyer tips",
    body: [
      "Inspect the item in person before paying. Meet in busy, well-lit spots — the Library, Academic Blocks, or a lively corner of the hostels.",
      "Confirm the seller is a current MUST student. Ask a quick question about their course, hostel, or nearby area (Iyunga, Ikuti, Inyara, Lupeta, Coca).",
      "Never send money in advance for items you haven't seen. Pay on delivery, in person.",
    ],
  },
  "seller-tips": {
    title: "Seller tips",
    body: [
      "Use real, clear photos of the actual item. Listings with stock images will be taken down.",
      "Set a fair price — check similar items on the marketplace first.",
      "Reply quickly on WhatsApp. Serious buyers move fast.",
      "Living off campus in Iyunga, Ikuti, Inyara, Lupeta or Coca is totally fine — just be clear about pickup or delivery.",
    ],
  },
  report: {
    title: "Report a listing",
    body: [
      "Spotted something off? WhatsApp us at +255 674 044 676 with the listing title and a short reason.",
      "We remove listings that violate our rules within 24 hours — especially scams, counterfeit gear, or unsafe items.",
    ],
  },
  rules: {
    title: "Community rules",
    body: [
      "1. Only current MUST students may buy or sell.",
      "2. List real items you own. No scams, no fake photos, no misleading prices.",
      "3. Meet in safe, public spots — Library, Academic Blocks, or a busy area near the hostels.",
      "4. On or off campus (Iyunga, Ikuti, Inyara, Lupeta, Coca) — all MUST students are welcome to trade.",
      "5. Be respectful. Violations = permanent removal.",
    ],
  },
  mission: {
    title: "Our mission",
    body: [
      "Helping MUST students trade gear safely and save money. Built by students, for students, so nothing useful ends up in a drawer or a dumpster.",
    ],
  },
  contact: {
    title: "Contact",
    body: [
      "WhatsApp: +255 674 044 676",
      "Email; hassanmfwangavo49@gmail.com
    ],
  },
  privacy: {
    title: "Privacy",
    body: [
      "We only store what your listing needs: title, description, price, location, images and your WhatsApp number.",
      "Your number is shared with buyers so they can chat you on WhatsApp — that's the whole point of the marketplace.",
      "We don't sell your data. Ever.",
    ],
  },
  terms: {
    title: "Terms",
    body: [
      "MUST Market is a peer-to-peer marketplace. We connect buyers and sellers but we are not a party to any transaction.",
      "By listing an item, you confirm you are a current MUST student and the item is accurately described.",
      "Scams, counterfeit goods, and prohibited items are banned and will be removed.",
    ],
  },
};

export function Footer() {
  const [open, setOpen] = useState<InfoKey | null>(null);

  return (
   <footer className="border-t border-border bg-surface-2">
  <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:px-8">
    <div className="sm:col-span-2">
      <div className="flex items-center gap-2">
        
        {/* 👇 LOGO YAKO HALISI INAKAA HAPA SASA HIVI 👇 */}
        <img 
          src="/favicon-32x32.png" 
          alt="MUST Market Logo" 
          className="h-8 w-8 rounded-lg object-contain" 
        />
        
        <span className="text-base font-semibold tracking-tight">
          MUST <span className="text-primary">Market</span>
        </span>
      </div>
          </div>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            The peer-to-peer marketplace built by and for Mbeya University of Science and Technology
            students.
          </p>
          <Link
            to="/feedback"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary-soft px-3.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Feedback & Suggestions
          </Link>
        </div>

        <FooterCol
          title="Safety"
          items={[
            { label: "Buyer tips", key: "buyer-tips" },
            { label: "Seller tips", key: "seller-tips" },
            { label: "Report a listing", key: "report" },
            { label: "Community rules", key: "rules" },
          ]}
          onOpen={setOpen}
        />
        <FooterCol
          title="About"
          items={[
            { label: "Our mission", key: "mission" },
            { label: "Contact", key: "contact" },
            { label: "Privacy", key: "privacy" },
            { label: "Terms", key: "terms" },
          ]}
          onOpen={setOpen}
          extraLinks={[{ label: "Feedback & Suggestions", to: "/feedback" }]}
        />
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} MUST Market. Built by students, for students.</span>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="Instagram" className="hover:text-primary">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-primary">
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {INFO[open].title}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-foreground/85">
              {INFO[open].body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}

function FooterCol({
  title,
  items,
  onOpen,
  extraLinks,
}: {
  title: string;
  items: { label: string; key: InfoKey }[];
  onOpen: (k: InfoKey) => void;
  extraLinks?: { label: string; to: string }[];
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest text-foreground">
        {title}
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li key={it.key}>
            <button
              type="button"
              onClick={() => onOpen(it.key)}
              className="text-left text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {it.label}
            </button>
          </li>
        ))}
        {extraLinks?.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="text-left text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
