import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArrowLeft, FileText, AlertCircle } from "lucide-react";

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
          <ArrowLeft className="h-4 w-4" /> Back to Homepage
        </Link>
        <div className="mt-6 flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Terms of Service
          </h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: August 2026</p>

        <div className="mt-8 space-y-6">
          <Section title="1. Platform Identity & Purpose">
            MUST Market is a digital platform connecting students and the community at Mbeya
            University of Science and Technology (MUST) to trade goods and services conveniently.
            MUST Market acts solely as a venue and does not own or directly sell any listed items.
          </Section>

          <Section title="2. Seller Responsibilities">
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>
                Sellers must provide accurate information, genuine photos, and correct pricing for
                all listings.
              </li>
              <li>
                Posting illegal items, explosives, narcotics, weapons, or any items violating Mbeya
                University of Science and Technology (MUST) regulations and the laws of the United
                Republic of Tanzania is strictly prohibited.
              </li>
              <li>
                Sellers must update their listing status to &quot;Sold&quot; as soon as a transaction is
                completed to maintain platform transparency.
              </li>
            </ul>
          </Section>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <h2 className="text-lg font-semibold text-amber-900">
                  3. Transaction Safety & Guidelines
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-amber-800">
                  <span className="font-semibold">Safety Notice:</span> Students are strongly
                  advised to meet in well-lit, public campus areas (e.g., Cafeteria, Lecture Blocks,
                  or Library) to inspect items before making payments. Never transfer funds before
                  physically inspecting the product.
                </p>
              </div>
            </div>
          </div>

          <Section title="4. Limitation of Liability">
            MUST Market is not liable for financial disputes, product condition, or agreements made
            directly between buyers and sellers. All transactions are conducted at the discretion of
            both parties.
          </Section>

          <Section title="5. Governing Law">
            These terms are governed by and construed in accordance with the Laws of the United
            Republic of Tanzania and the Student By-Laws of Mbeya University of Science and
            Technology (MUST).
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
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}
