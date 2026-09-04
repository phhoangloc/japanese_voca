import { describe, expect, it } from "vitest";
import { isImage } from "../image";

describe("isImage", () => {
  it("accepts files with an image/* MIME type", () => {
    expect(isImage({ type: "image/png", name: "a.png" })).toBe(true);
    expect(isImage({ type: "image/jpeg", name: "photo" })).toBe(true);
  });

  it("rejects non-image MIME types", () => {
    expect(isImage({ type: "application/pdf", name: "a.pdf" })).toBe(false);
    expect(isImage({ type: "text/plain", name: "a.txt" })).toBe(false);
  });

  it("falls back to the file extension when the type is empty", () => {
    expect(isImage({ type: "", name: "picture.JPG" })).toBe(true);
    expect(isImage({ type: "", name: "archive.zip" })).toBe(false);
    expect(isImage({ type: "", name: "noext" })).toBe(false);
  });
});
