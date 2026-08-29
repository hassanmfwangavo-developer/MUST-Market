import { Link } from "@tanstack/react-router";
import { Instagram, ShoppingBag, Utensils } from "lucide-react";

const MARKETPLACE_LINKS = [
  { label: "Soko la Vitu Used", to: "/market" },
  { label: "Nyumba & Gheto", to: "/market" },
  { label: "Vifaa vya Masomo", to: "/market" },
  { label: "Post Ad (Uza Bure)", to: "/sell" },
];

const MSOSI_LINKS = [
  { label: "Menus za Cafeterias", to: "/msosi" },
  { label: "Agiza Msosi", to: "/msosi" },
  { label: "Discount Offers", to: "/msosi" },
  { label: "Orders Status", to: "/orders" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-2">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Column 1 — Brand */}
          <div className="md:pr-6">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                <ShoppingBag className="h-4.5 w-4.5" />
              </span>
              <span className="text-lg font-bold tracking-tight">
                MUST <span className="text-primary">Market</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Campus Super-App ya wanafunzi wa MUST (Mbeya University of Science and
              Technology). Nunua, uze, na agiza chakula — kila kitu kwa urahisi.
            </p>
            <a
              href="https://www.instagram.com/must_market01?igsh=MTUwdHhoMXNkZ3kxcA=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="mt-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>

          {/* Column 2 — Marketplace */}
          <div>
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-foreground">
              <ShoppingBag className="h-4 w-4 text-primary" />
              Marketplace (Sokoni)
            </h3>
            <ul className="mt-4 space-y-2.5">
              {MARKETPLACE_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Msosi Fasta */}
          <div>
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-foreground">
              <Utensils className="h-4 w-4 text-amber-500" />
              Msosi Fasta
            </h3>
            <ul className="mt-4 space-y-2.5">
              {MSOSI_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-amber-500"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} MUST Market. All rights reserved.</span>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link to="/privacy" className="transition-colors hover:text-primary">
              Privacy Policy
            </Link>
            <Link to="/terms" className="transition-colors hover:text-primary">
              Terms
            </Link>
            <span className="hidden sm:inline text-border">·</span>
            <span>
              Made with <span className="text-rose-500">❤️</span> for MUST Students
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
