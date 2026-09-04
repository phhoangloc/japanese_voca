"use client";

import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Column, DataTable } from "@/components/DataTable";
import { Field } from "@/components/Field";
import { Modal } from "@/components/Modal";
import { PageHeader } from "@/components/PageHeader";
import { RichTextEditor } from "@/components/RichTextEditor";
import { matchesQuery, useSearch } from "@/components/SearchContext";
import { useToast } from "@/components/Toast";
import { useResource } from "@/hooks/useResource";
import { ApiError } from "@/lib/api";
import { formatDate, htmlToPreview } from "@/lib/format";
import type { FieldErrors, FileRecord } from "@/lib/types";
import { validateFile } from "@/lib/validation";

type Draft = { name: string; detail: string };
const EMPTY: Draft = { name: "", detail: "" };

export default function FilesPage() {
  const { items, loading, error, create, update, remove } =
    useResource<FileRecord>("files");
  const toast = useToast();
  const { query } = useSearch();

  const [editing, setEditing] = useState<FileRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<FileRecord | null>(null);
  const [preview, setPreview] = useState<FileRecord | null>(null);

  const isEdit = editing !== null;

  const openCreate = () => {
    setEditing(null);
    setDraft(EMPTY);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (f: FileRecord) => {
    setEditing(f);
    setDraft({ name: f.name, detail: f.detail ?? "" });
    setErrors({});
    setFormOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientErrors = validateFile(draft);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSaving(true);
    try {
      const body = {
        name: draft.name.trim(),
        detail: draft.detail.trim() === "" ? null : draft.detail,
      };
      if (isEdit && editing) {
        await update(editing.id, body);
        toast.success("File updated");
      } else {
        await create(body);
        toast.success("File created");
      }
      setFormOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details) setErrors(err.details);
        else toast.error(err.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setSaving(false);
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

  const columns = useMemo<Column<FileRecord>[]>(
    () => [
      { key: "id", header: "ID", render: (f) => f.id, className: "w-16" },
      { key: "name", header: "Name", render: (f) => f.name },
      {
        key: "detail",
        header: "Detail",
        render: (f) => (
          <span className="text-ink-soft">
            {htmlToPreview(f.detail) || "—"}
          </span>
        ),
      },
      {
        key: "createdAt",
        header: "Created",
        render: (f) => formatDate(f.createdAt),
      },
    ],
    [],
  );

  const rows = items.filter((f) =>
    matchesQuery(query, f.id, f.name, htmlToPreview(f.detail, 400)),
  );

  return (
    <div className="flex flex-col gap-3.5">
      <PageHeader
        title="Files"
        description="File records. The detail field is authored with the rich text editor."
        action={
          <button className="btn-primary" onClick={openCreate}>
            + New file
          </button>
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
        rowKey={(f) => f.id}
        loading={loading}
        emptyMessage={query ? "No files match your search." : "No files yet."}
        actions={(f) => (
          <>
            <button className="btn-row" onClick={() => setPreview(f)}>
              View
            </button>
            <button className="btn-row" onClick={() => openEdit(f)}>
              Edit
            </button>
            <button
              className="btn-row text-red-600 hover:bg-red-50"
              onClick={() => setToDelete(f)}
            >
              Delete
            </button>
          </>
        )}
      />

      <Modal
        open={formOpen}
        title={isEdit ? "Edit file" : "New file"}
        onClose={() => setFormOpen(false)}
        wide
        footer={
          <>
            <button
              className="btn-secondary"
              onClick={() => setFormOpen(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              form="file-form"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create"}
            </button>
          </>
        }
      >
        <form id="file-form" onSubmit={submit} className="space-y-4">
          <Field
            label="Name"
            value={draft.name}
            error={errors.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
          <div>
            <span className="label">Detail</span>
            <RichTextEditor
              value={draft.detail}
              onChange={(html) => setDraft({ ...draft, detail: html })}
            />
            {errors.detail && (
              <p className="mt-1 text-xs text-red-600">{errors.detail}</p>
            )}
          </div>
        </form>
      </Modal>

      <Modal
        open={preview !== null}
        title={preview?.name ?? "File"}
        onClose={() => setPreview(null)}
        wide
      >
        <div
          className="rte-content max-w-none text-sm text-ink"
          dangerouslySetInnerHTML={{ __html: preview?.detail ?? "<p>—</p>" }}
        />
      </Modal>

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
