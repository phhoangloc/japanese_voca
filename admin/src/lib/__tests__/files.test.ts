import { describe, expect, it } from "vitest";
import { isImageDetail, resolveFileUrl } from "../files";
import { API_BASE_URL } from "../api";

describe("resolveFileUrl", () => {
  it("prefixes a root-relative upload path with the API host", () => {
    expect(resolveFileUrl("/upload/abc.png")).toBe(
      `${API_BASE_URL}/upload/abc.png`,
    );
  });

  it("adds a missing leading slash", () => {
    expect(resolveFileUrl("upload/abc.png")).toBe(
      `${API_BASE_URL}/upload/abc.png`,
    );
  });

  it("returns absolute and data/blob URLs unchanged", () => {
    expect(resolveFileUrl("https://cdn.test/x.png")).toBe(
      "https://cdn.test/x.png",
    );
    expect(resolveFileUrl("data:image/png;base64,AAAA")).toBe(
      "data:image/png;base64,AAAA",
    );
    expect(resolveFileUrl("blob:http://x/1")).toBe("blob:http://x/1");
  });

  it("returns null for empty input", () => {
    expect(resolveFileUrl(null)).toBeNull();
    expect(resolveFileUrl(undefined)).toBeNull();
    expect(resolveFileUrl("")).toBeNull();
  });
});

describe("isImageDetail", () => {
  it("accepts image file paths and data URLs", () => {
    expect(isImageDetail("/upload/a.png")).toBe(true);
    expect(isImageDetail("/upload/a.JPEG")).toBe(true);
    expect(isImageDetail("data:image/gif;base64,AAAA")).toBe(true);
  });

  it("rejects non-image paths and empty input", () => {
    expect(isImageDetail("/upload/notes.pdf")).toBe(false);
    expect(isImageDetail("just a description")).toBe(false);
    expect(isImageDetail(null)).toBe(false);
  });
});
