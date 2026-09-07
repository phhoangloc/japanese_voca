"use client";

import { useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import { matchesQuery, useSearch } from "@/components/SearchContext";
import { useToast } from "@/components/Toast";
import { useResource } from "@/hooks/useResource";
import { ApiError } from "@/lib/api";
import { api } from "@/lib/client";
import { isImageDetail, resolveFileUrl } from "@/lib/files";
import { formatDate } from "@/lib/format";
import type { FileRecord } from "@/lib/types";

export default function FilesPage() {
  const { items, loading, error, reload, remove } =
    useResource<FileRecord>("files");
  const toast = useToast();
  const { query } = useSearch();

  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [toDelete, setToDelete] = useState<FileRecord | null>(null);

  const handleFiles = async (fileList: FileList | null) => {
    const files = fileList ? Array.from(fileList) : [];
    if (files.length === 0) return;

    setUploading(true);
    try {
      let done = 0;
      for (const file of files) {
        await api.upload<FileRecord>("files", file, { name: file.name });
        done += 1;
      }
      await reload();
      if (done > 0) {
        toast.success(done === 1 ? "File uploaded" : `${done} files uploaded`);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await remove(toDelete.id);
      toast.success("File deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed");
    } finally {
      setToDelete(null);
    }
  };

  const rows = items.filter((f) => matchesQuery(query, f.id, f.name));

  return (
    <div className="flex flex-col gap-3.5">
      <PageHeader
        title="Files"
        description="Uploaded files, stored on the server under /public/upload. Images preview below; other files show their name."
        action={
          <button
            className="btn-primary"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading…" : "+ New file"}
          </button>
        }
      />

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-ink-soft">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line bg-paper px-4 py-8 text-center text-sm text-ink-soft">
          {query
            ? "No files match your search."
            : "No files yet. Use “New file” to upload one."}
        </p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-3">
          {rows.map((f) => {
            const src = resolveFileUrl(f.detail);
            return (
              <figure
                key={f.id}
                className="group flex w-40 shrink-0 flex-col gap-2"
              >
                <div className="relative h-40 w-40 overflow-hidden rounded-xl border border-line bg-white">
                  {src && isImageDetail(f.detail) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={f.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center px-2 text-center text-xs font-semibold text-ink-soft">
                      {f.name}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setToDelete(f)}
                    aria-label={`Delete ${f.name}`}
                    className="absolute right-1.5 top-1.5 rounded-md bg-white/90 px-1.5 py-0.5 text-xs font-semibold text-red-600 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
                <figcaption
                  className="truncate text-xs text-ink-soft"
                  title={`${f.name} · ${formatDate(f.createdAt)}`}
                >
                  {f.name}
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete file"
        message={`Delete file "${toDelete?.name}"? Customers using it as an avatar will have their avatar cleared.`}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
