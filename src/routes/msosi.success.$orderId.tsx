import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Home, MessageCircle, MapPin, Clock, Wallet } from "lucide-react";
import { fetchOrderById, type FoodOrder } from "@/lib/orders";
import { formatTsh } from "@/lib/menu";

type SuccessState = {
  orderId?: string;
  total?: number;
  area?: string;
  room?: string;
  phone?: string;
  name?: string;
  vendorName?: string;
};

declare module "@tanstack/react-router" {
  interface HistoryState extends SuccessState {}
}

export const Route = createFileRoute("/msosi/success/$orderId")({
  head: () => ({
    meta: [
      { title: "Malipo Yamefanikiwa — Msosi Fasta | MUST Market" },
      {
        name: "description",
        content:
          "Oda yako imepokelewa. Jikoni imeanza kuandaa chakula chako. Fuatilia hatua za maandalizo na ufikishi.",
      },
      { property: "og:title", content: "Malipo Yamefanikiwa — Msosi Fasta" },
      {
        property: "og:description",
        content: "Oda yako imepokelewa. Msosi Fasta ya MUST Market.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: MsosiSuccess,
});

const KITCHEN_WHATSAPP = "255674044676";

function MsosiSuccess() {
  const { orderId } = Route.useParams();
  const navigate = useNavigate();
  const locationState = useRouterState({
    select: (s) => s.location.state as SuccessState | undefined,
  });

  // Try to fetch the persisted order when we have a real uuid.
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      orderId,
    );

  const { data: order } = useQuery<FoodOrder | null>({
    queryKey: ["food_order", orderId],
    queryFn: () => fetchOrderById(orderId),
    enabled: isUuid,
  });

  const total = order?.total_tsh ?? locationState?.total ?? 0;
  const area = order?.delivery_area ?? locationState?.area ?? "—";
  const room = order?.room ?? locationState?.room ?? "—";
  const dishName = order?.items?.[0]?.name ?? locationState?.name ?? "Oda yako";
  const vendorName =
    order?.items?.[0]?.vendor_name ?? locationState?.vendorName ?? "Msosi Fasta";

  const shortId = isUuid ? orderId.slice(0, 8).toUpperCase() : orderId.toUpperCase();
  const whatsappText = encodeURIComponent(
    `Habari! Nafuatilia oda yangu #MF-${shortId} (${dishName}) kutoka ${vendorName}. Inaendaje?`,
  );

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

      <main className="relative z-10 mx-auto flex max-w-md flex-col items-center px-4 pb-16 pt-12 text-center">
        {/* ===================== ANIMATED SUCCESS TICK ===================== */}
        <div className="relative mb-6 h-20 w-20">
          {/* Spinning outer border accent */}
          <span
            aria-hidden
            className="animate-spin-slow absolute inset-0 rounded-full border-2 border-[#008542] border-t-transparent opacity-40"
          />
          {/* Glowing emerald circle */}
          <div className="animate-bounce-short flex h-20 w-20 items-center justify-center rounded-full border border-[#008542]/30 bg-emerald-500/10 shadow-[0_0_30px_rgba(0,133,66,0.25)]">
            <Check
              className="animate-tick-pop text-[#008542]"
              size={40}
              strokeWidth={3}
            />
          </div>
        </div>

        <h1 className="mb-1 text-2xl font-extrabold text-slate-900">
          Malipo Yamefanikiwa! 🎉
        </h1>
        <p className="text-sm text-slate-500">
          Oda yako <span className="font-bold text-slate-700">#{`MF-${shortId}`}</span>{" "}
          imepokelewa na jikoni imeanza kuandaliwa.
        </p>

        {/* ===================== PROGRESS STEPPER ===================== */}
        <div className="my-6 flex max-w-sm items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          {/* Step 1: Lipa — completed */}
          <Step
            label="Lipa"
            state="done"
          />
          <Connector />
          {/* Step 2: Inapikwa — current */}
          <Step label="Inapikwa" state="active" />
          <Connector />
          {/* Step 3: Njia Kuja — pending */}
          <Step label="Njia Kuja" state="pending" />
        </div>

        {/* ===================== ORDER & DELIVERY DETAILS ===================== */}
        <div className="max-w-md space-y-3 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-2xs">
          <h2 className="text-sm font-bold tracking-tight text-slate-900">
            Maelezo ya Oda
          </h2>

          <DetailRow icon={<MapPin className="h-4 w-4 text-[#008542]" />} label="Eneo la Kufikishia">
            <span className="font-semibold text-slate-900">{area}</span>
            <span className="block text-xs text-slate-500">{room}</span>
          </DetailRow>

          <DetailRow icon={<Clock className="h-4 w-4 text-[#008542]" />} label="Muda wa Kufikishiwa">
            <span className="font-semibold text-slate-900">15 - 20 Minutes</span>
          </DetailRow>

          <DetailRow icon={<Wallet className="h-4 w-4 text-[#008542]" />} label="Jumla Iliyolipwa">
            <span className="font-extrabold text-[#008542]">{formatTsh(total, "TSh")}</span>
          </DetailRow>
        </div>

        {/* ===================== STREAK BOOST REWARD CARD ===================== */}
        <div className="mt-4 flex w-full max-w-md items-center gap-3 rounded-xl border border-amber-300/60 bg-amber-500/10 p-3">
          <span className="text-2xl">🔥</span>
          <p className="text-left text-sm font-semibold text-amber-900">
            Day Streak Unlocked! Unazidi kuwa Chuo Foodie wa MUST!
          </p>
        </div>

        {/* ===================== ACTION BUTTONS ===================== */}
        <div className="mt-8 w-full max-w-md space-y-3">
          <Link
            to="/msosi"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#008542] px-6 py-3.5 font-bold text-white shadow-md transition-colors hover:bg-[#006e36]"
          >
            <Home className="h-5 w-5 shrink-0" />
            <span className="text-sm">Rudi Nyumbani / Soko</span>
          </Link>

          <a
            href={`https://wa.me/${KITCHEN_WHATSAPP}?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3.5 font-semibold text-[#008542] transition-colors hover:bg-emerald-100"
          >
            <MessageCircle className="h-5 w-5 shrink-0" />
            <span className="text-sm">Wasiliana na Jikoni / MPishi (WhatsApp)</span>
          </a>
        </div>
      </main>
    </div>
  );
}

/* ----------------------------- Sub-components ----------------------------- */

type StepState = "done" | "active" | "pending";

function Step({ label, state }: { label: string; state: StepState }) {
  if (state === "done") {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#008542] text-white shadow-sm">
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
        <span className="text-xs font-semibold text-slate-700">{label}</span>
      </div>
    );
  }
  if (state === "active") {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-[#008542] shadow-[0_0_0_4px_rgba(0,133,66,0.15)] ring-1 ring-[#008542]/40">
          <span className="h-2.5 w-2.5 animate-ping rounded-full bg-[#008542]" />
        </span>
        <span className="text-xs font-bold text-[#008542]">{label}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-400 ring-1 ring-slate-200">
        <span className="h-2 w-2 rounded-full bg-slate-300" />
      </span>
      <span className="text-xs font-medium text-slate-400">{label}</span>
    </div>
  );
}

function Connector() {
  return (
    <span
      aria-hidden
      className="h-0.5 flex-1 rounded-full bg-slate-200"
    />
  );
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <div className="mt-0.5 text-sm">{children}</div>
      </div>
    </div>
  );
}
