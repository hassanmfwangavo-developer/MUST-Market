import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Copy,
  Flame,
  LogOut,
  Pencil,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { openAuthModal, useAuthUser } from "@/lib/auth-store";
import { sanitizeTzPhone } from "@/lib/phone";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, follow" },
      { title: "My Account – MUST Market" },
      {
        name: "description",
        content:
          "View your MUST Market account: day streak, reward points, referrals and settings.",
      },
      { property: "og:title", content: "My Account — MUST Market" },
      {
        property: "og:description",
        content: "Track your day streak, reward points and invite roommates for bonuses.",
      },
      { property: "og:type", content: "profile" },
    ],
  }),
  component: ProfilePage,
});

type ProfileRow = {
  full_name: string | null;
  avatar_url: string | null;
  whatsapp_number: string | null;
  hostel: string | null;
  current_streak: number;
  reward_points: number;
  referral_code: string | null;
  referral_count: number;
};

const HOSTELS = [
  "Hosteli Block A",
  "Hosteli Block B",
  "Hosteli Block C",
  "Iyunga",
  "Block T",
  "Off-Campus Gheto",
];

function ProfilePage() {
  const navigate = useNavigate();
  const { user, initialized } = useAuthUser();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [refStats, setRefStats] = useState({ friends: 0, pointsEarned: 0 });
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", hostel: "" });
  const [origin, setOrigin] = useState("https://www.mustmarket.store");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const load = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const [{ data: p }, { data: refs }] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, avatar_url, whatsapp_number, hostel, current_streak, reward_points, referral_code, referral_count")
          .eq("id", userId)
          .maybeSingle(),
        supabase.from("referrals").select("order_counted").eq("inviter_id", userId),
      ]);
      setProfile((p as ProfileRow | null) ?? null);
      const rows = refs ?? [];
      setRefStats({
        friends: (p as ProfileRow | null)?.referral_count ?? rows.length,
        pointsEarned: ((p as ProfileRow | null)?.referral_count ?? rows.length) * 50,
      });
    } catch {
      toast.error("Could not load your details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      setLoading(false);
      openAuthModal("/profile");
      return;
    }
    void load(user.id);
  }, [initialized, user, load]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out. See you again! 👋");
    void navigate({ to: "/", replace: true });
  };

  const referralLink = profile?.referral_code
    ? `${origin}/?ref=${profile.referral_code}`
    : user
      ? `${origin}/?ref=${user.id}`
      : origin;

  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success("Link copied! Share it with your roommates 🥤");
    } catch {
      toast.error("Could not copy the link.");
    }
  };

  const meta = user?.user_metadata ?? {};
  const avatarUrl: string = profile?.avatar_url || meta.avatar_url || meta.picture || "";
  const displayName: string =
    profile?.full_name || meta.full_name || meta.name || user?.email?.split("@")[0] || "MUST Student";

  const openEdit = () => {
    setForm({
      fullName: profile?.full_name ?? (typeof meta.full_name === "string" ? meta.full_name : ""),
      phone: profile?.whatsapp_number ?? "",
      hostel: profile?.hostel ?? "",
    });
    setEditing(true);
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.fullName.trim() || null,
        whatsapp_number: form.phone.trim() ? sanitizeTzPhone(form.phone) : null,
        hostel: form.hostel || null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Could not save your profile.");
      return;
    }
    toast.success("Profile updated.");
    setEditing(false);
    void load(user.id);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAFBF6]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md">
        <Link
          to="/msosi"
          aria-label="Go back"
          className="grid h-10 w-10 place-items-center rounded-full text-slate-700 transition-colors hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold text-slate-900 md:text-lg">My Account</h1>
        <button
          type="button"
          onClick={toggleDark}
          aria-label="Toggle theme"
          className="grid h-10 w-10 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </header>

      <main className="relative mx-auto max-w-2xl px-4 py-6 pb-24">
        {!initialized || loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-3xl bg-slate-200/60" />
            ))}
          </div>
        ) : !user ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-2xs">
            <User className="mx-auto h-10 w-10 text-[#008542]" />
            <h2 className="mt-3 text-lg font-bold text-slate-900">Sign In</h2>
            <p className="mt-1 text-sm text-slate-500">
              Sign in to view your streak, points and rewards.
            </p>
            <button
              type="button"
              onClick={() => openAuthModal("/profile")}
              className="mt-5 rounded-full bg-[#008542] px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-[#006e36]"
            >
              Sign In
            </button>
          </div>
        ) : (
          <>
            {/* ===== IDENTITY CARD ===== */}
            <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xs">
              <div className="h-20 bg-gradient-to-r from-[#008542] to-[#00A855]" />
              <div className="-mt-10 px-5 pb-5">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    loading="lazy"
                    decoding="async"
                    className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white"
                  />
                ) : (
                  <div className="grid h-20 w-20 place-items-center rounded-2xl bg-emerald-50 text-3xl font-extrabold text-[#008542] ring-4 ring-white">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <h2 className="mt-3 truncate text-xl font-extrabold tracking-tight text-slate-900">
                  {displayName}
                </h2>
                {user.email && (
                  <p className="truncate text-sm text-slate-500">{user.email}</p>
                )}
              </div>
            </section>

            {/* ===== METRIC PILLS ===== */}
            <section className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p className="flex items-center gap-1.5 text-2xl font-extrabold text-amber-600">
                  <Flame className="h-5 w-5" />
                  {profile?.current_streak ?? 0}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">Day streak</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="flex items-center gap-1.5 text-2xl font-extrabold text-[#008542]">
                  <Sparkles className="h-5 w-5" />
                  {profile?.reward_points ?? 0}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">Reward points</p>
              </div>
            </section>

            {/* ===== REFERRAL CARD ===== */}
            <section className="mt-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs">
              <h3 className="text-base font-bold text-slate-900">
                Invite Roommates, Get Free Soda! 🥤
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                You earn <span className="font-bold text-slate-700">50 points</span> when a friend
                signs up with your link.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-3 text-center ring-1 ring-slate-200">
                  <p className="text-base font-extrabold text-slate-900">{refStats.friends}</p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500">Friends joined</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 text-center ring-1 ring-slate-200">
                  <p className="text-base font-extrabold text-slate-900">
                    {refStats.pointsEarned}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500">Referral points</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  readOnly
                  value={referralLink}
                  onFocus={(e) => e.currentTarget.select()}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600 outline-none"
                />
                <button
                  type="button"
                  onClick={copyReferral}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#008542] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#006e36]"
                >
                  <Copy className="h-4 w-4" />
                  Copy Link
                </button>
              </div>
            </section>

            {/* ===== SETTINGS ===== */}
            <section className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xs">
              <button
                type="button"
                onClick={openEdit}
                className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-50"
              >
                <span className="flex items-center gap-3 text-sm font-semibold text-slate-900">
                  <Pencil className="h-4 w-4 text-[#008542]" />
                  Edit profile
                </span>
                <span className="text-xs text-slate-400">Name · Phone · Hostel</span>
              </button>
              <div className="flex items-center justify-between px-5 py-4">
                <span className="flex items-center gap-3 text-sm font-semibold text-slate-900">
                  {dark ? (
                    <Sun className="h-4 w-4 text-[#008542]" />
                  ) : (
                    <Moon className="h-4 w-4 text-[#008542]" />
                  )}
                  Dark mode
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={dark}
                  aria-label="Toggle dark mode"
                  onClick={toggleDark}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    dark ? "bg-[#008542]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                      dark ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </section>
          </>
        )}
      </main>

      {/* ===== EDIT PROFILE MODAL ===== */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-xs sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900">Edit profile</h4>
              <button
                type="button"
                onClick={() => setEditing(false)}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <label className="mt-4 block text-xs font-semibold text-slate-600">Full name</label>
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              maxLength={60}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#008542]"
            />

            <label className="mt-4 block text-xs font-semibold text-slate-600">
              WhatsApp number
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="0712 345 678"
              inputMode="tel"
              maxLength={20}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#008542]"
            />

            <label className="mt-4 block text-xs font-semibold text-slate-600">Hostel / Area</label>
            <select
              value={form.hostel}
              onChange={(e) => setForm({ ...form, hostel: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#008542]"
            >
              <option value="">Not set</option>
              {HOSTELS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={saving}
              onClick={saveProfile}
              className="mt-5 w-full rounded-full bg-[#008542] py-3 text-sm font-bold text-white transition-colors hover:bg-[#006e36] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
