import { describe, expect, it } from "vitest";
import { buildCardFaces, wrapIndex } from "../flashcard";
import { API_BASE_URL } from "../api";
import type { FileRecord, Word } from "../types";

const file = (id: number, detail: string): FileRecord => ({
  id,
  name: `f${id}`,
  detail,
  createdAt: "",
  updatedAt: "",
});

const word = (over: Partial<Word> = {}): Word => ({
  id: 1,
  word: "こんにちは",
  explain: "hello",
  imageId: null,
  soundId: null,
  readExplainId: null,
  chapterId: 9,
  createdAt: "",
  updatedAt: "",
  ...over,
});

describe("buildCardFaces", () => {
  const files = [
    file(10, "/upload/pic.png"),
    file(11, "/upload/say.mp3"),
    file(12, "/upload/explain.mp3"),
  ];

  it("maps front = picture + name + sound, back = mean + read-explain sound", () => {
    const faces = buildCardFaces(
      word({ imageId: 10, soundId: 11, readExplainId: 12 }),
      files,
    );
    expect(faces.front).toEqual({
      imageUrl: `${API_BASE_URL}/upload/pic.png`,
      name: "こんにちは",
      soundUrl: `${API_BASE_URL}/upload/say.mp3`,
    });
    expect(faces.back).toEqual({
      mean: "hello",
      soundUrl: `${API_BASE_URL}/upload/explain.mp3`,
    });
  });

  it("nulls missing files and a non-image imageId", () => {
    const faces = buildCardFaces(
      word({ imageId: 11, soundId: 999, explain: null }),
      files,
    );
    expect(faces.front.imageUrl).toBeNull(); // id 11 is an mp3, not an image
    expect(faces.front.soundUrl).toBeNull(); // 999 doesn't exist
    expect(faces.back.mean).toBe("");
  });
});

describe("wrapIndex", () => {
  it("wraps around both ends", () => {
    expect(wrapIndex(0, 3)).toBe(0);
    expect(wrapIndex(3, 3)).toBe(0);
    expect(wrapIndex(-1, 3)).toBe(2);
    expect(wrapIndex(5, 3)).toBe(2);
  });
  it("is 0 for an empty list", () => {
    expect(wrapIndex(2, 0)).toBe(0);
  });
});
