import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { MarketHome } from "@/components/market-home";
import { ProductShelves } from "@/components/product-shelves";
import { ServiceMallBanner } from "@/components/service-mall-banner";
import { HowItWorks } from "@/components/how-it-works";
import { Testimonials } from "@/components/testimonials";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";
import { ArrowUpRight } from "lucide-react";
import { BOOKS24_URL, canonical, MARKET_CATEGORY_PAGES, type MarketCategorySlug } from "@/lib/site";

export const Route = createFileRoute("/market/")({
  head: () => ({
    meta: [
      { title: "MUST Market — Student Marketplace | Buy & Sell Used Items" },
      {
        name: "description",
        content:
          "The peer-to-peer marketplace for Mbeya University of Science and Technology students. Buy and sell laptops, books, hostel gear and more — instantly, via WhatsApp.",
      },
      { property: "og:title", content: "MUST Market — Student Marketplace at Mbeya University" },
      {
        property: "og:description",
        content: "Buy and sell used student gear at MUST instantly.",
      },
      { property: "og:url", content: canonical("/market") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonical("/market") }],
  }),
  component: Market,
});

function Market() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <MarketHome />
        <ServiceMallBanner />
        <ProductShelves />

        {/* Crawlable links to the permanent category pages */}
        <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Browse by category
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(Object.keys(MARKET_CATEGORY_PAGES) as MarketCategorySlug[]).map((slug) =>
              slug === "books-stationery" ? (
                <a
                  key={slug}
                  href={BOOKS24_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
                >
                  {MARKET_CATEGORY_PAGES[slug].heading} <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ) : (
              <Link
                key={slug}
                to={MARKET_CATEGORY_PAGES[slug].path}
                className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
              >
                {MARKET_CATEGORY_PAGES[slug].heading}
              </Link>
              ),
            )}
          </div>
        </section>

        <HowItWorks />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
