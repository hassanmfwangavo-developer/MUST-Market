import { describe, expect, it } from "vitest";
import { formatOrderStamp } from "./order-stamp";

describe("order card timestamp", () => {
  it("shows day, short month and 24h time in East Africa Time", () => {
    // 16:41 UTC on 27 Nov 2026 is 19:41 in Dar es Salaam.
    expect(formatOrderStamp("2026-11-27T16:41:00.000Z")).toBe("27 Nov, 19:41");
  });

  it("keeps the same clock for a device in another timezone", () => {
    const original = process.env.TZ;
    process.env.TZ = "America/Los_Angeles";
    try {
      expect(formatOrderStamp("2026-11-27T16:41:00.000Z")).toBe("27 Nov, 19:41");
    } finally {
      if (original === undefined) delete process.env.TZ;
      else process.env.TZ = original;
    }
  });

  it("renders a dash instead of Invalid Date for missing or broken stamps", () => {
    expect(formatOrderStamp(null)).toBe("—");
    expect(formatOrderStamp(undefined)).toBe("—");
    expect(formatOrderStamp("not-a-date")).toBe("—");
  });
});
