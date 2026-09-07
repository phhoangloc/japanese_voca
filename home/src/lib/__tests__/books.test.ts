import { describe, expect, it } from "vitest";
import {
  coverPalette,
  filterCourses,
  hueFromId,
  isImageDetail,
  resolveFileUrl,
} from "../books";
import { API_BASE_URL } from "../api";
import type { Course } from "../types";

const course = (id: number, name: string): Course => ({
  id,
  name,
  imageId: null,
  createdAt: "",
  updatedAt: "",
});

describe("hueFromId", () => {
  it("is deterministic and within 0..359", () => {
    for (const id of [1, 2, 7, 42, 1000]) {
      const h = hueFromId(id);
      expect(h).toBe(hueFromId(id));
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(360);
    }
  });

  it("spreads nearby ids apart", () => {
    expect(hueFromId(1)).not.toBe(hueFromId(2));
  });
});

describe("coverPalette", () => {
  it("returns the five gradient tones plus title/accent", () => {
    const p = coverPalette(40);
    for (const k of ["sky", "mid", "dune", "deep", "ink"] as const) {
      expect(p[k]).toMatch(/^oklch\(/);
    }
    expect(p.titleColor).toMatch(/^oklch\(/);
  });
});

describe("filterCourses", () => {
  const list = [course(1, "Beginner English"), course(2, "業務 DX 入門")];

  it("returns everything for a blank query", () => {
    expect(filterCourses(list, "  ")).toHaveLength(2);
  });

  it("matches case-insensitively on name", () => {
    expect(filterCourses(list, "english")).toEqual([list[0]]);
    expect(filterCourses(list, "DX")).toEqual([list[1]]);
    expect(filterCourses(list, "zzz")).toEqual([]);
  });
});

describe("resolveFileUrl / isImageDetail", () => {
  it("prefixes an upload path with the API host", () => {
    expect(resolveFileUrl("/upload/a.png")).toBe(`${API_BASE_URL}/upload/a.png`);
  });
  it("leaves absolute and data URLs alone", () => {
    expect(resolveFileUrl("https://x/y.png")).toBe("https://x/y.png");
    expect(resolveFileUrl(null)).toBeNull();
  });
  it("detects images", () => {
    expect(isImageDetail("/upload/a.jpeg")).toBe(true);
    expect(isImageDetail("/upload/notes.pdf")).toBe(false);
    expect(isImageDetail(null)).toBe(false);
  });
});
