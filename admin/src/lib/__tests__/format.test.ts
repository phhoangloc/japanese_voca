import { describe, expect, it } from "vitest";
import { formatDate, htmlToPreview, initials } from "../format";

describe("formatDate", () => {
  it("formats an ISO string as 'YYYY-MM-DD HH:mm'", () => {
    // Use a fixed local time to avoid timezone drift in the assertion.
    const d = new Date(2026, 8, 4, 9, 5); // 2026-09-04 09:05 local
    expect(formatDate(d.toISOString())).toBe("2026-09-04 09:05");
  });

  it("returns '' for empty input and echoes unparseable input", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
    expect(formatDate("not a date")).toBe("not a date");
  });
});

describe("htmlToPreview", () => {
  it("strips tags, decodes entities and collapses whitespace", () => {
    expect(
      htmlToPreview("<h1>Title</h1>\n<p>Some&nbsp;<b>bold</b> &amp; text</p>"),
    ).toBe("Title Some bold & text");
  });

  it("clips to the max length with an ellipsis", () => {
    expect(htmlToPreview("<p>abcdefghij</p>", 5)).toBe("abcd…");
  });

  it("returns '' for nullish input", () => {
    expect(htmlToPreview(null)).toBe("");
    expect(htmlToPreview("")).toBe("");
  });
});

describe("initials", () => {
  it("derives up to two letters", () => {
    expect(initials("root")).toBe("RO");
    expect(initials("Ada Lovelace")).toBe("AL");
    expect(initials("  ")).toBe("?");
  });
});
