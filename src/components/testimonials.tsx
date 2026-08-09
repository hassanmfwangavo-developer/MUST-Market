import { Quote } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const VOICES = [
  {
    name: "Hassani Mfwangavo",
    course: "BCET",
    year: "1st Year",
    quote:
      "Got a used mic for my content work at half the shop price. Seller was at New Hostels, five minute walk.",
    initials: "HM",
    tint: "from-emerald-500 to-teal-600",
  },
  {
    name: "Vedastus Mlingi",
    course: "Telecom",
    year: "3rd Year",
    quote:
      "Nilipata nilichokuwa natafuta kwa haraka na kwa bei nzuri. Hakika nitatumia MUST Market tena.",
    initials: "VM",
    tint: "from-sky-500 to-indigo-600",
  },
  {
    name: "Neema Kileo",
    course: "Civil Engineering",
    year: "2nd Year",
    quote: "I live in Iyunga and thought I'd be too far. Nope — buyer came, tested the kettle, paid on the spot.",
    initials: "NK",
    tint: "from-amber-500 to-rose-500",
  },
  {
    name: "Baraka Swai",
    course: "Mechanical",
    year: "4th Year",
    quote: "Sold my old textbooks in two days. WhatsApp chat made it effortless.",
    initials: "BS",
    tint: "from-violet-500 to-fuchsia-600",
  },
  {
    name: "Asha Mwakalinga",
    course: "IT",
    year: "2nd Year",
    quote: "Found a gheto near Ikuti through the Rooms listings. Way cheaper than agents.",
    initials: "AM",
    tint: "from-cyan-500 to-emerald-600",
  },
];

function VoiceCard({ v }: { v: (typeof VOICES)[number] }) {
  return (
    <figure className="flex w-[280px] shrink-0 flex-col rounded-2xl border border-border bg-surface p-4 shadow-soft sm:w-[320px]">
      <Quote className="h-4 w-4 text-primary/40" />
      <blockquote className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-foreground/90">
        "{v.quote}"
      </blockquote>
      <figcaption className="mt-3 flex items-center gap-2.5 border-t border-border pt-3">
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br ${v.tint} text-[11px] font-semibold text-white`}
        >
          {v.initials}
        </span>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold text-foreground">{v.name}</div>
          <div className="truncate text-[11px] text-muted-foreground">
            {v.course} · {v.year}
          </div>
        </div>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  const { t } = useLanguage();
  const loop = [...VOICES, ...VOICES];

  return (
    <section className="relative overflow-hidden border-y border-border/60 bg-surface-2/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
            {t.testimonials.badge}
          </span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t.testimonials.title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.testimonials.subtitle}</p>
        </div>
      </div>

      <div className="group relative pb-12 sm:pb-16">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-surface-2/90 to-transparent sm:w-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-surface-2/90 to-transparent sm:w-20" />
        <div className="overflow-hidden">
          <div className="marquee-track flex w-max flex-row gap-4 px-4">
            {loop.map((v, i) => (
              <VoiceCard key={`${v.name}-${i}`} v={v} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
