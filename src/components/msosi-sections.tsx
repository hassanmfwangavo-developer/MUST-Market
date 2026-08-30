import { Copy, Gift, Smartphone, UtensilsCrossed, BikeIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuthUser } from "@/lib/auth-store";

const STEPS = [
  {
    icon: UtensilsCrossed,
    title: "Choose your food",
    body: "Browse today's menu from trusted campus cafeterias and pick your meal.",
  },
  {
    icon: Smartphone,
    title: "Pay via Mobile Money",
    body: "Confirm with M-Pesa, Tigo Pesa or Airtel Money in a few seconds.",
  },
  {
    icon: BikeIcon,
    title: "Receive at your hostel",
    body: "Your order is delivered hot to your hostel block or gheto door.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative z-10 mx-auto max-w-5xl px-4 pb-8">
      <h2 className="text-lg font-bold tracking-tight text-[#0F172A] sm:text-xl">
        How it works
      </h2>
      <p className="mb-4 text-xs text-slate-500 sm:text-sm">
        Three simple steps from craving to doorstep
      </p>

      <ol className="grid gap-3 sm:grid-cols-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <li
              key={s.title}
              className="shadow-2xs relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4"
            >
              <span className="absolute right-3 top-2 text-4xl font-black text-slate-100">
                {i + 1}
              </span>
              <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-[#008542]">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="relative mt-3 text-sm font-bold text-slate-900">
                {s.title}
              </h3>
              <p className="relative mt-1 text-xs leading-relaxed text-slate-500">
                {s.body}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function ReferralCard() {
  const { user } = useAuthUser();
  const link = `https://mustmarket.store/msosi?ref=${user?.id ?? ""}`;

  const copy = async () => {
    if (!user) {
      toast.error("Sign in first to get your personal invite link.");
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Invite link copied! Share it with your roommates 🎉");
    } catch {
      toast.error("Could not copy the link. Please copy it manually.");
    }
  };

  return (
    <section className="relative z-10 mx-auto max-w-5xl px-4 pb-10">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#00301a] via-[#00542b] to-[#008542] p-6 text-white shadow-lg sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-400/25 blur-2xl"
        />
        <div className="relative flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/15 backdrop-blur">
            <Gift className="h-5 w-5 text-amber-300" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold leading-tight tracking-tight sm:text-xl">
              Invite 3 roommates, get a free soda 🥤
            </h2>
            <p className="mt-1 text-xs text-white/75 sm:text-sm">
              Share your personal link. You earn reward points every time a
              friend places their first order.
            </p>
          </div>
        </div>

        <div className="relative mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <p className="flex-1 truncate rounded-xl border border-white/15 bg-white/10 px-4 py-3 font-mono text-xs text-white/90 backdrop-blur">
            {user ? link : "Sign in to generate your invite link"}
          </p>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-900 shadow-md transition-transform hover:scale-[1.02]"
          >
            <Copy className="h-4 w-4" />
            Copy Link
          </button>
        </div>
      </div>
    </section>
  );
}
