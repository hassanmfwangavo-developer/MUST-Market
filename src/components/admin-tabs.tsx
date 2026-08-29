import { Link } from "@tanstack/react-router";
import { Images, LayoutGrid, ShieldCheck, UtensilsCrossed } from "lucide-react";

const TABS = [
  { to: "/admin", label: "Overview", icon: ShieldCheck, exact: true },
  { to: "/admin/banners", label: "Banners", icon: Images, exact: false },
  { to: "/admin/categories", label: "Categories", icon: LayoutGrid, exact: false },
  { to: "/admin/food", label: "Food & Vendors", icon: UtensilsCrossed, exact: false },
] as const;

/** Sub-navigation shared by every screen inside the admin console. */
export function AdminTabs() {
  return (
    <nav className="mt-5 flex flex-wrap gap-1.5 rounded-full border border-border bg-surface-2 p-1.5">
      {TABS.map(({ to, label, icon: Icon, exact }) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact }}
          activeProps={{ className: "bg-primary text-primary-foreground shadow-soft" }}
          inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors"
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
