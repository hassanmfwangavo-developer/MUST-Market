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

export function WhatsAppGroupCard() {
  return (
    <section className="relative z-10 mx-auto max-w-5xl px-4 pb-10">
      <div className="flex flex-col gap-5 rounded-2xl bg-[#008542] p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/15">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-extrabold leading-tight sm:text-lg">
              Jiunge na Group la MUST Market🙏🏻 
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-white/85">
              Pata taarifa za menyu ya kila siku, ofa za chakula, na punguzo la bei MUST &amp; Mtaani
            </p>
          </div>
        </div>
        <a
          href="https://chat.whatsapp.com/G7w7qs8O2d24OJeJcyuNK5?s=cl&p=a&iam=2"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#006b35] transition-colors hover:bg-emerald-50"
        >
          Jiunge Sasa
        </a>
      </div>
    </section>
  );
}
