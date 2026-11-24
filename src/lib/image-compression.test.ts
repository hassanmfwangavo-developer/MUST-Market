import { afterEach, describe, expect, it, vi } from "vitest";
import { compressUploadImage } from "./image-compression";

function mockBrowser(width: number, height: number, sizes = [1000], type = "image/webp") {
  const encoded: { width: number; height: number; type: string; quality: number }[] = [];
  const revoke = vi.fn();
  class MockImage {
    naturalWidth = width;
    naturalHeight = height;
    onload: (() => void) | null = null;
    set src(_url: string) { this.onload?.(); }
  }
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({ drawImage: vi.fn() }),
    toBlob: (callback: (blob: Blob) => void, mime: string, quality: number) => {
      encoded.push({ width: canvas.width, height: canvas.height, type: mime, quality });
      callback(new Blob([new Uint8Array(sizes.shift() ?? 1000)], { type }));
    },
  };
  vi.stubGlobal("Image", MockImage);
  vi.stubGlobal("document", { createElement: () => canvas });
  vi.stubGlobal("URL", { createObjectURL: () => "blob:test", revokeObjectURL: revoke });
  return { encoded, revoke };
}

afterEach(() => vi.unstubAllGlobals());

describe("upload image compression", () => {
  it("limits width to 1000px while preserving the image proportions", async () => {
    const { encoded } = mockBrowser(2400, 1200);
    await compressUploadImage(new File(["photo"], "photo.jpg", { type: "image/jpeg" }));
    expect(encoded[0]).toMatchObject({ width: 1000, height: 500 });
  });

  it("converts even small input files to WebP at exactly 75% quality", async () => {
    const { encoded } = mockBrowser(400, 300);
    const output = await compressUploadImage(new File(["small"], "photo.png", { type: "image/png" }));
    expect(output.type).toBe("image/webp");
    expect(output.name).toBe("photo.webp");
    expect(encoded[0]).toEqual({ width: 400, height: 300, type: "image/webp", quality: 0.75 });
  });

  it("shrinks further until strictly under 200KB without reducing quality", async () => {
    const { encoded } = mockBrowser(2000, 1000, [300000, 200000, 199999]);
    const output = await compressUploadImage(new File(["photo"], "photo.jpg", { type: "image/jpeg" }));
    expect(output.size).toBe(199999);
    expect(encoded.map((item) => item.width)).toEqual([1000, 800, 640]);
    expect(encoded.map((item) => item.quality)).toEqual([0.75, 0.75, 0.75]);
  });

  it("rejects non-WebP browser fallback rather than uploading an uncompressed original", async () => {
    const { revoke } = mockBrowser(400, 300, [1000], "image/png");
    await expect(compressUploadImage(new File(["photo"], "photo.png", { type: "image/png" })))
      .rejects.toThrow("cannot create WebP");
    expect(revoke).toHaveBeenCalledWith("blob:test");
  });
});