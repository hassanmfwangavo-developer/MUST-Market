import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

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

if (typeof window !== "undefined") {
  supabase.auth.getUser().then(({ data }) => {
    // Treat anonymous users as "not signed in" for dashboard purposes.
    user = data.user && !data.user.is_anonymous ? data.user : null;
    initialized = true;
    emitUser();
  });
  supabase.auth.onAuthStateChange((_e, session) => {
    const u = session?.user;
    user = u && !u.is_anonymous ? u : null;
    initialized = true;
    emitUser();
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
