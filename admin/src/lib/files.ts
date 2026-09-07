import { API_BASE_URL } from "./api";

/**
 * Turn a `file.detail` value into a URL the browser can load.
 *
 * The backend stores an upload as a root-relative path (`/upload/<uuid>.png`)
 * served by the API host. Absolute URLs and legacy `data:` values are returned
 * unchanged.
 */
export function resolveFileUrl(
  detail: string | null | undefined,
): string | null {
  if (!detail) return null;
  if (/^(https?:|data:|blob:)/i.test(detail)) return detail;
  return `${API_BASE_URL}${detail.startsWith("/") ? "" : "/"}${detail}`;
}

const IMAGE_PATH_RE = /\.(png|jpe?g|gif|webp|bmp|svg|avif)(\?.*)?$/i;

/** True when `detail` points at something we can show in an <img>. */
export function isImageDetail(detail: string | null | undefined): boolean {
  if (!detail) return false;
  return detail.startsWith("data:image/") || IMAGE_PATH_RE.test(detail);
}
