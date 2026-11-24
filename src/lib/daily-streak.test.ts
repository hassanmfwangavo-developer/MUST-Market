import { describe, expect, it, vi } from "vitest";
import { createDailyStreakGuard } from "./daily-streak";

const today = new Date("2026-11-24T19:47:00Z");
function memoryStorage() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}

describe("daily per-user login streak cache", () => {
  it("runs once on November 24 and persists across browser reloads", async () => {
    const storage = memoryStorage();
    const touch = vi.fn().mockResolvedValue({ increased: true });
    const guard = createDailyStreakGuard();
    await guard("student-a", touch, storage, today);
    await guard("student-a", touch, storage, today);
    await createDailyStreakGuard()("student-a", touch, storage, today);
    expect(touch).toHaveBeenCalledTimes(1);
    expect(storage.getItem("mm_streak_last_date:student-a")).toBe("2026-11-24");
  });
  it("keeps students separate when accounts switch", async () => {
    const guard = createDailyStreakGuard();
    const touch = vi.fn().mockResolvedValue({});
    const storage = memoryStorage();
    await guard("student-a", touch, storage, today);
    await guard("student-b", touch, storage, today);
    await guard("student-a", touch, storage, today);
    expect(touch).toHaveBeenCalledTimes(2);
    expect(storage.getItem("mm_streak_last_date:student-b")).toBe("2026-11-24");
  });
  it("runs again on the next UTC day", async () => {
    const guard = createDailyStreakGuard();
    const touch = vi.fn().mockResolvedValue({});
    const storage = memoryStorage();
    await guard("student-a", touch, storage, today);
    await guard("student-a", touch, storage, new Date("2026-11-25T00:00:00Z"));
    expect(touch).toHaveBeenCalledTimes(2);
    expect(storage.getItem("mm_streak_last_date:student-a")).toBe("2026-11-25");
  });
  it("coalesces concurrent calls and retries failures without stamping the date", async () => {
    const guard = createDailyStreakGuard();
    const storage = memoryStorage();
    const touch = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue({});
    const first = guard("student-a", touch, storage, today);
    await guard("student-a", touch, storage, today);
    await expect(first).rejects.toThrow("offline");
    expect(storage.getItem("mm_streak_last_date:student-a")).toBeNull();
    await guard("student-a", touch, storage, today);
    expect(touch).toHaveBeenCalledTimes(2);
  });
  it("still avoids duplicate touches if private browsing blocks storage", async () => {
    const guard = createDailyStreakGuard();
    const touch = vi.fn().mockResolvedValue({});
    const storage = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
    await guard("student-a", touch, storage, today);
    await guard("student-a", touch, storage, today);
    expect(touch).toHaveBeenCalledTimes(1);
  });
});