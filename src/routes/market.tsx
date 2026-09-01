import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { MarketHome } from "@/components/market-home";
import { HowItWorks } from "@/components/how-it-works";
import { Testimonials } from "@/components/testimonials";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/market")({
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
      { property: "og:url", content: "https://must-campus-swap.lovable.app/market" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
        <MarketHome />
        <HowItWorks />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
