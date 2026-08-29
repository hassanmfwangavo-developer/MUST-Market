import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Check,
  Home,
  MessageCircle,
  MapPin,
  Clock,
  Wallet,
  Download,
  Share2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { fetchOrderById, type FoodOrder } from "@/lib/orders";
import { formatTsh } from "@/lib/menu";
import { buildReceiptPng, downloadBlob, shareBlob } from "@/lib/receipt";


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
  const locationState = useRouterState({
    select: (s) => s.location.state as SuccessState | undefined,
  });
  const [busy, setBusy] = useState<"download" | "share" | null>(null);

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
  const phone = order?.phone ?? locationState?.phone ?? "";
  const dishName = order?.items?.[0]?.name ?? locationState?.name ?? "Oda yako";
  const vendorName =
    order?.items?.[0]?.vendorName ?? locationState?.vendorName ?? "Msosi Fasta";

  const shortId = isUuid ? orderId.slice(0, 8).toUpperCase() : orderId.toUpperCase();
  const orderRef = `MF-${shortId}`;
  const whatsappText = encodeURIComponent(
    `Habari! Nafuatilia oda yangu #${orderRef} (${dishName}) kutoka ${vendorName}. Inaendaje?`,
  );

  const lines =
    order?.items && order.items.length > 0
      ? order.items.map((it) => ({
          label: it.addSoda ? `${it.name} + Soda` : it.name,
          qty: it.quantity ?? 1,
          amount: (it.price ?? 0) * (it.quantity ?? 1),
        }))
      : [{ label: dishName, qty: 1, amount: total }];

  const makeReceipt = () =>
    buildReceiptPng({
      orderRef,
      placedAt: new Date(order?.created_at ?? Date.now()).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      customerName: locationState?.name && !order ? undefined : undefined,
      phone,
      area,
      room,
      vendorName,
      eta: `${order?.eta_minutes ?? 20} min`,
      lines,
      total,
    });

  const handleDownload = async () => {
    try {
      setBusy("download");
      const blob = await makeReceipt();
      downloadBlob(blob, `Risiti-${orderRef}.png`);
      toast.success("Risiti imepakuliwa kwenye simu yako.");
    } catch {
      toast.error("Imeshindikana kutengeneza risiti. Jaribu tena.");
    } finally {
      setBusy(null);
    }
  };

  const handleShare = async () => {
    try {
      setBusy("share");
      const blob = await makeReceipt();
      const shared = await shareBlob(
        blob,
        `Risiti-${orderRef}.png`,
        `Risiti ya oda #${orderRef} — Msosi Fasta`,
      );
      if (!shared) {
        downloadBlob(blob, `Risiti-${orderRef}.png`);
        toast.success("Kushiriki hakupatikani — risiti imepakuliwa badala yake.");
      }
    } catch {
      /* user cancelled share */
    } finally {
      setBusy(null);
    }
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

      <main className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center px-4 pb-20 pt-10 text-center sm:px-6 sm:pt-14">
        {/* ===================== ANIMATED SUCCESS TICK ===================== */}
        <div className="relative mb-6 h-24 w-24 sm:h-28 sm:w-28">
          <span
            aria-hidden
            className="animate-spin-slow absolute inset-0 rounded-full border-2 border-[#008542] border-t-transparent opacity-40"
          />
          <div className="animate-bounce-short flex h-full w-full items-center justify-center rounded-full border border-[#008542]/30 bg-emerald-500/10 shadow-[0_0_36px_rgba(0,133,66,0.25)]">
            <Check
              className="animate-tick-pop h-11 w-11 text-[#008542] sm:h-12 sm:w-12"
              strokeWidth={3}
            />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Malipo Yamefanikiwa! 🎉
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-slate-500 sm:text-base">
          Oda yako{" "}
          <span className="font-bold text-slate-700">#{orderRef}</span> imepokelewa
          na jikoni imeanza kuandaliwa.
        </p>

        {/* ===================== PROGRESS STEPPER ===================== */}
        <section className="mt-8 w-full rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] sm:p-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold tracking-tight text-slate-900">
              Hali ya Oda
            </h2>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-[#008542]">
              <Clock className="h-3.5 w-3.5" />
              {order?.eta_minutes ?? 20} min
            </span>
          </div>

          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-start gap-x-2 sm:gap-x-4">
            <Step label="Lipa" caption="Imekamilika" state="done" />
            <Connector filled />
            <Step label="Inapikwa" caption="Sasa hivi" state="active" />
            <Connector />
            <Step label="Njiani" caption="Inafuata" state="pending" />
          </div>
        </section>

        {/* ===================== RECEIPT CARD ===================== */}
        <section className="mt-5 w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white text-left shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)]">
          <div className="flex items-center justify-between gap-3 border-b border-dashed border-slate-200 px-6 py-5 sm:px-8">
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold tracking-tight text-slate-900">
                Risiti ya Oda
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Pakua au share risiti yako yenye maelezo yote.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              #{orderRef}
            </span>
          </div>

          <div className="grid gap-5 px-6 py-6 sm:grid-cols-2 sm:px-8">
            <DetailRow
              icon={<MapPin className="h-4 w-4 text-[#008542]" />}
              label="Eneo la Kufikishia"
            >
              <span className="font-semibold text-slate-900">{area}</span>
              <span className="mt-0.5 block text-xs text-slate-500">{room}</span>
            </DetailRow>

            <DetailRow
              icon={<Clock className="h-4 w-4 text-[#008542]" />}
              label="Muda wa Kufikishiwa"
            >
              <span className="font-semibold text-slate-900">
                {(order?.eta_minutes ?? 20) - 5} - {order?.eta_minutes ?? 20} dakika
              </span>
            </DetailRow>

            <DetailRow
              icon={<MessageCircle className="h-4 w-4 text-[#008542]" />}
              label="Mpishi / Jikoni"
            >
              <span className="font-semibold text-slate-900">{vendorName}</span>
            </DetailRow>

            <DetailRow
              icon={<Wallet className="h-4 w-4 text-[#008542]" />}
              label="Jumla Iliyolipwa"
            >
              <span className="text-lg font-extrabold text-[#008542]">
                {formatTsh(total, "TSh")}
              </span>
            </DetailRow>
          </div>

          <div className="grid gap-3 border-t border-dashed border-slate-200 px-6 py-5 sm:grid-cols-2 sm:px-8">
            <button
              type="button"
              onClick={handleDownload}
              disabled={busy !== null}
              className="flex items-center justify-center gap-2 rounded-full bg-[#008542] px-5 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-[#006e36] disabled:opacity-60"
            >
              {busy === "download" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4 shrink-0" />
              )}
              Download Receipt
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={busy !== null}
              className="flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-[#008542] transition-colors hover:bg-emerald-100 disabled:opacity-60"
            >
              {busy === "share" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Share2 className="h-4 w-4 shrink-0" />
              )}
              Share Receipt
            </button>
          </div>
        </section>

        {/* ===================== STREAK BOOST REWARD CARD ===================== */}
        <div className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-amber-300/60 bg-amber-500/10 p-4">
          <span className="text-2xl">🔥</span>
          <p className="text-left text-sm font-semibold text-amber-900">
            Day Streak Unlocked! Unazidi kuwa Chuo Foodie wa MUST!
          </p>
        </div>

        {/* ===================== ACTION BUTTONS ===================== */}
        <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
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
            <span className="text-sm">Wasiliana na Jikoni</span>
          </a>
        </div>
      </main>
    </div>
  );

}

/* ----------------------------- Sub-components ----------------------------- */

type StepState = "done" | "active" | "pending";

function Step({
  label,
  caption,
  state,
}: {
  label: string;
  caption: string;
  state: StepState;
}) {
  const dot =
    state === "done"
      ? "bg-[#008542] text-white shadow-[0_6px_16px_-6px_rgba(0,133,66,0.7)]"
      : state === "active"
        ? "bg-white text-[#008542] ring-2 ring-[#008542] shadow-[0_0_0_6px_rgba(0,133,66,0.12)]"
        : "bg-slate-100 text-slate-400 ring-1 ring-slate-200";

  return (
    <div className="flex w-16 flex-col items-center gap-2 sm:w-20">
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors ${dot}`}
      >
        {state === "done" ? (
          <Check className="h-5 w-5" strokeWidth={3} />
        ) : state === "active" ? (
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#008542] opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-[#008542]" />
          </span>
        ) : (
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        )}
      </span>
      <span
        className={`text-xs font-bold leading-tight ${
          state === "pending"
            ? "text-slate-400"
            : state === "active"
              ? "text-[#008542]"
              : "text-slate-700"
        }`}
      >
        {label}
      </span>
      <span className="text-[10px] leading-tight text-slate-400 sm:text-[11px]">
        {caption}
      </span>
    </div>
  );
}

function Connector({ filled }: { filled?: boolean }) {
  return (
    <span
      aria-hidden
      className={`mt-[21px] h-1 w-full rounded-full ${
        filled ? "bg-[#008542]" : "bg-slate-200"
      }`}
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
