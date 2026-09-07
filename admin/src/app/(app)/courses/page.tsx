"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Column, DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { matchesQuery, useSearch } from "@/components/SearchContext";
import { useToast } from "@/components/Toast";
import { useResource } from "@/hooks/useResource";
import { ApiError } from "@/lib/api";
import { api } from "@/lib/client";
import { resolveFileUrl } from "@/lib/files";
import { formatDate } from "@/lib/format";
import type { Chapter, Course, FileRecord } from "@/lib/types";

export default function CoursesPage() {
  const { items, loading, error, remove } = useResource<Course>("courses");
  const toast = useToast();
  const { query } = useSearch();

  const [files, setFiles] = useState<FileRecord[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [f, c] = await Promise.all([
          api.list<FileRecord>("files"),
          api.list<Chapter>("chapters"),
        ]);
        if (!alive) return;
        setFiles(f);
        setChapters(c);
      } catch {
        /* table surfaces load errors */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const [toDelete, setToDelete] = useState<Course | null>(null);

  const imageUrl = (id: number | null) =>
    id == null
      ? null
      : resolveFileUrl(files.find((f) => f.id === id)?.detail ?? null);
  const chapterCount = (courseId: number) =>
    chapters.filter((c) => c.courseId === courseId).length;

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await remove(toDelete.id);
      toast.success("Course deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed");
    } finally {
      setToDelete(null);
    }
  };

  const columns = useMemo<Column<Course>[]>(
    () => [
      {
        key: "image",
        header: "",
        className: "w-14",
        render: (c) => {
          const url = imageUrl(c.imageId);
          return url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={c.name}
              className="h-9 w-9 rounded-lg object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-line-faint text-sm">
              📚
            </span>
          );
        },
      },
      { key: "id", header: "ID", render: (c) => c.id, className: "w-14" },
      {
        key: "name",
        header: "Name",
        render: (c) => <span className="font-semibold text-ink">{c.name}</span>,
      },
      {
        key: "chapters",
        header: "Chapters",
        render: (c) => (
          <span className="pill pill-gray">{chapterCount(c.id)}</span>
        ),
      },
      {
        key: "createdAt",
        header: "Created",
        render: (c) => formatDate(c.createdAt),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files, chapters],
  );

  const rows = items.filter((c) => matchesQuery(query, c.id, c.name));

  return (
    <div className="flex flex-col gap-3.5">
      <PageHeader
        title="Courses"
        description="A course groups chapters of vocabulary."
        action={
          <Link href="/courses/new" className="btn-primary">
            + New course
          </Link>
        }
      />

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(c) => c.id}
        loading={loading}
        emptyMessage={query ? "No courses match your search." : "No courses yet."}
        actions={(c) => (
          <>
            <Link href={`/courses/${c.id}/edit`} className="btn-row">
              Edit
            </Link>
            <button
              className="btn-row text-red-600 hover:bg-red-50"
              onClick={() => setToDelete(c)}
            >
              Delete
            </button>
          </>
        )}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete course"
        message={`Delete "${toDelete?.name}"? Courses that still have chapters cannot be deleted.`}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
