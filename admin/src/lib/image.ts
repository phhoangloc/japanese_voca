/** Image helpers for the upload box (FR-7) and rich text editor (FR-8). */

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|bmp|svg)$/i;

/** True when a File looks like an image (by MIME type, falling back to extension). */
export function isImage(file: Pick<File, "type" | "name">): boolean {
  if (file.type) return file.type.startsWith("image/");
  return IMAGE_EXT_RE.test(file.name ?? "");
}

export interface DownscaleOptions {
  /** Longest edge of the output, in pixels. */
  maxEdge?: number;
  /** JPEG quality 0..1 (used when the source is not PNG/GIF/SVG). */
  quality?: number;
}

/**
 * Read an image File and return a `data:` URL, downscaled so its longest edge is
 * at most `maxEdge` px. Keeps the encoded string small enough for the backend
 * `file.detail` TEXT column. Browser only.
 */
export async function fileToDownscaledDataUrl(
  file: File,
  { maxEdge = 512, quality = 0.85 }: DownscaleOptions = {},
): Promise<string> {
  if (!isImage(file)) throw new Error("Selected file is not an image");

  const original = await readAsDataUrl(file);

  // SVGs and tiny files: keep as-is, nothing to rasterise.
  if (file.type === "image/svg+xml") return original;

  const img = await loadImage(original);
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  if (scale === 1) return original;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return original;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const keepPng = file.type === "image/png" || file.type === "image/gif";
  return canvas.toDataURL(keepPng ? "image/png" : "image/jpeg", quality);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to decode image"));
    img.src = src;
  });
}
