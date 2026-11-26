import { optimizedMenuPhotos } from "./optimized-menu-photos";

/** Match the immutable object path, never the signed token or the dish ID. */
export function menuPhotoUrl(src: string | null): string | null {
  if (!src) return src;
  try {
    return optimizedMenuPhotos[new URL(src).pathname] ?? src;
  } catch {
    return src;
  }
}