"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Column, DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { matchesQuery, useSearch } from "@/components/SearchContext";
import { useToast } from "@/components/Toast";
import { usePagination } from "@/hooks/usePagination";
import { useResource } from "@/hooks/useResource";
import { ApiError } from "@/lib/api";
import { formatDate, htmlToPreview } from "@/lib/format";
import type { Word } from "@/lib/types";

export default function WordsPage() {
  const { items, loading, error, remove } = useResource<Word>("words");
  const toast = useToast();
  const { query } = useSearch();

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
        key: "attachments",
        header: "Files",
        render: (w) => (
          <span className="flex gap-1.5 text-base" aria-hidden>
            <span className={w.imageId ? "" : "opacity-20"} title="Image">
              🖼️
            </span>
            <span className={w.soundId ? "" : "opacity-20"} title="Sound">
              🔊
            </span>
            <span
              className={w.readExplainId ? "" : "opacity-20"}
              title="Read explain"
            >
              🗣️
            </span>
          </span>
        ),
      },
      {
        key: "createdAt",
        header: "Created",
        render: (w) => formatDate(w.createdAt),
      },
    ],
    [],
  );

  const rows = items.filter((w) =>
    matchesQuery(query, w.id, w.word, htmlToPreview(w.explain, 200)),
  );
  const { page, setPage, pageRows, pageCount, pageSize, total } = usePagination(
    rows,
    { resetKey: query },
  );

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

      <DataTable
        columns={columns}
        rows={pageRows}
        rowKey={(w) => w.id}
        loading={loading}
        emptyMessage={query ? "No words match your search." : "No words yet."}
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
