"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { ApiError } from "@/lib/api";
import { coverPalette, hueFromId } from "@/lib/books";
import { api } from "@/lib/client";
import type { Chapter, Word } from "@/lib/types";

export function ChapterView({ chapterId }: { chapterId: number }) {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [ch, allWords] = await Promise.all([
          api.get<Chapter>("chapters", chapterId),
          api.list<Word>("words"),
        ]);
        if (!alive) return;
        setChapter(ch);
        setWords(
          allWords
            .filter((w) => w.chapterId === chapterId)
            .sort((a, b) => a.id - b.id),
        );
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

  const p = chapter ? coverPalette(hueFromId(chapter.courseId)) : null;

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <SiteHeader
        backHref={chapter ? `/course/${chapter.courseId}` : "/"}
        backLabel="コースへ戻る"
      />

      {error ? (
        <p className="mx-auto mt-16 max-w-md rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : loading || !chapter ? (
        <p className="mx-auto mt-24 text-sm text-ink-faint">読み込み中…</p>
      ) : (
        <main className="mx-auto w-full max-w-[820px] animate-fadeUp px-8 pb-20 pt-14">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-[13px] font-semibold text-ink-faint">
                第{chapter.number}章
              </span>
              <h1 className="m-0 text-[30px] font-extrabold leading-tight text-ink">
                {chapter.name}
              </h1>
              <div className="mt-1 text-[14px] text-ink-soft">
                単語 {words.length} 語
              </div>
            </div>
            {words.length > 0 && (
              <Link
                href={`/flashcard/${chapter.id}`}
                className="btn-primary"
                style={p ? { background: p.accent } : undefined}
              >
                フラッシュカードで学ぶ →
              </Link>
            )}
          </div>

          {words.length === 0 ? (
            <p className="text-sm text-ink-faint">単語はまだありません。</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {words.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center gap-4 rounded-xl border border-line bg-white/60 px-4 py-3"
                >
                  <span className="text-[16px] font-bold text-ink">
                    {w.word}
                  </span>
                  <span className="truncate text-[14px] text-ink-soft">
                    {w.explain ?? "—"}
                  </span>
                  <span className="ml-auto flex gap-1.5 text-sm" aria-hidden>
                    <span className={w.imageId ? "" : "opacity-20"}>🖼️</span>
                    <span className={w.soundId ? "" : "opacity-20"}>🔊</span>
                    <span className={w.readExplainId ? "" : "opacity-20"}>
                      🗣️
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </main>
      )}
    </div>
  );
}
