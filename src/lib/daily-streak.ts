export const STREAK_STORAGE_KEY = "mm_streak_last_date";

/** Browser-only optimization; the server remains authoritative for rewards. */
export function createDailyStreakGuard() {
  const completed = new Set<string>();
  const pending = new Set<string>();
  return async (userId: string, touch: () => Promise<unknown>, storage?: Pick<Storage, "getItem" | "setItem">, now = new Date()) => {
    // Match the existing server's UTC calendar, not the device's timezone.
    const day = now.toISOString().slice(0, 10);
    const key = `${STREAK_STORAGE_KEY}:${userId}`;
    const attempt = `${userId}:${day}`;
    if (completed.has(attempt) || pending.has(attempt)) return;
    try {
      if (storage?.getItem(key) === day) return;
    } catch { /* Restricted storage: use the in-memory guard. */ }
    pending.add(attempt);
    try {
      await touch();
      completed.add(attempt);
      try { storage?.setItem(key, day); } catch { /* Keep the in-memory guard. */ }
    } finally {
      // Failed requests are not recorded, so a later session load can retry.
      pending.delete(attempt);
    }
  };
}