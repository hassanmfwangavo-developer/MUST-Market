import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag } from "lucide-react";
import { categories } from "@/lib/demo-data";
import { setSearchQuery, useSearchQuery } from "@/lib/search-store";

export function Navbar() {
  const query = useSearchQuery();
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-6 sm:px-6 lg:px-8">
        <Link to="/" className="group flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft transition-transform group-hover:scale-105">
            <ShoppingBag className="h-4.5 w-4.5" strokeWidth={2.5} />
          </span>
          <span className="hidden text-[17px] font-semibold tracking-tight text-foreground sm:block">
            MUST <span className="text-primary">Market</span>
          </span>
        </Link>

        <div className="relative flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (typeof window !== "undefined" && !window.location.hash.includes("browse")) {
                const el = document.getElementById("browse");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            placeholder="Search laptops, books, hostel gear…"
            className="h-11 w-full rounded-full border border-border bg-surface-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/80 shadow-soft transition-all focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10"
          />
        </div>


        <nav className="hidden items-center gap-1 lg:flex">
          {categories.slice(0, 3).map((c) => (
            <a
              key={c.slug}
              href={`/#browse`}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary"
            >
              {c.name}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
