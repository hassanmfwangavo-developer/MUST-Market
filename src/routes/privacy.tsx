import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArrowLeft, Lock, EyeOff } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — MUST Market" },
      {
        name: "description",
        content: "How MUST Market collects, uses, and protects your information.",
      },
      { property: "og:title", content: "Privacy Policy — MUST Market" },
      {
        property: "og:description",
        content: "How MUST Market collects, uses, and protects your information.",
      },
      { property: "og:url", content: "https://www.mustmarket.store/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://www.mustmarket.store/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <Link
          to="/market"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Homepage
        </Link>
        <div className="mt-6 flex items-center gap-3">
          <Lock className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Privacy Policy
          </h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: August 2026</p>

        <div className="mt-8 space-y-6">
          <Section title="1. Information We Collect">
            <p className="text-sm leading-relaxed text-muted-foreground">
              To facilitate campus trade, we collect the following details:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Account Information:</span> Your name
                and email address upon registration.
              </li>
              <li>
                <span className="font-medium text-foreground">Listing Information:</span> WhatsApp
                phone number, product photos, campus pickup location (e.g., Block, Cafeteria), and
                item descriptions.
              </li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            Your details are used exclusively to enable buyers to reach out directly via WhatsApp
            or phone call for transactions. We do not sell or distribute your personal data to
            third-party ad networks.
          </Section>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
            <div className="flex items-start gap-3">
              <EyeOff className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold text-blue-900">
                  3. Phone Number & Data Privacy
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-blue-800">
                  Your phone number is visible on active listings to enable buyer contact. Once you
                  delete or mark an item as &quot;Sold&quot;, your phone number is instantly hidden from
                  search results.
                </p>
              </div>
            </div>
          </div>

          <Section title="4. Your Data Rights">
            You maintain full control to edit, update, or permanently delete your listings and
            personal data anytime through your Seller Dashboard.
          </Section>

          <Section title="5. Contact Us">
            If you have any questions or privacy concerns regarding MUST Market, please contact our
            support team through the contact page.
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
