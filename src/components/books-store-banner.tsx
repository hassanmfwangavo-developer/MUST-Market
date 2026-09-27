import { ArrowUpRight } from "lucide-react";
import booksImage from "@/assets/books-store.jpg";
import { BOOKS24_URL } from "@/lib/site";

/** Professional bookstore partner card shown at the top of /market. */
export function BooksStoreBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <a
        href={BOOKS24_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group block overflow-hidden rounded-2xl border border-border bg-surface shadow-lift transition-transform hover:-translate-y-0.5"
      >
        <div className="flex flex-col-reverse sm:flex-row sm:items-stretch">
          <div className="flex min-w-0 flex-1 flex-col justify-center p-6 sm:p-10">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              Official Book Partner
            </span>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              MUST Books Store
            </h2>
            <p className="mt-2 max-w-md text-sm italic text-muted-foreground sm:text-base">
              &ldquo;The more you read, the more you realize how little you know&rdquo;
            </p>
            <span className="btn-shine mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lift transition-transform group-hover:-translate-y-0.5">
              Explore Books
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
            </span>
          </div>
          <div className="relative h-44 shrink-0 overflow-hidden sm:h-auto sm:w-[38%]">
            <img
              src={booksImage}
              alt="Featured hardcover titles available at MUST Books Store"
              loading="lazy"
              decoding="async"
              width={992}
              height={672}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </a>
    </section>
  );
}
