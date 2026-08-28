import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { ProductShelves } from "@/components/product-shelves";
import { Testimonials } from "@/components/testimonials";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "MUST Market — Buy & Sell Student Gear at MUST" },
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
      { property: "og:url", content: "https://must-campus-swap.lovable.app/market" },
    ],
    links: [{ rel: "canonical", href: "https://must-campus-swap.lovable.app/market" }],
  }),
  component: Market,
});

function Market() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <ProductShelves />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
