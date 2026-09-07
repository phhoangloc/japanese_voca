import { API_BASE_URL } from "./api";
import type { Course } from "./types";

/**
 * A deterministic hue (0..360) for a course, so each "book" always renders the
 * same cover. Uses the golden angle for good spread across ids.
 */
export function hueFromId(id: number): number {
  const h = (Math.abs(Math.round(id)) * 137.508) % 360;
  return Math.round(h);
}

export interface CoverPalette {
  sky: string;
  mid: string;
  dune: string;
  deep: string;
  ink: string;
  titleColor: string;
  accent: string;
  accentBg: string;
}

function tone(hue: number, l: number, c: number): string {
  return `oklch(${l} ${c} ${((hue % 360) + 360) % 360})`;
}

/** Mirror of the design's `decorate()` — a dune/sky gradient from one hue. */
export function coverPalette(hue: number): CoverPalette {
  return {
    sky: tone(hue, 0.62, 0.09),
    mid: tone(hue, 0.72, 0.07),
    dune: tone(hue + 15, 0.56, 0.1),
    deep: tone(hue + 15, 0.38, 0.08),
    ink: tone(hue, 0.22, 0.04),
    titleColor: "oklch(0.98 0.01 90)",
    accent: tone(hue, 0.5, 0.12),
    accentBg: tone(hue, 0.94, 0.03),
  };
}

/** Case-insensitive filter of courses by name. Blank query => all. */
export function filterCourses(courses: Course[], query: string): Course[] {
  const q = query.trim().toLowerCase();
  if (!q) return courses;
  return courses.filter((c) => c.name.toLowerCase().includes(q));
}

const IMAGE_RE = /\.(png|jpe?g|gif|webp|bmp|svg|avif)(\?.*)?$/i;

/** Turn a `file.detail` value into a browser-loadable URL. */
export function resolveFileUrl(
  detail: string | null | undefined,
): string | null {
  if (!detail) return null;
  if (/^(https?:|data:|blob:)/i.test(detail)) return detail;
  return `${API_BASE_URL}${detail.startsWith("/") ? "" : "/"}${detail}`;
}

/** True when `detail` points at an image we can put in an <img>. */
export function isImageDetail(detail: string | null | undefined): boolean {
  if (!detail) return false;
  return detail.startsWith("data:image/") || IMAGE_RE.test(detail);
}
