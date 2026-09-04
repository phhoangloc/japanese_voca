"use client";

import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Column, DataTable } from "@/components/DataTable";
import { Field, SelectField } from "@/components/Field";
import { ImageDropzone } from "@/components/ImageDropzone";
import { Modal } from "@/components/Modal";
import { PageHeader } from "@/components/PageHeader";
import { matchesQuery, useSearch } from "@/components/SearchContext";
import { useToast } from "@/components/Toast";
import { useResource } from "@/hooks/useResource";
import { ApiError } from "@/lib/api";
import { api } from "@/lib/client";
import { formatDate, initials } from "@/lib/format";
import type { Admin, Customer, FieldErrors, FileRecord } from "@/lib/types";
import { validateCustomer } from "@/lib/validation";

interface Draft {
  username: string;
  email: string;
  password: string;
  point: string;
  adminId: string;
  avatar: string | null;
  avatarDirty: boolean;
}

const EMPTY: Draft = {
  username: "",
  email: "",
  password: "",
  point: "0",
  adminId: "",
  avatar: null,
  avatarDirty: false,
};

export default function CustomersPage() {
  const { items, loading, error, create, update, remove } =
    useResource<Customer>("customers");
  const toast = useToast();
  const { query } = useSearch();

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);

  const loadRefs = async () => {
    try {
      const [a, f] = await Promise.all([
        api.list<Admin>("admins"),
        api.list<FileRecord>("files"),
      ]);
      setAdmins(a);
      setFiles(f);
    } catch {
      /* surfaced by the table error already */
    }
  };
  useEffect(() => {
    void loadRefs();
  }, []);

  const [editing, setEditing] = useState<Customer | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Customer | null>(null);

  const isEdit = editing !== null;
  const avatarUrl = (id: number | null) =>
    id == null ? null : files.find((f) => f.id === id)?.detail ?? null;
  const adminName = (id: number) =>
    admins.find((a) => a.id === id)?.username ?? `#${id}`;

  const openCreate = () => {
    setEditing(null);
    setDraft({ ...EMPTY, adminId: admins[0] ? String(admins[0].id) : "" });
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setDraft({
      username: c.username,
      email: c.email,
      password: "",
      point: String(c.point),
      adminId: String(c.adminId),
      avatar: avatarUrl(c.avatarId),
      avatarDirty: false,
    });
    setErrors({});
    setFormOpen(true);
  };

  const resolveAvatarId = async (): Promise<number | null | undefined> => {
    if (!draft.avatarDirty) return editing ? editing.avatarId : null;
    if (!draft.avatar) return null;
    const created = await api.create<FileRecord>("files", {
      name: `avatar-${draft.username.trim() || "customer"}`,
      detail: draft.avatar,
    });
    return created.id;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientErrors = validateCustomer(draft, isEdit);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSaving(true);
    try {
      const avatarId = await resolveAvatarId();
      const body: Record<string, unknown> = {
        username: draft.username.trim(),
        email: draft.email.trim(),
        adminId: Number(draft.adminId),
        point: draft.point.trim() === "" ? 0 : Number(draft.point),
        avatarId: avatarId ?? null,
      };
      if (draft.password) body.password = draft.password;

      if (isEdit && editing) {
        await update(editing.id, body);
        toast.success("Customer updated");
      } else {
        await create({ ...body, password: draft.password });
        toast.success("Customer created");
      }
      await loadRefs();
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
      toast.success("Customer deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed");
    } finally {
      setToDelete(null);
    }
  };

  const columns = useMemo<Column<Customer>[]>(
    () => [
      {
        key: "avatar",
        header: "",
        className: "w-14",
        render: (c) => {
          const url = avatarUrl(c.avatarId);
          return url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={c.username}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-line-faint text-xs font-bold text-ink-soft">
              {initials(c.username)}
            </span>
          );
        },
      },
      { key: "id", header: "ID", render: (c) => c.id, className: "w-14" },
      { key: "username", header: "Username", render: (c) => c.username },
      { key: "email", header: "Email", render: (c) => c.email },
      {
        key: "point",
        header: "Points",
        render: (c) => (
          <span className={`pill ${c.point > 0 ? "pill-green" : "pill-gray"}`}>
            {c.point} pts
          </span>
        ),
      },
      {
        key: "admin",
        header: "Owner",
        render: (c) => adminName(c.adminId),
      },
      {
        key: "createdAt",
        header: "Created",
        render: (c) => formatDate(c.createdAt),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [admins, files],
  );

  const rows = items.filter((c) =>
    matchesQuery(query, c.id, c.username, c.email, c.point, adminName(c.adminId)),
  );

  return (
    <div className="flex flex-col gap-3.5">
      <PageHeader
        title="Customers"
        description="Customer records, their loyalty points, owning admin and avatar."
        action={
          <button
            className="btn-primary"
            onClick={openCreate}
            disabled={admins.length === 0}
            title={
              admins.length === 0
                ? "Create an admin first — every customer needs an owner"
                : undefined
            }
          >
            + New customer
          </button>
        }
      />

      {admins.length === 0 && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          There are no admins yet. Add an admin before creating customers.
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
        rowKey={(c) => c.id}
        loading={loading}
        emptyMessage={
          query ? "No customers match your search." : "No customers yet."
        }
        actions={(c) => (
          <>
            <button className="btn-row" onClick={() => openEdit(c)}>
              Edit
            </button>
            <button
              className="btn-row text-red-600 hover:bg-red-50"
              onClick={() => setToDelete(c)}
            >
              Delete
            </button>
          </>
        )}
      />

      <Modal
        open={formOpen}
        title={isEdit ? "Edit customer" : "New customer"}
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
              form="customer-form"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create"}
            </button>
          </>
        }
      >
        <form
          id="customer-form"
          onSubmit={submit}
          className="grid gap-4 sm:grid-cols-2"
        >
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
            label={isEdit ? "Password (blank = keep)" : "Password"}
            type="password"
            value={draft.password}
            error={errors.password}
            onChange={(e) => setDraft({ ...draft, password: e.target.value })}
          />
          <Field
            label="Points"
            type="number"
            min={0}
            value={draft.point}
            error={errors.point}
            onChange={(e) => setDraft({ ...draft, point: e.target.value })}
          />
          <SelectField
            label="Owning admin"
            value={draft.adminId}
            error={errors.adminId}
            onChange={(e) => setDraft({ ...draft, adminId: e.target.value })}
          >
            <option value="">Select an admin…</option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>
                {a.username} (#{a.id})
              </option>
            ))}
          </SelectField>
          <div className="sm:col-span-2">
            <ImageDropzone
              label="Avatar"
              value={draft.avatar}
              onChange={(dataUrl) =>
                setDraft({ ...draft, avatar: dataUrl, avatarDirty: true })
              }
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete customer"
        message={`Delete customer "${toDelete?.username}"? This cannot be undone.`}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
