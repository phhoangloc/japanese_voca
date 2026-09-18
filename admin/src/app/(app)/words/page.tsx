"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Column, DataTable } from "@/components/DataTable";
import { SelectField } from "@/components/Field";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { matchesQuery, useSearch } from "@/components/SearchContext";
import { useToast } from "@/components/Toast";
import { WordFilesCell } from "@/components/WordFilesCell";
import { usePagination } from "@/hooks/usePagination";
import { useResource } from "@/hooks/useResource";
import { ApiError } from "@/lib/api";
import { api } from "@/lib/client";
import { formatDate, htmlToPreview } from "@/lib/format";
import type { Chapter, Course, FileRecord, Word } from "@/lib/types";

export default function WordsPage() {
  const { items, loading, error, remove } = useResource<Word>("words");
  const toast = useToast();
  const { query } = useSearch();

  const [courses, setCourses] = useState<Course[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  useEffect(() => {
    let alive = true;
    (async () => {
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
      } catch {
        /* table surfaces load errors */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const [courseFilter, setCourseFilter] = useState("");
  const [chapterFilter, setChapterFilter] = useState("");

  const chapterOptions = courseFilter
    ? chapters.filter((ch) => String(ch.courseId) === courseFilter)
    : chapters;

  const chapterById = (id: number | null) =>
    id == null ? null : (chapters.find((ch) => ch.id === id) ?? null);
  const courseName = (id: number) =>
    courses.find((c) => c.id === id)?.name ?? `#${id}`;
  const chapterLabel = (id: number | null) => {
    const ch = chapterById(id);
    return ch ? `#${ch.number} ${ch.name}` : "—";
  };

  const [toDelete, setToDelete] = useState<Word | null>(null);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await remove(toDelete.id);
      toast.success("Word deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed");
    } finally {
      setToDelete(null);
    }
  };

  const columns = useMemo<Column<Word>[]>(
    () => [
      { key: "id", header: "ID", render: (w) => w.id, className: "w-16" },
      {
        key: "word",
        header: "Word",
        render: (w) => <span className="font-semibold text-ink">{w.word}</span>,
      },
      {
        key: "explain",
        header: "Explain",
        render: (w) => (
          <span className="text-ink-soft">
            {htmlToPreview(w.explain, 90) || "—"}
          </span>
        ),
      },
      {
        key: "chapter",
        header: "Chapter",
        render: (w) => {
          const ch = chapterById(w.chapterId);
          return (
            <span className="text-ink-soft">
              {ch ? `${chapterLabel(w.chapterId)} · ${courseName(ch.courseId)}` : "—"}
            </span>
          );
        },
      },
      {
        key: "attachments",
        header: "Files",
        render: (w) => <WordFilesCell word={w} files={files} />,
      },
      {
        key: "createdAt",
        header: "Created",
        render: (w) => formatDate(w.createdAt),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chapters, courses, files],
  );

  const rows = items
    .filter((w) => {
      if (chapterFilter) {
        if (chapterFilter === "none") return w.chapterId == null;
        return w.chapterId === Number(chapterFilter);
      }
      if (courseFilter) {
        const ch = chapterById(w.chapterId);
        return ch != null && String(ch.courseId) === courseFilter;
      }
      return true;
    })
    .filter((w) =>
      matchesQuery(
        query,
        w.id,
        w.word,
        htmlToPreview(w.explain, 200),
        chapterLabel(w.chapterId),
      ),
    );
  const { page, setPage, pageRows, pageCount, pageSize, total } = usePagination(
    rows,
    { resetKey: `${query}|${courseFilter}|${chapterFilter}` },
  );

  const filtered = query !== "" || courseFilter !== "" || chapterFilter !== "";

  return (
    <div className="flex flex-col gap-3.5">
      <PageHeader
        title="Words"
        description="Vocabulary entries: a term, its explanation, and attached image / sound files."
        action={
          <Link href="/words/new" className="btn-primary">
            + New word
          </Link>
        }
      />

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 sm:max-w-xl">
        <SelectField
          label="Course"
          value={courseFilter}
          onChange={(e) => {
            setCourseFilter(e.target.value);
            setChapterFilter("");
          }}
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Chapter"
          value={chapterFilter}
          onChange={(e) => setChapterFilter(e.target.value)}
        >
          <option value="">All chapters</option>
          <option value="none">— no chapter —</option>
          {chapterOptions.map((ch) => (
            <option key={ch.id} value={ch.id}>
              #{ch.number} {ch.name}
            </option>
          ))}
        </SelectField>
      </div>

      <DataTable
        columns={columns}
        rows={pageRows}
        rowKey={(w) => w.id}
        loading={loading}
        emptyMessage={filtered ? "No words match your filters." : "No words yet."}
        actions={(w) => (
          <>
            <Link href={`/words/${w.id}/edit`} className="btn-row">
              Edit
            </Link>
            <button
              className="btn-row text-red-600 hover:bg-red-50"
              onClick={() => setToDelete(w)}
            >
              Delete
            </button>
          </>
        )}
      />

      <Pagination
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        totalItems={total}
        pageSize={pageSize}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete word"
        message={`Delete "${toDelete?.word}"? This cannot be undone. Its uploaded files are kept.`}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
