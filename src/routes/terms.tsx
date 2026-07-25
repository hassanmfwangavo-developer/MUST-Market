import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — MUST Market" },
      {
        name: "description",
        content: "The rules that keep MUST Market safe, honest, and student-first.",
      },
      { property: "og:title", content: "Terms of Service — MUST Market" },
      {
        property: "og:description",
        content: "The rules that keep MUST Market safe, honest, and student-first.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: July 2026</p>

        <div className="prose prose-sm mt-8 max-w-none space-y-6 text-foreground">
          <Section title="1. Who can use MUST Market">
            You must be a current Mbeya University of Science and Technology student, staff member,
            or invited guest to post listings. Buyers can be anyone connected to the MUST community.
          </Section>
          <Section title="2. What you can sell">
            Only lawful, personal, second-hand items you own — laptops, books, hostel gear, small
            electronics. No counterfeit goods, no bulk commercial products, no clothing resale, no
            restricted or dangerous items.
          </Section>
          <Section title="3. Honest listings">
            Titles, descriptions, photos, and prices must reflect the real item. Misleading listings
            are removed and the account may be banned.
          </Section>
          <Section title="4. Safe meetups">
            All trades happen in person at safe, public spots — the Library, Academic Blocks, or a
            busy area near the hostels. Never share OTPs, never send money before inspecting an
            item.
          </Section>
          <Section title="5. Content ownership">
            You keep ownership of your photos and text. By posting, you grant MUST Market a limited
            license to display them on the marketplace.
          </Section>
          <Section title="6. Account termination">
            We may remove listings or suspend accounts that break these rules, at our discretion, to
            keep the community safe.
          </Section>
          <Section title="7. Changes">
            We may update these terms as the platform grows. Material changes will be announced on
            the homepage.
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}
