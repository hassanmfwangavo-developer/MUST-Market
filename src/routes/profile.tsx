import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Copy,
  Flame,
  LogOut,
  MapPin,
  Moon,
  Plus,
  RotateCcw,
  Sun,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { openAuthModal, useAuthUser } from "@/lib/auth-store";
import { formatTsh } from "@/lib/menu";
import { sanitizeTzPhone } from "@/lib/phone";
import {
  fetchLocations,
  fetchOrders,
  STATUS_LABEL,
  type FoodOrder,
  type SavedLocation,
} from "@/lib/orders";

const AREAS = [
  "Hosteli Block A",
  "Hosteli Block B",
  "Hosteli Block C",
  "Iyunga",
  "Block T",
  "Off-Campus Gheto",
];

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Account – MUST Market" },
      {
        name: "description",
        content:
          "View your account, streaks, saved locations and MUST Food Fasta order history.",
      },
      { property: "og:title", content: "My Profile & Orders — MUST Market" },
      {
        property: "og:description",
        content: "View your order history, rewards and reorder in one tap.",
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
};

function ProfilePage() {
  const navigate = useNavigate();
  const { user, initialized } = useAuthUser();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [refStats, setRefStats] = useState({ friends: 0, pointsEarned: 0 });
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ label: "", area: AREAS[0], room: "" });

  const load = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const [{ data: p }, o, l, { data: refs }] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, avatar_url, whatsapp_number, hostel, current_streak, reward_points")
          .eq("id", userId)
          .maybeSingle(),
        fetchOrders(userId),
        fetchLocations(userId),
        supabase
          .from("referrals")
          .select("order_counted")
          .eq("inviter_id", userId),
      ]);
      setProfile((p as ProfileRow | null) ?? null);
      setOrders(o);
      setLocations(l);
      const rows = refs ?? [];
      setRefStats({
        friends: rows.length,
        pointsEarned: rows.filter((r) => r.order_counted).length * 50,
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
      // Unauthenticated visit: bring up the global auth modal automatically.
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

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  const pastOrders = useMemo(
    () => orders.filter((o) => !["pending", "preparing", "on_the_way"].includes(o.status)),
    [orders],
  );

  const referralLink = user
    ? `https://mustmarket.store/msosi?ref=${user.id}`
    : "https://mustmarket.store/msosi";

  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success("Link copied! Share it with your roommates 🥤");
    } catch {
      toast.error("Could not copy the link.");
    }
  };

  const addLocation = async () => {
    if (!user) return;
    if (!form.room.trim()) {
      toast.error("Enter your room number / gheto name.");
      return;
    }
    const { error } = await supabase.from("user_locations").insert({
      user_id: user.id,
      label: form.label.trim() || "Home",
      area: form.area,
      room: form.room.trim(),
    });
    if (error) {
      toast.error("Could not save the location.");
      return;
    }
    toast.success("New location saved!");
    setModalOpen(false);
    setForm({ label: "", area: AREAS[0], room: "" });
    setLocations(await fetchLocations(user.id));
  };

  const reorder = (order: FoodOrder) => {
    const first = order.items[0];
    if (!first) {
      toast.error("This order has no items.");
      return;
    }
    toast.success("Oda imeongezwa kwenye kikapu!");
    void navigate({
      to: "/msosi/checkout",
      state: {
        itemId: first.itemId,
        name: first.name,
        price: first.price,
        imageUrl: first.imageUrl,
        vendorName: first.vendorName,
        quantity: first.quantity,
        addSoda: first.addSoda ?? false,
      },
    });
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
          aria-label="Badilisha mandhari"
          className="grid h-10 w-10 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </header>

      <main className="relative mx-auto max-w-3xl px-4 py-6 pb-24">
        {!initialized || loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200/60" />
            ))}
          </div>
        ) : !user ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-2xs">
            <User className="mx-auto h-10 w-10 text-[#008542]" />
            <h2 className="mt-3 text-lg font-bold text-slate-900">Sign In</h2>
            <p className="mt-1 text-sm text-slate-500">
              Sign in to view your orders, streaks and saved locations.
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
            {/* ===== PROFILE HEADER ===== */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
              <div className="flex items-center gap-4">
                {(() => {
                  const meta = user.user_metadata ?? {};
                  const avatarUrl: string =
                    profile?.avatar_url || meta.avatar_url || meta.picture || "";
                  const displayName: string =
                    profile?.full_name || meta.full_name || meta.name || user.email || "";
                  return (
                    <>
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={displayName || "Profile photo"}
                          loading="lazy"
                          decoding="async"
                          className="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-emerald-100"
                        />
                      ) : (
                        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-emerald-50 text-2xl font-extrabold text-[#008542] ring-1 ring-emerald-100">
                          {(displayName || "M").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h2 className="truncate text-xl font-extrabold tracking-tight text-slate-900">
                          {displayName || "Mwanafunzi wa MUST"}
                        </h2>
                        {user.email && (
                          <p className="truncate text-sm text-slate-500">{user.email}</p>
                        )}
                        <p className="truncate text-sm text-slate-500">
                          {profile?.whatsapp_number
                            ? `+${sanitizeTzPhone(profile.whatsapp_number)}`
                            : "No phone number saved"}
                        </p>
                        <p className="mt-1 flex items-center gap-1 truncate text-sm text-slate-500">
                          <MapPin className="h-3.5 w-3.5 text-[#008542]" />
                          {profile?.hostel || "Hostel haijachaguliwa"}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-amber-50 p-3 text-center ring-1 ring-amber-100">
                  <p className="flex items-center justify-center gap-1 text-base font-extrabold text-amber-600">
                    <Flame className="h-4 w-4" />
                    {profile?.current_streak ?? 0}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500">Days streak</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3 text-center ring-1 ring-emerald-100">
                  <p className="text-base font-extrabold text-[#008542]">
                    {profile?.reward_points ?? 0}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500">Reward points</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center ring-1 ring-slate-200">
                  <p className="text-sm font-extrabold text-slate-900">Chuo Foodie</p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500">Member badge</p>
                </div>
              </div>
            </section>

            {/* ===== REFERRAL CARD ===== */}
            <section className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
              <h3 className="text-base font-bold text-slate-900">
                Invite Roommates, Get Free Soda! 🥤
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Share your personal link. When a friend signs up and places their first
                order, you earn <span className="font-bold text-slate-700">50 points</span> and
                they get <span className="font-bold text-slate-700">10 welcome points</span>.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-emerald-50 p-3 text-center ring-1 ring-emerald-100">
                  <p className="text-base font-extrabold text-[#008542]">{refStats.friends}</p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500">Friends joined</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3 text-center ring-1 ring-amber-100">
                  <p className="text-base font-extrabold text-amber-600">
                    {refStats.pointsEarned}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                    Referral points earned
                  </p>
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

            {/* ===== SAVED LOCATIONS ===== */}
            <section className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <MapPin className="h-4 w-4 text-[#008542]" />
                Maeneo Yaliyohifadhiwa
              </h3>
              <div className="mt-4 space-y-2">
                {locations.length === 0 && (
                  <p className="text-sm text-slate-500">Bado hujahifadhi eneo lolote.</p>
                )}
                {locations.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{l.label}</p>
                      <p className="truncate text-xs text-slate-500">
                        {l.area} · {l.room}
                      </p>
                    </div>
                    <CheckCircle className="h-4 w-4 shrink-0 text-[#008542]" />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#008542]/40 py-3 text-sm font-bold text-[#008542] transition-colors hover:bg-emerald-50"
              >
                <Plus className="h-4 w-4" />
                Add New Location
              </button>
            </section>

            {/* ===== ORDER HISTORY ===== */}
            <section className="mt-5">
              <h3 className="text-base font-bold text-slate-900">Order History</h3>
              <div className="mt-3 space-y-3">
                {pastOrders.length === 0 && (
                  <p className="rounded-2xl border border-slate-200/80 bg-white p-5 text-sm text-slate-500 shadow-2xs">
                    No past orders found. Start by ordering food from{" "}
                    <Link to="/msosi" className="font-bold text-[#008542]">
                      Msosi Fasta
                    </Link>
                    .
                  </p>
                )}
                {pastOrders.map((o) => (
                  <div
                    key={o.id}
                    className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">
                          {new Date(o.created_at).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="mt-1 truncate text-sm font-bold text-slate-900">
                          {o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ") ||
                            "Agizo"}
                        </p>
                        <p className="mt-1 text-sm font-extrabold text-[#008542]">
                          {formatTsh(o.total_tsh, "TSh")}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-[#008542]">
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => reorder(o)}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-slate-900 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reorder
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* ===== LOGOUT ===== */}
            <button
              type="button"
              onClick={handleLogout}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-white py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Ondoka (Logout)
            </button>
          </>
        )}
      </main>

      {/* ===== ADD LOCATION MODAL ===== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-xs sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900">Add New Location</h4>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Funga"
                className="grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <label className="mt-4 block text-xs font-semibold text-slate-600">Location label</label>
            <input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="e.g. Home"
              maxLength={40}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#008542]"
            />

            <label className="mt-4 block text-xs font-semibold text-slate-600">Area / Block</label>
            <select
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#008542]"
            >
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            <label className="mt-4 block text-xs font-semibold text-slate-600">
              Gheto Name / Room Number
            </label>
            <input
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              placeholder="e.g. Room 42, Block A"
              maxLength={80}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#008542]"
            />

            <button
              type="button"
              onClick={addLocation}
              className="mt-5 w-full rounded-full bg-[#008542] py-3 text-sm font-bold text-white transition-colors hover:bg-[#006e36]"
            >
              Hifadhi Eneo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
