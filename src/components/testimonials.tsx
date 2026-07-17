import { Quote } from "lucide-react";

const VOICES = [
  {
    name: "Hassani Mfwangavo",
    course: "BCET",
    year: "1st Year",
    quote:
      "Got a used mic for my content work at half the shop price. Seller was at New Hostels, five minute walk. Smooth trade.",
    initials: "HM",
    tint: "from-emerald-500 to-teal-600",
  },
  {
    name: "Vedastus Mlingi",
    course: "Telecom",
    year: "3rd Year",
    quote:
      "Nilipata nilichokuwa natafuta kwa haraka na kwa bei nzuri. Mawasiliano na muuzaji yalikuwa rahisi, na kila kitu kilikwenda vizuri. Hakika nitatumia MUST Market tena.",
    initials: "VM",
    tint: "from-sky-500 to-indigo-600",
  },
  {
    name: "Neema Kileo",
    course: "Civil Engineering",
    year: "2nd Year",
    quote:
      "I live in Iyunga and thought I'd be too far. Nope — buyer came to my place, tested the kettle, paid me on the spot.",
    initials: "NK",
    tint: "from-amber-500 to-rose-500",
  },
];

export function Testimonials() {
  return (
    <section className="relative overflow-hidden border-y border-border/60 bg-surface-2/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
            Community Voices
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Real MUST students. Real trades.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Here's what your fellow students say after buying and selling on MUST Market.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3 sm:gap-6">
          {VOICES.map((v, i) => (
            <figure
              key={v.name}
              className="group relative flex flex-col rounded-3xl border border-border bg-surface p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card sm:p-7"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <Quote className="h-6 w-6 text-primary/40" />
              <blockquote className="mt-3 text-sm leading-relaxed text-foreground/90">
                "{v.quote}"
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${v.tint} text-sm font-semibold text-white shadow-soft`}
                >
                  {v.initials}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">{v.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {v.course} · {v.year}
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
