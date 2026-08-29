const KEY = "mm_referral";

/** Stores a `?ref=<userId>` URL param so it survives until sign-up/sign-in. */
export function captureReferralFromUrl() {
  if (typeof window === "undefined") return;
  try {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref && /^[0-9a-f-]{36}$/i.test(ref)) {
      window.localStorage.setItem(KEY, ref);
    }
  } catch {
    /* storage unavailable */
  }
}

export function getStoredReferral(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function clearStoredReferral() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
}
