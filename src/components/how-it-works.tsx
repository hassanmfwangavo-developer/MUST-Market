import { ListPlus, MessageCircle, Handshake } from "lucide-react";

const steps = [
  {
    n: "1",
    icon: ListPlus,
    title: "List Your Item",
    body: "Fill out our seamless form with product specifications, locations around MUST, and your phone number.",
  },
  {
    n: "2",
    icon: MessageCircle,
    title: "Direct Chat",
    body: "Interested buyers tap 'Order Now' to instantly open a WhatsApp conversation with a pre-filled trade deal.",
  },
  {
    n: "3",
    icon: Handshake,
    title: "Safe Meetup",
    body: "Meet up at a safe spot — the Library, Academic Blocks, or a busy area near the hostels — to test and exchange safely.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative border-y border-border/60 bg-surface-2/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
            How it works
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            How MUST Market Works
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Three simple steps between you and your next campus deal.
          </p>
        </div>

        <ol className="mt-12 grid gap-5 sm:grid-cols-3 sm:gap-6">
          {steps.map(({ n, icon: Icon, title, body }) => (
            <li
              key={n}
              className="group relative flex flex-col rounded-3xl border border-border bg-surface p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-card sm:p-7"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
                  <Icon className="h-5 w-5" strokeWidth={2.25} />
                </span>
                <span className="text-5xl font-bold leading-none text-accent/80 tracking-tight">
                  {n}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
