import { Link } from "@tanstack/react-router";
import { Search, Plus, Menu, ShoppingBag } from "lucide-react";
import { categories } from "@/lib/demo-data";
import { useState } from "react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-6 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="group flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft transition-transform group-hover:scale-105">
            <ShoppingBag className="h-4.5 w-4.5" strokeWidth={2.5} />
          </span>
          <span className="hidden text-[17px] font-semibold tracking-tight text-foreground sm:block">
            MUST <span className="text-primary">Market</span>
          </span>
        </Link>

        {/* Search */}
        <div className="relative flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search laptops, books, hostel gear…"
            className="h-11 w-full rounded-full border border-border bg-surface-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/80 shadow-soft transition-all focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10"
          />
        </div>

        {/* Category quick-links */}
        <nav className="hidden items-center gap-1 lg:flex">
          {categories.slice(0, 3).map((c) => (
            <a
              key={c.slug}
              href={`#${c.slug}`}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary"
            >
              {c.name}
            </a>
          ))}
        </nav>

        {/* Sell CTA */}
        <button
          type="button"
          className="btn-shine hidden shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-amber)] transition-transform hover:-translate-y-0.5 sm:inline-flex"
        >
          <Plus className="h-4 w-4" strokeWidth={2.75} />
          Sell an Item
        </button>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-surface text-foreground lg:hidden"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-surface px-4 py-3 lg:hidden">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <a
                key={c.slug}
                href={`#${c.slug}`}
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-sm text-foreground"
              >
                <span className="mr-1">{c.emoji}</span>
                {c.name}
              </a>
            ))}
          </div>
          <button
            type="button"
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-amber)] sm:hidden"
          >
            <Plus className="h-4 w-4" strokeWidth={2.75} />
            Sell an Item
          </button>
        </div>
      )}
    </header>
  );
}
