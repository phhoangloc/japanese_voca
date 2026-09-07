"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookCover } from "@/components/BookCover";
import { SiteHeader } from "@/components/SiteHeader";
import { ApiError } from "@/lib/api";
import { coverPalette, hueFromId, isImageDetail, resolveFileUrl } from "@/lib/books";
import { api } from "@/lib/client";
import type { Chapter, Course, FileRecord } from "@/lib/types";

export function CourseView({ courseId }: { courseId: number }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [c, ch, f] = await Promise.all([
          api.get<Course>("courses", courseId),
          api.list<Chapter>("chapters"),
          api.list<FileRecord>("files"),
        ]);
        if (!alive) return;
        setCourse(c);
        setChapters(
          ch
            .filter((x) => x.courseId === courseId)
            .sort((a, b) => a.number - b.number || a.id - b.id),
        );
        setFiles(f);
      } catch (err) {
        if (alive) {
          setError(
            err instanceof ApiError && err.status === 404
              ? "コースが見つかりません。"
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
  }, [courseId]);

  const p = coverPalette(hueFromId(courseId));
  const coverUrl =
    course?.imageId != null
      ? (() => {
          const d = files.find((f) => f.id === course.imageId)?.detail ?? null;
          return isImageDetail(d) ? resolveFileUrl(d) : null;
        })()
      : null;

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <SiteHeader backHref="/" backLabel="図書館へ戻る" />

      {error ? (
        <p className="mx-auto mt-16 max-w-md rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : loading || !course ? (
        <p className="mx-auto mt-24 text-sm text-ink-faint">読み込み中…</p>
      ) : (
        <main className="mx-auto grid w-full max-w-[1100px] animate-fadeUp grid-cols-1 gap-8 px-8 pb-20 pt-14 md:grid-cols-[minmax(240px,320px)_1fr]">
          <div className="flex justify-center">
            <BookCover
              id={course.id}
              title={course.name}
              imageUrl={coverUrl}
              size="detail"
            />
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <span
                className="mb-3 inline-block rounded-full px-3 py-[5px] text-[11px] uppercase tracking-[0.1em]"
                style={{ color: p.accent, background: p.accentBg }}
              >
                コース
              </span>
              <h1 className="m-0 text-[32px] font-extrabold leading-tight text-ink">
                {course.name}
              </h1>
              <div className="mt-1 text-[15px] text-ink-soft">
                全{chapters.length}章
              </div>
            </div>

            {chapters.length === 0 ? (
              <p className="text-sm text-ink-faint">章はまだありません。</p>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {chapters.map((ch) => (
                  <li key={ch.id}>
                    <Link
                      href={`/chapter/${ch.id}`}
                      className="flex items-center gap-3 rounded-xl border border-line bg-white/60 px-4 py-3 transition-colors hover:bg-white"
                    >
                      <span
                        className="font-display text-lg font-extrabold"
                        style={{ color: p.accent }}
                      >
                        {ch.number}
                      </span>
                      <span className="font-semibold text-ink">{ch.name}</span>
                      <span className="ml-auto text-[13px] text-ink-faint">
                        単語を見る →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
