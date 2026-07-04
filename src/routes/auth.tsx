import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

type Search = { next?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — MUST Market" },
      { name: "description", content: "Sign in with Google to list items on MUST Market." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = useSearch({ from: "/auth" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: (next as "/sell") ?? "/sell" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: (next as "/sell") ?? "/sell" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, next]);

  async function signIn() {
    if (loading) return;
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/auth" + (next ? `?next=${encodeURIComponent(next)}` : ""),
      });
      if (result.error) throw result.error;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign in failed");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <div className="mt-8 rounded-3xl border border-border bg-surface p-8 shadow-soft text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
            <ShoppingBag className="h-6 w-6" strokeWidth={2.5} />
          </span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">Sign in to sell</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Browsing is free for everyone. Sign in with Google to list your items.
          </p>
          <button
            onClick={signIn}
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full border border-border bg-surface-2 px-5 py-3 text-sm font-semibold text-foreground shadow-soft transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
              </svg>
            )}
            Continue with Google
          </button>
        </div>
      </main>
    </div>
  );
}
