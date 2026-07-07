import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { GraduationCap, Mail, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { closeAuthModal, consumePendingRedirect, useAuthModalOpen } from "@/lib/auth-store";

type View = "root" | "email";

function GoogleLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export function AuthModal() {
  const isOpen = useAuthModalOpen();
  const [view, setView] = useState<View>("root");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) setView("root");
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleGoogle() {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin,},
      });
      if (error) {
        toast.error(error.message);
        setBusy(false);
      }
      // On success browser redirects to Google.
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        aria-label="Close"
        onClick={closeAuthModal}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in"
      />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-surface p-6 shadow-lift sm:rounded-3xl sm:p-8 animate-scale-in">
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {view === "root" && (
          <RootView busy={busy} onGoogle={handleGoogle} onEmail={() => setView("email")} />
        )}
        {view === "email" && <EmailView onBack={() => setView("root")} />}

        <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
          By continuing you agree to our{" "}
          <Link to="/terms" onClick={closeAuthModal} className="underline underline-offset-2 hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" onClick={closeAuthModal} className="underline underline-offset-2 hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );

  function RootView({ busy, onGoogle, onEmail }: { busy: boolean; onGoogle: () => void; onEmail: () => void }) {
    return (
      <>
        <div className="mx-auto mb-6 h-1.5 w-10 rounded-full bg-border sm:hidden" />
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Join MUST Market</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Sign in to post, save, and manage listings.</p>
        </div>
        <div className="mt-7 space-y-3">
          <button
            onClick={onGoogle}
            disabled={busy}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm font-semibold text-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card disabled:opacity-70"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleLogo />}
            Continue with Google
          </button>
          <button
            onClick={onEmail}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5"
          >
            <Mail className="h-5 w-5" strokeWidth={2.2} />
            Sign up with email
          </button>
          <button
            onClick={() => toast("🎓 Coming Soon", { description: "University ID sign-in launches next semester." })}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-surface-2 px-4 py-3.5 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40"
          >
            <GraduationCap className="h-5 w-5" strokeWidth={2.2} />
            Continue with University ID
          </button>
        </div>
      </>
    );
  }
}

function EmailView({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/dashboard" },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Account created! Check your email to confirm.");
          closeAuthModal();
          return;
        }
        toast.success("Welcome to MUST Market!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      }
      closeAuthModal();
      const dest = consumePendingRedirect() ?? "/dashboard";
      navigate({ to: dest });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="animate-fade-in">
      <button type="button" onClick={onBack} className="mb-3 text-xs font-medium text-muted-foreground hover:text-foreground">
        ← Back
      </button>
      <h3 className="text-xl font-semibold tracking-tight text-foreground">
        {mode === "signup" ? "Create your account" : "Welcome back"}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">Use your MUST or personal email.</p>
      <div className="mt-5 space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@must.ac.tz"
          className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-soft outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 6 characters)"
          className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-soft outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 disabled:opacity-70"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {mode === "signup" ? "Create account" : "Sign in"}
      </button>
      <button
        type="button"
        onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
        className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-foreground"
      >
        {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
      </button>
    </form>
  );
}
