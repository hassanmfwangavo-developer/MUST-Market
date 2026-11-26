import { describe, expect, it } from "vitest";
import { menuWindow } from "./menu-window";

describe("Msosi cached menu window", () => {
  const dishes = Array.from({ length: 43 }, (_, i) => i + 1);
  it("shows twelve dishes initially in their existing order", () => {
    expect(menuWindow(dishes, 1)).toEqual(Array.from({ length: 12 }, (_, i) => i + 1));
  });
  it("reveals the next twelve without losing earlier dishes", () => {
    expect(menuWindow(dishes, 2)).toEqual(Array.from({ length: 24 }, (_, i) => i + 1));
  });
  it("can reveal all dishes, including the last partial page", () => {
    expect(menuWindow(dishes, 4)).toEqual(dishes);
  });
  it("windows filtered results rather than hiding later matches", () => {
    expect(menuWindow(dishes.filter((id) => id > 30), 1)).toEqual(Array.from({ length: 12 }, (_, i) => i + 31));
  });
});