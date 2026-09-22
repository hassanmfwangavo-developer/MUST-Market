import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Flame, LayoutDashboard, LogOut, Search, ShieldCheck, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { categories, categoryLabel } from "@/lib/demo-data";
import { setSearchQuery, useSearchQuery } from "@/lib/search-store";
import { openAuthModal, useAuthUser } from "@/lib/auth-store";
import { isCurrentUserAdmin } from "@/lib/admin";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/language-toggle";

const NAV_LINKS = [
  { label: "Marketplace", to: "/market" as const },
  { label: "Electronics", to: "/market/electronics" as const },
  { label: "Rooms & Gheto", to: "/market/rooms-gheto" as const },
  { label: "Books", to: "/market/books-stationery" as const },
  { label: "Msosi Fasta", to: "/msosi" as const },
  { label: "Service Mall", to: "/services" as const },
  { label: "Founder", to: "/meet-the-founder" as const },
];

export function Navbar() {
  const query = useSearchQuery();
  const { user } = useAuthUser();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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
    let cancelled = false;
    if (!user) {
      setIsAdmin(false);
      setRewards({ streak: 0, points: 0 });
      return;
    }
    void isCurrentUserAdmin().then((allowed) => {
      if (!cancelled) setIsAdmin(allowed);
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

  const initial =
    (user?.user_metadata?.full_name as string | undefined)?.[0]?.toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    "U";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
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

        <div className="relative min-w-0 flex-1 max-w-xl">
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
        </nav>

        <div className="flex shrink-0 items-center gap-2">
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
                  {isAdmin && (
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
    </header>
  );
}
