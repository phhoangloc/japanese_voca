"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LibraryGrid } from "@/components/LibraryGrid";
import { SiteHeader } from "@/components/SiteHeader";
import { ApiError } from "@/lib/api";
import { filterCourses, isImageDetail, resolveFileUrl } from "@/lib/books";
import { api } from "@/lib/client";
import type { Chapter, Course, FileRecord } from "@/lib/types";

export default function LibraryPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [c, ch, f] = await Promise.all([
          api.list<Course>("courses"),
          api.list<Chapter>("chapters"),
          api.list<FileRecord>("files"),
        ]);
        if (!alive) return;
        setCourses(c);
        setChapters(ch);
        setFiles(f);
      } catch (err) {
        if (alive) {
          setError(
            err instanceof ApiError
              ? err.message
              : "ライブラリのデータを読み込めませんでした。",
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const coverUrl = useCallback(
    (course: Course): string | null => {
      if (course.imageId == null) return null;
      const detail = files.find((f) => f.id === course.imageId)?.detail ?? null;
      return isImageDetail(detail) ? resolveFileUrl(detail) : null;
    },
    [files],
  );

  const visible = useMemo(
    () => filterCourses(courses, query),
    [courses, query],
  );

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <SiteHeader />

      {error ? (
        <p className="mx-auto mt-16 max-w-md rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : loading ? (
        <p className="mx-auto mt-24 text-sm text-ink-faint">読み込み中…</p>
      ) : (
        <LibraryGrid
          courses={visible}
          chapters={chapters}
          query={query}
          onQuery={setQuery}
          coverUrl={coverUrl}
        />
      )}

      <footer className="mt-auto border-t border-black/10 px-12 py-6 text-center text-[12px] text-ink-soft">
        用語ー図書館 — イメージ展示のみ、完全な本文はまだありません
      </footer>
    </div>
  );
}
