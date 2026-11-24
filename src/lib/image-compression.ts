import { ALLOWED_IMAGE_TYPES } from "./uploads";

export const IMAGE_MAX_WIDTH = 1000;
export const IMAGE_WEBP_QUALITY = 0.75;
export const IMAGE_MAX_BYTES = 200_000;

/** Browser-only work is deferred until a user selects or uploads a photo. */
export async function compressUploadImage(file: File): Promise<File> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Only JPEG, PNG, WebP or GIF images are allowed.");
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read this photo. Please choose another image."));
      img.src = url;
    });
    if (!image.naturalWidth || !image.naturalHeight) throw new Error("This image has invalid dimensions.");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image compression is unavailable in this browser.");

    const scale = Math.min(1, IMAGE_MAX_WIDTH / image.naturalWidth);
    let width = Math.max(1, Math.floor(image.naturalWidth * scale));
    let height = Math.max(1, Math.floor(image.naturalHeight * scale));
    // Preserve 75% quality; shrink further only when the size limit requires it.
    while (true) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, width, height);
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/webp", IMAGE_WEBP_QUALITY);
      });
      if (!blob || blob.type !== "image/webp") {
        throw new Error("This browser cannot create WebP images. Please use an updated browser.");
      }
      if (blob.size < IMAGE_MAX_BYTES) {
        return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "photo"}.webp`, {
          type: "image/webp",
          lastModified: file.lastModified,
        });
      }
      if (width === 1 && height === 1) throw new Error("Could not compress this photo below 200KB.");
      width = Math.max(1, Math.floor(width * 0.8));
      height = Math.max(1, Math.floor(height * 0.8));
    }
  } finally {
    URL.revokeObjectURL(url);
  }
}