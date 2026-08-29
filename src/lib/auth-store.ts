import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { claimReferral } from "@/lib/rewards.functions";
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

if (typeof window !== "undefined") {
  captureReferralFromUrl();
  supabase.auth.getUser().then(({ data }) => {
    // Treat anonymous users as "not signed in" for dashboard purposes.
    user = data.user && !data.user.is_anonymous ? data.user : null;
    initialized = true;
    emitUser();
  });
  supabase.auth.onAuthStateChange((event, session) => {
    const u = session?.user;
    user = u && !u.is_anonymous ? u : null;
    initialized = true;
    emitUser();
    if (event === "SIGNED_IN" && user) {
      void upsertProfile(user);
      // Attribute a pending referral link (?ref=) to this account — first claim wins.
      const ref = getStoredReferral();
      if (ref) {
        void claimReferral({ data: { inviterId: ref } })
          .then((r) => {
            if (r.claimed) clearStoredReferral();
          })
          .catch(() => {
            /* retry on next sign-in */
          });
      }
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
