import { createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  HelpCircle,
  Lock,
  Loader2,
  MapPin,
  ChevronDown,
  ShoppingBag,
  Phone,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { formatTsh, SODA_PRICE } from "@/lib/menu";
import { sanitizeTzPhoneStrict } from "@/lib/formatters";
import { supabase } from "@/integrations/supabase/client";
import { createOrder, type OrderItem } from "@/lib/orders";
import { useCart } from "@/lib/cart";
import { getClaimedOffer, clearClaimedOffer } from "@/lib/offers";
import { initiateSonicPesaPayment } from "@/lib/sonic-pesa";
import { completeOrderRewards } from "@/lib/rewards.functions";


import { DEFAULT_DELIVERY_FEE } from "@/lib/menu";

const DELIVERY_AREAS = [
  "Hosteli Block 6A",
  "Hosteli Block 6B",
  "New Hostels",
  "Iyunga",
  "Inyara",
  "Lupeta",
  "Hosteli Block 8C",
  "Hosteli Block 8D",
];

type CheckoutState = {
  itemId?: string;
  name?: string;
  price?: number;
  imageUrl?: string;
  vendorName?: string;
  quantity?: number;
  addSoda?: boolean;
  deliveryFee?: number;
};

declare module "@tanstack/react-router" {
  interface HistoryState extends CheckoutState {}
}

export const Route = createFileRoute("/msosi/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout – MUST Food Fasta" },
      {
        name: "description",
        content:
          "Complete your food order — enter your name, phone number and delivery location. MUST Food Fasta.",
      },
      { property: "og:title", content: "Checkout — MUST Food Fasta" },
      {
        property: "og:description",
        content: "Fast, frictionless payment. No login required.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: MsosiCheckout,
});

function MsosiCheckout() {
  const navigate = useNavigate();
  const locationState = useRouterState({
    select: (s) => s.location.state as CheckoutState | undefined,
  });

  const order = useMemo<Required<CheckoutState>>(
    () => ({
      itemId: locationState?.itemId ?? "",
      name: locationState?.name ?? "Chips Kuku",
      price: locationState?.price ?? 7500,
      imageUrl: locationState?.imageUrl ?? "",
      vendorName: locationState?.vendorName ?? "",
      quantity: locationState?.quantity ?? 1,
      addSoda: locationState?.addSoda ?? false,
      deliveryFee: locationState?.deliveryFee ?? DEFAULT_DELIVERY_FEE,
    }),
    [locationState],
  );

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState(DELIVERY_AREAS[0]);
  const [room, setRoom] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [claimed] = useState(() => getClaimedOffer());

  const cart = useCart();
  const cartMode = !locationState?.name && cart.items.length > 0;
  const cartItems: OrderItem[] = cartMode ? cart.items : [];

  const subtotal = cartMode
    ? cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity + (i.addSoda ? SODA_PRICE : 0),
        0,
      )
    : order.price * order.quantity + (order.addSoda ? SODA_PRICE : 0);
  // Delivery fee is set per dish by the admin — a mixed cart pays the highest fee once.
  const deliveryFee = cartMode
    ? cartItems.reduce(
        (max, i) => Math.max(max, i.deliveryFee ?? DEFAULT_DELIVERY_FEE),
        0,
      ) || DEFAULT_DELIVERY_FEE
    : order.deliveryFee;
  const discount = claimed?.discountPercent
    ? Math.round((subtotal * claimed.discountPercent) / 100)
    : 0;
  const total = subtotal - discount + deliveryFee;


  const handleSonicPesaPayment = async () => {
    const cleanName = fullName.trim();
    if (!cleanName) {
      toast.error("Please enter your full name.");
      return;
    }
    const cleanPhone = sanitizeTzPhoneStrict(phone);
    if (!cleanPhone) {
      toast.warning(
        "Tafadhali weka namba sahihi ya simu (mfano: 07XXXXXXXX).",
      );
      return;
    }
    if (!room.trim()) {
      toast.error("Please enter your street name / room number.");
      return;
    }
    setSubmitting(true);
    try {
      // Resolve the signed-in user first so we can pass their email to Sonic Pesa.
      const { data } = await supabase.auth.getUser();
      const authUser = data.user && !data.user.is_anonymous ? data.user : null;

      // 1. Trigger the Sonic Pesa mobile money PIN push.
      const payment = await initiateSonicPesaPayment({
        amount: total,
        phoneNumber: cleanPhone,
        customerName: cleanName,
        buyerEmail: authUser?.email ?? undefined,
        description: "Msosi Fasta Food Order",
      });
      if (!payment.ok) {
        toast.error(payment.message ?? "Payment request failed.");
        setSubmitting(false);
        return;
      }
      toast.success(
        "Ombi la malipo limetumwa! Angalia simu yako na uweke PIN kuthibitisha.",
      );

      // 2. Save the order once the push was accepted.
      const uid = authUser?.id ?? null;
      let orderId: string | null = null;
      if (uid) {

        orderId = await createOrder({
          userId: uid,
          items: cartMode
            ? cartItems
            : [
                {
                  itemId: order.itemId,
                  name: order.name,
                  price: order.price,
                  quantity: order.quantity,
                  imageUrl: order.imageUrl || undefined,
                  vendorName: order.vendorName || undefined,
                  addSoda: order.addSoda,
                  deliveryFee: order.deliveryFee,
                },
              ],
          total,
          area,
          room: room.trim(),
          phone: cleanPhone,
          customerName: cleanName,
          paymentReference: payment.reference,
        });
      }
      // Award streak + reward points (idempotent server-side; non-fatal).
      if (orderId) {
        try {
          const rewards = await completeOrderRewards({ data: { orderId } });
          if (rewards.streakIncreased && rewards.streak > 1) {
            toast.success(`🔥 ${rewards.streak}-day streak! Keep it going!`);
          }
          if (rewards.pointsEarned > 0) {
            toast.success(`+${rewards.pointsEarned} reward points earned! 🎉`);
          }
        } catch {
          /* rewards are best-effort */
        }
      }
      clearClaimedOffer();
      if (cartMode) cart.clear();
      toast.success(
        `Order received! ${formatTsh(total, "TSh")} — a PIN push has been sent to +${cleanPhone}.`,
      );
      // Short delay so the success toast is visible before navigating.
      setTimeout(() => {
        navigate({
          to: "/msosi/success/$orderId",
          params: { orderId: orderId ?? "guest" },
          state: {
            orderId: orderId ?? undefined,
            total,
            area,
            room: room.trim(),
            phone: cleanPhone,
            name: order.name,
            vendorName: order.vendorName,
            customerName: cleanName,

          },
        });
      }, 700);
    } catch {
      toast.error("Could not save your order. Please try again.");
      setSubmitting(false);
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

      {/* ===================== STICKY TOP APP BAR ===================== */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate({ to: "/msosi" })}
          aria-label="Go back"
          className="grid h-10 w-10 place-items-center rounded-full text-slate-700 transition-colors hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold text-slate-900 md:text-lg">
          MUST Food Fasta
        </h1>
        <button
          type="button"
          aria-label="Help"
          className="grid h-10 w-10 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </header>

      {/* ===================== TWO-COLUMN LAYOUT ===================== */}
      <div className="relative mx-auto flex max-w-5xl flex-col gap-8 px-4 py-6 pb-28 md:flex-row md:py-10 md:pb-12">
        {/* LEFT — ORDER SUMMARY */}
        <section className="md:w-[42%] md:shrink-0">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs md:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <ShoppingBag className="h-5 w-5 text-[#008542]" />
              Order Summary
            </h2>

            {cartMode ? (
              <div className="space-y-3">
                {cartItems.map((item, idx) => (
                  <div key={`${item.itemId}-${idx}`} className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        className="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-slate-100 text-xl ring-1 ring-slate-200">
                        🍽️
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {item.name}
                        {item.addSoda ? " + Soda" : ""}
                      </p>
                      {item.vendorName && (
                        <p className="truncate text-xs text-slate-500">
                          {item.vendorName}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs font-medium text-slate-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-slate-900">
                      {formatTsh(
                        item.price * item.quantity + (item.addSoda ? SODA_PRICE : 0),
                        "TSh",
                      )}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
            <div className="flex items-center gap-3">
              {order.imageUrl ? (
                <img
                  src={order.imageUrl}
                  alt={order.name}
                  loading="lazy"
                  decoding="async"
                  className="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
                />
              ) : (
                <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-100 ring-1 ring-slate-200" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">
                  {order.name}
                </p>
                {order.vendorName && (
                  <p className="truncate text-xs text-slate-500">
                    {order.vendorName}
                  </p>
                )}
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  Qty: {order.quantity}
                </p>
              </div>
              <span className="shrink-0 text-sm font-bold text-slate-900">
                {formatTsh(order.price * order.quantity, "TSh")}
              </span>
            </div>
            )}

            {!cartMode && order.addSoda && (
              <div className="mt-3 flex items-center gap-3">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-emerald-50 text-2xl ring-1 ring-emerald-100">
                  🥤
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">
                    Soda (Azam/Coca-Cola)
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    Qty: 1
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-slate-900">
                  {formatTsh(SODA_PRICE, "TSh")}
                </span>
              </div>
            )}

            <div className="mt-5 space-y-2 border-t border-dashed border-slate-200 pt-4 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  {formatTsh(subtotal, "TSh")}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-[#008542]">
                  <span className="font-semibold">
                    Discount {claimed?.promoCode ? `(${claimed.promoCode})` : ""} −
                    {claimed?.discountPercent}%
                  </span>
                  <span className="font-bold">− {formatTsh(discount, "TSh")}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600">
                <span>Delivery Fee</span>
                <span className="font-semibold text-slate-900">
                  {formatTsh(deliveryFee, "TSh")}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="font-bold text-slate-900">Total Amount</span>
                <span className="text-lg font-extrabold text-[#008542]">
                  {formatTsh(total, "TSh")}
                </span>
              </div>
              <p className="pt-1 text-right text-xs font-medium text-amber-600">
                🎁 Signed-in students earn ~{Math.floor(total / 1000)} points with this order
              </p>
            </div>
          </div>
        </section>

        {/* RIGHT — CHECKOUT FORM */}
        <section className="min-w-0 flex-1">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Checkout
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Fast, frictionless payment. No login required.
          </p>

          {/* Contact details */}
          <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs md:p-6">
            <h3 className="mb-4 text-sm font-bold tracking-tight text-slate-900">
              Contact Details
            </h3>

            <label className="block text-xs font-semibold text-slate-600">
              Full Name
            </label>
            <div className="relative mt-1.5">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Hassani Mfwangavo"
                maxLength={80}
                autoComplete="name"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#008542]"
              />
            </div>

            <label className="mt-4 block text-xs font-semibold text-slate-600">
              Phone Number (for Payment Push)
            </label>
            <div className="relative mt-1.5">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <span className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                +255
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g 0674 044 676"
                maxLength={14}
                autoComplete="tel-national"
                inputMode="tel"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-[4.9rem] pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#008542]"
              />
            </div>
          </div>

          {/* Delivery location */}
          <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs md:p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-tight text-slate-900">
              <MapPin className="h-4 w-4 text-[#008542]" />
              Delivery Location
            </h3>

            <label className="block text-xs font-semibold text-slate-600">
              Area / Block
            </label>
            <div className="relative mt-1.5">
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#008542]"
              >
                {DELIVERY_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            <label className="mt-4 block text-xs font-semibold text-slate-600">
              Street Name / Room Number
            </label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. 6A, Ikuti Sokoni"
              maxLength={80}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#008542]"
            />
          </div>

          {/* Desktop inline payment CTA (mobile uses the fixed bottom bar) */}
          <button
            type="button"
            onClick={handleSonicPesaPayment}
            disabled={submitting}
            className="mt-6 hidden w-full items-center justify-center gap-2 rounded-full bg-[#008542] px-6 py-3.5 font-bold text-white shadow-md transition-all hover:bg-[#006e36] active:scale-[0.98] disabled:opacity-60 md:flex"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <Lock className="h-4 w-4 shrink-0" />
            )}
            <span className="whitespace-nowrap text-sm">
              {submitting
                ? "Inatuma ombi kwenye simu yako..."
                : "Pay Now via Mobile Money (M-Pesa, Mixx, Airtel, Halopesa)"}
            </span>
          </button>
        </section>
      </div>

      {/* ===================== STICKY BOTTOM PAYMENT CTA ===================== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center border-t border-slate-200 bg-white/95 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden">
        <button
          type="button"
          onClick={handleSonicPesaPayment}
          disabled={submitting}
          className="flex w-full max-w-2xl items-center justify-center gap-2 rounded-full bg-[#008542] px-6 py-3.5 font-bold text-white shadow-md transition-all hover:bg-[#006e36] active:scale-[0.98] disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          ) : (
            <Lock className="h-4 w-4 shrink-0" />
          )}
          <span className="whitespace-nowrap text-xs sm:text-sm">
            {submitting
              ? "Inatuma ombi kwenye simu yako..."
              : "Pay Now via Mobile Money"}
          </span>
        </button>
      </div>
    </div>
  );
}
