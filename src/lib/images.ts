/**
 * Image URL helpers.
 *
 * Product photos live in Supabase Storage and are stored as long-lived signed
 * URLs (`/storage/v1/object/sign/...`). Storage exposes an on-the-fly image
 * transformer at `/storage/v1/render/image/sign/...` which accepts width,
 * height, quality and resize params — so we can serve small, compressed
 * thumbnails to the grid instead of multi-megabyte originals.
 */

export interface ImageTransform {
  width?: number;
  height?: number;
  quality?: number;
  resize?: "cover" | "contain" | "fill";
}

const SIGN_PATH = "/storage/v1/object/sign/";
const RENDER_PATH = "/storage/v1/render/image/sign/";
const PUBLIC_PATH = "/storage/v1/object/public/";
const RENDER_PUBLIC_PATH = "/storage/v1/render/image/public/";

/** Returns a transformed (resized + compressed) variant of a storage image. */
export function transformImage(src: string | undefined, opts: ImageTransform = {}): string {
  if (!src) return "";
  const isSigned = src.includes(SIGN_PATH);
  const isPublic = src.includes(PUBLIC_PATH);
  if (!isSigned && !isPublic) return src;

  const rendered = isSigned
    ? src.replace(SIGN_PATH, RENDER_PATH)
    : src.replace(PUBLIC_PATH, RENDER_PUBLIC_PATH);

  const [base, search = ""] = rendered.split("?");
  const params = new URLSearchParams(search);
  const { width = 400, quality = 75, resize = "cover", height } = opts;
  params.set("width", String(width));
  if (height) params.set("height", String(height));
  params.set("quality", String(quality));
  params.set("resize", resize);
  return `${base}?${params.toString()}`;
}

/** Small card/grid thumbnail. */
export const thumbUrl = (src?: string) => transformImage(src, { width: 400, quality: 75 });

/** Larger detail-page image. */
export const detailUrl = (src?: string) => transformImage(src, { width: 1000, quality: 80 });

/** Tiny thumbnail strip / avatar sized image. */
export const microUrl = (src?: string) => transformImage(src, { width: 160, quality: 70 });

/** Responsive srcSet for a storage image at the given widths. */
export function imageSrcSet(src: string | undefined, widths: number[], quality = 75): string {
  if (!src) return "";
  return widths
    .map((w) => `${transformImage(src, { width: w, quality })} ${w}w`)
    .join(", ");
}
