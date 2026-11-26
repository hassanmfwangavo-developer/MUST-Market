import { describe, expect, it } from "vitest";
import { optimizedMenuPhotos } from "./optimized-menu-photos";
import { menuPhotoUrl } from "./menu-photo";

describe("optimized food photos", () => {
  it("reuses an optimized copy regardless of signed URL token renewal", () => {
    const entry = Object.entries(optimizedMenuPhotos)[0];
    if (!entry) throw new Error("Missing optimized photos");
    const [path, optimized] = entry;
    expect(menuPhotoUrl(`https://storage.example${path}?token=renewed`)).toBe(optimized);
  });
  it("keeps new uploads visible instead of using an old dish photo", () => {
    const fresh = "https://storage.example/storage/v1/object/sign/product-images/new-photo.webp";
    expect(menuPhotoUrl(fresh)).toBe(fresh);
  });
  it("preserves absent and relative photos", () => {
    expect(menuPhotoUrl(null)).toBeNull();
    expect(menuPhotoUrl("/food.webp")).toBe("/food.webp");
  });
});