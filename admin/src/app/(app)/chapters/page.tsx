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

export default function ChaptersPage() {
  const { items, loading, error, remove } = useResource<Chapter>("chapters");
  const toast = useToast();
  const { query } = useSearch();

  const [courses, setCourses] = useState<Course[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [c, f] = await Promise.all([
          api.list<Course>("courses"),
          api.list<FileRecord>("files"),
        ]);
        if (!alive) return;
        setCourses(c);
        setFiles(f);
      } catch {
        /* table surfaces load errors */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const [toDelete, setToDelete] = useState<Chapter | null>(null);

  const imageUrl = (id: number | null) =>
    id == null
      ? null
      : resolveFileUrl(files.find((f) => f.id === id)?.detail ?? null);
  const courseName = (id: number) =>
    courses.find((c) => c.id === id)?.name ?? `#${id}`;

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await remove(toDelete.id);
      toast.success("Chapter deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed");
    } finally {
      setToDelete(null);
    }
  };

  const columns = useMemo<Column<Chapter>[]>(
    () => [
      {
        key: "image",
        header: "",
        className: "w-14",
        render: (ch) => {
          const url = imageUrl(ch.imageId);
          return url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={ch.name}
              className="h-9 w-9 rounded-lg object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-line-faint text-sm">
              📄
            </span>
          );
        },
      },
      { key: "id", header: "ID", render: (ch) => ch.id, className: "w-14" },
      {
        key: "number",
        header: "No.",
        className: "w-16",
        render: (ch) => ch.number,
      },
      {
        key: "name",
        header: "Name",
        render: (ch) => (
          <span className="font-semibold text-ink">{ch.name}</span>
        ),
      },
      {
        key: "course",
        header: "Course",
        render: (ch) => courseName(ch.courseId),
      },
      {
        key: "createdAt",
        header: "Created",
        render: (ch) => formatDate(ch.createdAt),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [courses, files],
  );

  const rows = items.filter((ch) =>
    matchesQuery(query, ch.id, ch.number, ch.name, courseName(ch.courseId)),
  );

  return (
    <div className="flex flex-col gap-3.5">
      <PageHeader
        title="Chapters"
        description="Chapters belong to a course."
        action={
          courses.length === 0 ? (
            <button
              className="btn-primary"
              disabled
              title="Create a course first — every chapter needs one"
            >
              + New chapter
            </button>
          ) : (
            <Link href="/chapters/new" className="btn-primary">
              + New chapter
            </Link>
          )
        }
      />

      {courses.length === 0 && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          There are no courses yet. Add a course before creating chapters.
        </p>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(ch) => ch.id}
        loading={loading}
        emptyMessage={
          query ? "No chapters match your search." : "No chapters yet."
        }
        actions={(ch) => (
          <>
            <Link href={`/chapters/${ch.id}/edit`} className="btn-row">
              Edit
            </Link>
            <button
              className="btn-row text-red-600 hover:bg-red-50"
              onClick={() => setToDelete(ch)}
            >
              Delete
            </button>
          </>
        )}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete chapter"
        message={`Delete chapter "${toDelete?.name}"? This cannot be undone.`}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
