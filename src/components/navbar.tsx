import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BedDouble,
  BookOpen,
  ChefHat,
  Flame,
  Home,
  Instagram,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  User as UserIcon,
  UtensilsCrossed,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { categories, categoryLabel } from "@/lib/demo-data";
import { setSearchQuery, useSearchQuery } from "@/lib/search-store";
import { openAuthModal, useAuthUser } from "@/lib/auth-store";
import { fetchPortalAccess, type PortalRole } from "@/lib/vendor-portal";
import { useLanguage } from "@/context/LanguageContext";
import { BOOKS24_URL, INSTAGRAM_URL } from "@/lib/site";
import { LanguageToggle } from "@/components/language-toggle";
import { InstallAppButton } from "@/components/install-app-button";

const NAV_LINKS = [
  { label: "Marketplace", to: "/market" as const },
  { label: "Electronics", to: "/market/electronics" as const },
  { label: "Rooms & Gheto", to: "/market/rooms-gheto" as const },
  { label: "Msosi Fasta", to: "/msosi" as const },
  { label: "Service Mall", to: "/services" as const },
  { label: "Founder", to: "/meet-the-founder" as const },
];

const DRAWER_LINKS = [
  { label: "Home Portal", to: "/" as const, icon: Home },
  { label: "Marketplace", to: "/market" as const, icon: ShoppingBag },
  { label: "Electronics", to: "/market/electronics" as const, icon: Smartphone },
  { label: "Rooms & Gheto", to: "/market/rooms-gheto" as const, icon: BedDouble },
  { label: "Msosi Fasta", to: "/msosi" as const, icon: UtensilsCrossed },
  { label: "Service Mall", to: "/services" as const, icon: Wrench },
  { label: "Meet the Founder", to: "/meet-the-founder" as const, icon: UserIcon },
];

export function Navbar() {
  const query = useSearchQuery();
  const { user } = useAuthUser();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [followOpen, setFollowOpen] = useState(false);
  const [portalRole, setPortalRole] = useState<PortalRole>("none");
  const [rewards, setRewards] = useState({ streak: 0, points: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setPortalRole("none");
      setRewards({ streak: 0, points: 0 });
      return;
    }
    void fetchPortalAccess().then((access) => {
      if (!cancelled) setPortalRole(access.role);
    });
    void supabase
      .from("profiles")
      .select("current_streak, reward_points")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        setRewards({
          streak: data.current_streak ?? 0,
          points: data.reward_points ?? 0,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleSignOut() {
    setMenuOpen(false);
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  function handleUpdatesClick() {
    setDrawerOpen(false);
    setFollowOpen(true);
    // Opened inside the click gesture so the browser allows the new tab.
    window.open(INSTAGRAM_URL, "_blank", "noopener,noreferrer");
  }

  const initial =
    (user?.user_metadata?.full_name as string | undefined)?.[0]?.toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    "U";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-surface-2 text-foreground transition-colors hover:bg-primary-soft hover:text-primary lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/" className="group flex shrink-0 items-center gap-2" aria-label="Go to home">
          {/* NEMBO YAKO MPYA INAKAA HAPA SASA HIVI (TUMEFUTA KIBEGI CHA LOVABLE) */}
          <img
            src="/favicon-32x32.png"
            alt="MUST Market Logo"
            className="h-9 w-9 rounded-xl object-contain shadow-soft transition-transform group-hover:scale-105"
          />

          <span className="hidden text-[17px] font-semibold tracking-tight text-foreground sm:block">
            MUST <span className="text-primary">Market</span>
          </span>
        </Link>

        <div className="relative hidden min-w-0 max-w-xl flex-1 lg:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            aria-label="Search listings"
            value={query}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (typeof window !== "undefined" && !window.location.hash.includes("browse")) {
                const el = document.getElementById("browse");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            placeholder={t.search.placeholder}
            className="h-11 w-full rounded-full border border-border bg-surface-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/80 shadow-soft transition-all focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={BOOKS24_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary"
          >
            Books <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <InstallAppButton />
          <LanguageToggle />
          {user ? (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Account menu"
                className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-border bg-primary text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span>{initial}</span>
                )}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-surface shadow-lift animate-scale-in">
                  <div className="border-b border-border px-4 py-3">
                    <div className="text-sm font-semibold text-foreground truncate">
                      {(user.user_metadata?.full_name as string | undefined) ?? "Signed in"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                        <Flame className="h-3 w-3" />
                        {rewards.streak} Day Streak
                      </span>
                      <span className="inline-flex items-center rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary">
                        {rewards.points} pts
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-surface-2"
                  >
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    My Account &amp; Rewards
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-surface-2"
                  >
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    {t.nav.dashboard}
                  </Link>
                  {(portalRole === "vendor" || portalRole === "admin") && (
                    <Link
                      to="/vendor/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-surface-2"
                    >
                      <ChefHat className="h-4 w-4 text-accent" />
                      Vendor Kitchen Portal
                    </Link>
                  )}
                  {portalRole === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-surface-2"
                    >
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-destructive hover:bg-destructive/5"
                  >
                    <LogOut className="h-4 w-4" />
                    {t.nav.logout}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal()}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft hover:-translate-y-0.5 transition-transform sm:text-sm"
            >
              <UserIcon className="h-4 w-4" />
              {t.nav.login}
            </button>
          )}
        </div>
      </div>

      {drawerOpen && typeof document !== "undefined" && createPortal(
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[82vw] flex-col border-r border-border bg-surface shadow-lift">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4">
              <div className="flex min-w-0 items-center gap-2">
                <img
                  src="/favicon-32x32.png"
                  alt="MUST Market Logo"
                  className="h-8 w-8 shrink-0 rounded-lg object-contain"
                />
                <span className="truncate text-[15px] font-semibold tracking-tight text-foreground">
                  MUST <span className="text-primary">Market</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-surface-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-3">
              {DRAWER_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setDrawerOpen(false)}
                  activeOptions={{ exact: l.to === "/" }}
                  activeProps={{ className: "bg-primary-soft text-primary" }}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-2"
                >
                  <l.icon className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
                  {l.label}
                </Link>
              ))}
              <a
                href={BOOKS24_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-2"
              >
                <BookOpen className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
                Books &amp; E-Books
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
              <button
                type="button"
                onClick={handleUpdatesClick}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-2"
              >
                <Megaphone className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
                Updates
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </nav>
          </aside>
        </div>,
        document.body,
      )}

      {followOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[60] grid place-items-center p-4">
          <button
            type="button"
            aria-label="Close follow pop-up"
            onClick={() => setFollowOpen(false)}
            className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-6 text-center shadow-lift animate-scale-in">
            <button
              type="button"
              onClick={() => setFollowOpen(false)}
              aria-label="Close"
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-border bg-surface-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
              <Instagram className="h-7 w-7" />
            </span>
            <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
              Please follow us!
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The MUST Market Instagram page just opened in a new tab — hit follow so you never miss campus deals and updates.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
              >
                <Instagram className="h-4 w-4" />
                Follow MUST Market
              </a>
              <button
                type="button"
                onClick={() => setFollowOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-border bg-surface-2 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </header>
  );
}
