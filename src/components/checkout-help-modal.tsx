import { useEffect } from "react";
import { X, HelpCircle, MessageCircle, Smartphone, Truck, UserCheck } from "lucide-react";

const FAQS = [
  {
    icon: Smartphone,
    question: "What if the USSD PIN prompt doesn't appear on my phone?",
    answer:
      "Check that your phone has network signal and is not in airplane mode. Make sure the number you entered is active and has mobile money enabled. If nothing pops up within 60 seconds, tap Pay Now again or contact support.",
  },
  {
    icon: Truck,
    question: "How does hostel delivery work after payment?",
    answer:
      "Once your payment is confirmed, your order is sent to the cafeteria and a delivery runner brings it to the area and room/street you entered. You will receive updates on your order status page.",
  },
  {
    icon: UserCheck,
    question: "Can I checkout as a guest without an account?",
    answer:
      "Yes. Guest checkout is fully supported — just enter your name, active phone number and delivery location. Creating an account later lets you earn reward points and streaks.",
  },
];

const WHATSAPP_LINK =
  "https://wa.me/255674044676?text=Habari%20MUST%20Market,%20ninachangamoto%20kwenye%20malipo%20ya%20oda%20yangu";

export function CheckoutHelpModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] animate-fade-in">
      <button
        aria-label="Close help"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
      />
      <div className="animate-scale-in absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-slate-200 bg-white p-5 shadow-[0_-12px_40px_-20px_rgba(15,23,42,0.5)] sm:bottom-6 sm:left-1/2 sm:right-auto sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:rounded-3xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />

        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-[#008542]">
              <HelpCircle className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-slate-900">
                Msaada wa Malipo &amp; Oda (Help)
              </h2>
              <p className="text-[11px] text-slate-500">
                Quick answers for checkout, delivery and payment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq) => (
            <div
              key={faq.question}
              className="rounded-2xl border border-slate-100 bg-[#FAFBF6] p-4"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-[#008542] shadow-soft">
                  <faq.icon className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {faq.question}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#008542] px-5 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-[#006e36]"
        >
          <MessageCircle className="h-4 w-4" />
          Wasiliana na Admin WhatsApp
        </a>
      </div>
    </div>
  );
}
