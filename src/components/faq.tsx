import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/context/LanguageContext";

export function FAQ() {
  const { t } = useLanguage();

  return (
    <section className="relative">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-accent-foreground">
            {t.faq.badge}
          </span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t.faq.title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.faq.subtitle}</p>
        </div>

        <Accordion type="single" collapsible className="mt-8 space-y-3">
          {t.faq.items.map((item, i) => (
            <AccordionItem
              key={item.q}
              value={`item-${i}`}
              className="rounded-2xl border border-border bg-surface px-4 shadow-soft transition-colors last:border-b data-[state=open]:border-primary/30"
            >
              <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:no-underline sm:text-base">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
