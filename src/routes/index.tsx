import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { ProductGrid } from "@/components/product-grid";
import { Testimonials } from "@/components/testimonials";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MUST Market — Buy & Sell Used Student Gear at Mbeya University" },
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
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <ProductGrid />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
