import { useEffect, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { GraduationCap, Mail, X, Loader2, ShieldCheck } from "lucide-react";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { closeAuthModal, useAuthModalOpen } from "@/lib/auth-store";

type View = "root" | "google-consent" | "email";

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

  async function handleGoogleAllow() {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: typeof window !== "undefined" ? window.location.origin : undefined,
      });
      if (result.error) {
        toast.error("Sign in failed. Please try again.");
        setBusy(false);
        return;
      }
      if (result.redirected) return;
      toast.success("Signed in with Google");
      closeAuthModal();
    } catch {
      toast.error("Something went wrong");
    } finally {
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

        {view === "root" && <RootView onGoogle={() => setView("google-consent")} onEmail={() => setView("email")} />}
        {view === "google-consent" && (
          <GoogleConsent busy={busy} onAllow={handleGoogleAllow} onCancel={() => setView("root")} />
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
}

function RootView({ onGoogle, onEmail }: { onGoogle: () => void; onEmail: () => void }) {
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
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm font-semibold text-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
        >
          <GoogleLogo />
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

function GoogleConsent({ busy, onAllow, onCancel }: { busy: boolean; onAllow: () => void; onCancel: () => void }) {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-center gap-2">
        <GoogleLogo className="h-6 w-6" />
        <span className="text-[13px] font-medium text-muted-foreground">Sign in with Google</span>
      </div>
      <h3 className="mt-5 text-center text-xl font-semibold text-foreground">
        MUST Market wants to access your Google information
      </h3>
      <div className="mt-5 space-y-2.5 rounded-2xl border border-border bg-surface-2 p-4 text-sm">
        <Row icon="✉️" text="Your name and email address" />
        <Row icon="🖼️" text="Your public profile picture" />
      </div>
      <p className="mt-4 flex items-start gap-2 text-[12px] text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        We never post to Google on your behalf. You can revoke access anytime.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={onCancel}
          disabled={busy}
          className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground hover:bg-surface-2"
        >
          Cancel
        </button>
        <button
          onClick={onAllow}
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:-translate-y-0.5 transition-transform disabled:opacity-70"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Allow
        </button>
      </div>
    </div>
  );
}

function Row({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-base">{icon}</span>
      <span className="text-foreground">{text}</span>
    </div>
  );
}

function EmailView({ onBack }: { onBack: () => void }) {
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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      }
      closeAuthModal();
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
