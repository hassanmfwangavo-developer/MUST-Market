import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import booksImage from "@/assets/books-store.jpg";
import readingImage from "@/assets/books-banner-reading.jpg";
import libraryImage from "@/assets/books-banner-library.jpg";
import { BOOKS24_URL } from "@/lib/site";
import { BOOKS_BANNER_QUERY_KEY, fetchBooksBanners } from "@/lib/books-banners";
import { Button } from "@/components/ui/button";

const fallbackImages = [booksImage, readingImage, libraryImage];

export function BooksStoreBanner() {
  const { data: banners = [] } = useQuery({
    queryKey: BOOKS_BANNER_QUERY_KEY,
    queryFn: fetchBooksBanners,
    staleTime: 30_000,
  });
  const images = banners.length ? banners.map((banner) => banner.image_url) : fallbackImages;
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || images.length < 2) return;
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % images.length), 5000);
    return () => window.clearInterval(timer);
  }, [images.length, paused]);

  const active = slide % images.length;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="MUST Books Store banners"
        className="relative isolate h-72 overflow-hidden rounded-lg bg-foreground shadow-lift sm:h-80 lg:h-96"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
        }}
      >
        {images.map((image, index) => (
          <img
            key={image}
            src={image}
            alt={banners.length ? `Books Store banner ${index + 1}` : "Curated display of books"}
            width={1600}
            height={800}
            loading={index === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 motion-reduce:transition-none ${index === active ? "opacity-100" : "opacity-0"}`}
            aria-hidden={index !== active}
          />
        ))}
        <div className="absolute inset-0 bg-[image:var(--banner-shade)]" aria-hidden="true" />
        <div className="banner-text-legible relative flex h-full flex-col justify-center px-6 pb-9 pt-5 text-banner-foreground sm:px-12 lg:px-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-banner-foreground/80">Official Book Partner</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl lg:text-5xl">MUST Books Store</h2>
          <p className="mt-3 max-w-md text-sm italic leading-relaxed text-banner-foreground/90 sm:text-base">
            &ldquo;The more you read, the more you realize how little you know&rdquo;
          </p>
          <Button asChild className="mt-6 h-11 w-fit rounded-md bg-accent px-6 font-bold text-accent-foreground hover:bg-accent/90">
            <a href={BOOKS24_URL} target="_blank" rel="noopener noreferrer">
              Explore Books
              <ArrowUpRight aria-hidden="true" />
            </a>
          </Button>
        </div>
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2" aria-label="Choose banner slide">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-banner-foreground hover:bg-banner-foreground/20 hover:text-banner-foreground" aria-label="Previous banner" onClick={() => setSlide((active - 1 + images.length) % images.length)}>
              <ChevronLeft />
            </Button>
            {images.map((_, index) => (
              <Button key={index} variant="ghost" size="icon" aria-label={`Show banner ${index + 1}`} aria-current={index === active ? "true" : undefined} onClick={() => setSlide(index)} className="h-8 w-8 hover:bg-banner-foreground/20">
                <span className={`h-2 w-2 rounded-full ${index === active ? "bg-accent" : "bg-banner-foreground/70"}`} />
              </Button>
            ))}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-banner-foreground hover:bg-banner-foreground/20 hover:text-banner-foreground" aria-label="Next banner" onClick={() => setSlide((active + 1) % images.length)}>
              <ChevronRight />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
