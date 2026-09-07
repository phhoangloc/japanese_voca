import { isImageDetail, resolveFileUrl } from "./books";
import type { FileRecord, Word } from "./types";

export interface CardFaces {
  /** Front: picture + name + sound (home-idea.md). */
  front: { imageUrl: string | null; name: string; soundUrl: string | null };
  /** Back: meaning + the "read explain" audio. */
  back: { mean: string; soundUrl: string | null };
}

/** Resolve one word's two flashcard faces against the loaded file records. */
export function buildCardFaces(word: Word, files: FileRecord[]): CardFaces {
  const detailOf = (id: number | null): string | null =>
    id == null ? null : files.find((f) => f.id === id)?.detail ?? null;
  const asImage = (id: number | null) => {
    const d = detailOf(id);
    return isImageDetail(d) ? resolveFileUrl(d) : null;
  };
  const asAudio = (id: number | null) => resolveFileUrl(detailOf(id));

  return {
    front: {
      imageUrl: asImage(word.imageId),
      name: word.word,
      soundUrl: asAudio(word.soundId),
    },
    back: {
      mean: word.explain ?? "",
      soundUrl: asAudio(word.readExplainId),
    },
  };
}

/** Clamp an index into `[0, len)`, wrapping negative/overflow. */
export function wrapIndex(i: number, len: number): number {
  if (len <= 0) return 0;
  return ((i % len) + len) % len;
}
