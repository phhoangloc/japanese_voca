"use client";

import { useEffect, useMemo, useState } from "react";
import { FlashCard } from "@/components/FlashCard";
import { SiteHeader } from "@/components/SiteHeader";
import { ApiError } from "@/lib/api";
import { coverPalette, hueFromId } from "@/lib/books";
import { buildCardFaces, wrapIndex } from "@/lib/flashcard";
import { api } from "@/lib/client";
import type { Chapter, FileRecord, Word } from "@/lib/types";

export function FlashcardStudy({ chapterId }: { chapterId: number }) {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [ch, allWords, f] = await Promise.all([
          api.get<Chapter>("chapters", chapterId),
          api.list<Word>("words"),
          api.list<FileRecord>("files"),
        ]);
        if (!alive) return;
        setChapter(ch);
        setWords(
          allWords
            .filter((w) => w.chapterId === chapterId)
            .sort((a, b) => a.id - b.id),
        );
        setFiles(f);
      } catch (err) {
        if (alive) {
          setError(
            err instanceof ApiError && err.status === 404
              ? "章が見つかりません。"
              : err instanceof ApiError
                ? err.message
                : "読み込みに失敗しました。",
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [chapterId]);

  const palette = coverPalette(
    hueFromId(chapter ? chapter.courseId : chapterId),
  );
  const current = words.length ? words[wrapIndex(index, words.length)] : null;
  const faces = useMemo(
    () => (current ? buildCardFaces(current, files) : null),
    [current, files],
  );

  const step = (delta: number) =>
    setIndex((i) => wrapIndex(i + delta, words.length));

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <SiteHeader backHref={`/chapter/${chapterId}`} backLabel="章へ戻る" />

      {error ? (
        <p className="mx-auto mt-16 max-w-md rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : loading ? (
        <p className="mx-auto mt-24 text-sm text-ink-faint">読み込み中…</p>
      ) : !current || !faces ? (
        <p className="mx-auto mt-24 text-sm text-ink-faint">
          この章には単語がありません。
        </p>
      ) : (
        <main className="mx-auto flex w-full max-w-[560px] flex-1 animate-fadeUp flex-col items-center gap-6 px-6 py-12">
          <div className="text-center">
            <div className="text-[13px] font-semibold text-ink-faint">
              {chapter?.name}
            </div>
            <div className="text-[13px] text-ink-soft">
              {wrapIndex(index, words.length) + 1} / {words.length}
            </div>
          </div>

          <FlashCard key={current.id} faces={faces} palette={palette} />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => step(-1)}
              className="btn-outline"
              disabled={words.length < 2}
            >
              ← 前へ
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              className="btn-primary"
              style={{ background: palette.accent }}
              disabled={words.length < 2}
            >
              次へ →
            </button>
          </div>
        </main>
      )}

      <footer className="mt-auto border-t border-black/10 px-12 py-5 text-center text-[12px] text-ink-soft">
        用語ー図書館
      </footer>
    </div>
  );
}
