/** Image helpers for the upload box and the rich text editor. */

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|bmp|svg|avif)$/i;

/** True when a File looks like an image (by MIME type, falling back to extension). */
export function isImage(file: Pick<File, "type" | "name">): boolean {
  if (file.type) return file.type.startsWith("image/");
  return IMAGE_EXT_RE.test(file.name ?? "");
}
