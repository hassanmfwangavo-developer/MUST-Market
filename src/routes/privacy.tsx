import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArrowLeft } from "lucide-react";

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
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: July 2026</p>

        <div className="mt-8 space-y-6">
          <Section title="What we collect">
            When you sign in, we store your email and (for Google sign-in) your name and profile
            picture. When you post a listing, we store its content and your WhatsApp number so
            buyers can contact you.
          </Section>
          <Section title="How we use it">
            To display your listings, connect buyers to sellers via WhatsApp, and keep the
            marketplace safe. We never sell your personal information.
          </Section>
          <Section title="What buyers see">
            Buyers see the listing content and your WhatsApp number. They never see your email or
            account details.
          </Section>
          <Section title="Deleting your data">
            Delete a listing anytime from your dashboard. Contact us to delete your account and all
            associated data.
          </Section>
          <Section title="Cookies & analytics">
            We use only essential cookies to keep you signed in. No third-party ad tracking.
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
