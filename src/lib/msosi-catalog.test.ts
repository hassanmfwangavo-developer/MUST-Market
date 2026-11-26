import { describe, expect, it } from "vitest";
import { menuRevealLimit, MSOSI_PAGE_SIZE } from "./msosi-catalog";

describe("Msosi reveal batches", () => {
  it("starts with 12 dishes", () => {
    expect(MSOSI_PAGE_SIZE).toBe(12);
    expect(menuRevealLimit(undefined)).toBe(12);
  });
  it("reveals the next 12 without increasing catalog requests", () => {
    expect(menuRevealLimit(12 + MSOSI_PAGE_SIZE)).toBe(24);
    expect(menuRevealLimit(24 + MSOSI_PAGE_SIZE)).toBe(36);
  });
  it("rejects partial, negative and invalid batches", () => {
    for (const value of [0, -12, 13, 12.5, "bad", Infinity]) expect(menuRevealLimit(value)).toBe(12);
  });
});