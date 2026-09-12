import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { claimReferral, touchLoginStreak } from "@/lib/rewards.functions";
import { syncBrevoContact } from "@/lib/brevo.functions";
import { captureReferralFromUrl, clearStoredReferral, getStoredReferral } from "@/lib/referral";

let open = false;
let pendingRedirect: string | null = null;
const openListeners = new Set<() => void>();

export function openAuthModal(redirectTo?: string) {
  open = true;
  if (redirectTo) pendingRedirect = redirectTo;
  openListeners.forEach((l) => l());
}
export function closeAuthModal() {
  open = false;
  openListeners.forEach((l) => l());
}
export function consumePendingRedirect(): string | null {
  const r = pendingRedirect;
  pendingRedirect = null;
  return r;
}
export function useAuthModalOpen() {
  return useSyncExternalStore(
    (cb) => {
      openListeners.add(cb);
      return () => openListeners.delete(cb);
    },
    () => open,
    () => false,
  );
}

let user: User | null = null;
let initialized = false;
const userListeners = new Set<() => void>();

function emitUser() {
  userListeners.forEach((l) => l());
}

/** Capture every signed-in user into profiles (email marketing pipeline). */
async function upsertProfile(u: User) {
  const meta = u.user_metadata ?? {};
  await supabase.from("profiles").upsert(
    {
      id: u.id,
      email: u.email ?? null,
      full_name: meta.full_name || meta.name || "",
      avatar_url: meta.avatar_url || meta.picture || "",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
}

/** Attribute a stored referral link (?ref=) to the signed-in account — first claim wins. */
function tryClaimReferral() {
  const ref = getStoredReferral();
  if (!ref) return;
  void claimReferral({ data: { inviterId: ref } })
    .then((r) => {
      if (r.claimed) clearStoredReferral();
    })
    .catch(() => {
      /* retry on next sign-in */
    });
}

/** Daily login streak — safe to call on every session load (same-day = no-op). */
let streakTouched = false;
function tryTouchStreak() {
  if (streakTouched) return;
  streakTouched = true;
  void touchLoginStreak({ data: undefined }).catch(() => {
    streakTouched = false;
  });
}

/** Brevo contact sync — fire-and-forget, once per user per browser (Brevo updateEnabled makes repeats safe). */
const BREVO_SYNC_KEY = "mm_brevo_synced";
function trySyncBrevo(u: User) {
  try {
    if (localStorage.getItem(BREVO_SYNC_KEY) === u.id) return;
  } catch {
    /* private mode — still attempt sync */
  }
  void syncBrevoContact({ data: undefined })
    .then((r) => {
      if (r.ok) {
        try {
          localStorage.setItem(BREVO_SYNC_KEY, u.id);
        } catch {
          /* ignore */
        }
      }
    })
    .catch(() => {
      /* retry on next sign-in */
    });
}

if (typeof window !== "undefined") {
  captureReferralFromUrl();
  supabase.auth.getUser().then(({ data }) => {
    // Treat anonymous users as "not signed in" for dashboard purposes.
    user = data.user && !data.user.is_anonymous ? data.user : null;
    initialized = true;
    emitUser();
    // Already-signed-in visitor arriving via a referral link.
    if (user) {
      tryClaimReferral();
      tryTouchStreak();
      trySyncBrevo(user);
    }
  });
  supabase.auth.onAuthStateChange((event, session) => {
    const u = session?.user;
    user = u && !u.is_anonymous ? u : null;
    initialized = true;
    emitUser();
    if (event === "SIGNED_IN" && user) {
      void upsertProfile(user);
      tryClaimReferral();
      tryTouchStreak();
      trySyncBrevo(user);
    }
  });
}

export function useAuthUser() {
  const u = useSyncExternalStore(
    (cb) => {
      userListeners.add(cb);
      return () => userListeners.delete(cb);
    },
    () => user,
    () => null,
  );
  return { user: u, initialized };
}
