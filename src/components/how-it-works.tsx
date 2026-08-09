import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ListPlus, MessageCircle, Handshake } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const ICONS = [ListPlus, MessageCircle, Handshake];
const AUTOPLAY_MS = 5000;

export function HowItWorks() {
  const { t } = useLanguage();
  const hw = t.howItWorks;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
  const [selected, setSelected] = useState(0);
  const paused = useRef(false);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    const onPointerDown = () => {
      paused.current = true;
    };
    emblaApi.on("pointerDown", onPointerDown);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
      emblaApi.off("pointerDown", onPointerDown);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    const id = window.setInterval(() => {
      if (!paused.current) emblaApi.scrollNext();
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [emblaApi]);

  return (
    <section className="relative border-y border-border/60 bg-surface-2/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
            {hw.badge}
          </span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {hw.title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{hw.subtitle}</p>
        </div>

        <div
          className="mt-8"
          onMouseEnter={() => (paused.current = true)}
          onMouseLeave={() => (paused.current = false)}
          onTouchStart={() => (paused.current = true)}
        >
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {hw.steps.map((step, i) => {
                const Icon = ICONS[i] ?? ListPlus;
                return (
                  <div
                    key={step.title}
                    className="min-w-0 shrink-0 grow-0 basis-[86%] pl-3 first:pl-0 sm:basis-1/3"
                  >
                    <article
                      className={`h-full rounded-2xl border bg-surface p-5 shadow-soft transition-all duration-300 ${
                        selected === i
                          ? "border-primary/40 shadow-card"
                          : "border-border opacity-80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
                          <Icon className="h-4 w-4" strokeWidth={2.25} />
                        </span>
                        <span className="text-3xl font-bold leading-none tracking-tight text-accent/80">
                          {i + 1}
                        </span>
                      </div>
                      <h3 className="mt-3 text-base font-semibold tracking-tight text-foreground">
                        {step.title}
                      </h3>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                        {step.body}
                      </p>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2">
            {hw.steps.map((step, i) => (
              <button
                key={step.title}
                type="button"
                aria-label={`${hw.stepLabel} ${i + 1}`}
                aria-current={selected === i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  selected === i ? "w-6 bg-primary" : "w-2 bg-border hover:bg-primary/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
