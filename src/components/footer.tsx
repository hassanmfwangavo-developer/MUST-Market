import { ShoppingBag, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-2">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <ShoppingBag className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="text-base font-semibold tracking-tight">
              MUST <span className="text-primary">Market</span>
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            The peer-to-peer marketplace built by and for Mbeya University of Science and Technology students.
          </p>
        </div>

        {[
          { title: "Marketplace", links: ["Browse", "Sell an item", "Categories", "Verified sellers"] },
          { title: "Safety", links: ["Buyer tips", "Seller tips", "Report a listing", "Community rules"] },
          { title: "About", links: ["Our mission", "Contact", "Privacy", "Terms"] },
        ].map((col) => (
          <div key={col.title}>
            <div className="text-xs font-semibold uppercase tracking-widest text-foreground">
              {col.title}
            </div>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} MUST Market. Built by students, for students.</span>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="Instagram" className="hover:text-primary"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="Twitter" className="hover:text-primary"><Twitter className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
