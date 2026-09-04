"use client";

import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Column, DataTable } from "@/components/DataTable";
import { Field } from "@/components/Field";
import { Modal } from "@/components/Modal";
import { PageHeader } from "@/components/PageHeader";
import { matchesQuery, useSearch } from "@/components/SearchContext";
import { useToast } from "@/components/Toast";
import { useResource } from "@/hooks/useResource";
import { ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Admin, FieldErrors } from "@/lib/types";
import { validateAdmin } from "@/lib/validation";

type Draft = { username: string; email: string; password: string };
const EMPTY: Draft = { username: "", email: "", password: "" };

export default function AdminsPage() {
  const { items, loading, error, create, update, remove } =
    useResource<Admin>("admins");
  const toast = useToast();
  const { query } = useSearch();

  const [editing, setEditing] = useState<Admin | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Admin | null>(null);

  const isEdit = editing !== null;

  const openCreate = () => {
    setEditing(null);
    setDraft(EMPTY);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (a: Admin) => {
    setEditing(a);
    setDraft({ username: a.username, email: a.email, password: "" });
    setErrors({});
    setFormOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientErrors = validateAdmin(draft, isEdit);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSaving(true);
    try {
      if (isEdit && editing) {
        const body: Record<string, unknown> = {
          username: draft.username.trim(),
          email: draft.email.trim(),
        };
        if (draft.password) body.password = draft.password;
        await update(editing.id, body);
        toast.success("Admin updated");
      } else {
        await create({
          username: draft.username.trim(),
          email: draft.email.trim(),
          password: draft.password,
        });
        toast.success("Admin created");
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
      toast.success("Admin deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed");
    } finally {
      setToDelete(null);
    }
  };

  const columns = useMemo<Column<Admin>[]>(
    () => [
      { key: "id", header: "ID", render: (a) => a.id, className: "w-16" },
      { key: "username", header: "Username", render: (a) => a.username },
      { key: "email", header: "Email", render: (a) => a.email },
      {
        key: "createdAt",
        header: "Created",
        render: (a) => formatDate(a.createdAt),
      },
    ],
    [],
  );

  const rows = items.filter((a) =>
    matchesQuery(query, a.id, a.username, a.email),
  );

  return (
    <div className="flex flex-col gap-3.5">
      <PageHeader
        title="Admins"
        description="Administrators who can sign in and manage the system."
        action={
          <button className="btn-primary" onClick={openCreate}>
            + New admin
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
        rowKey={(a) => a.id}
        loading={loading}
        emptyMessage={query ? "No admins match your search." : "No admins yet."}
        actions={(a) => (
          <>
            <button className="btn-row" onClick={() => openEdit(a)}>
              Edit
            </button>
            <button
              className="btn-row text-red-600 hover:bg-red-50"
              onClick={() => setToDelete(a)}
            >
              Delete
            </button>
          </>
        )}
      />

      <Modal
        open={formOpen}
        title={isEdit ? "Edit admin" : "New admin"}
        onClose={() => setFormOpen(false)}
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
              form="admin-form"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create"}
            </button>
          </>
        }
      >
        <form id="admin-form" onSubmit={submit} className="space-y-4">
          <Field
            label="Username"
            value={draft.username}
            error={errors.username}
            onChange={(e) => setDraft({ ...draft, username: e.target.value })}
          />
          <Field
            label="Email"
            type="email"
            value={draft.email}
            error={errors.email}
            onChange={(e) => setDraft({ ...draft, email: e.target.value })}
          />
          <Field
            label={isEdit ? "Password (leave blank to keep current)" : "Password"}
            type="password"
            value={draft.password}
            error={errors.password}
            onChange={(e) => setDraft({ ...draft, password: e.target.value })}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete admin"
        message={`Delete admin "${toDelete?.username}"? This cannot be undone. Admins that still own customers cannot be deleted.`}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
