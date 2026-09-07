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
import { formatDate, initials } from "@/lib/format";
import type { Admin, Customer, FileRecord } from "@/lib/types";

export default function CustomersPage() {
  const { items, loading, error, remove } = useResource<Customer>("customers");
  const toast = useToast();
  const { query } = useSearch();

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [a, f] = await Promise.all([
          api.list<Admin>("admins"),
          api.list<FileRecord>("files"),
        ]);
        if (!alive) return;
        setAdmins(a);
        setFiles(f);
      } catch {
        /* the table already surfaces load errors */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const [toDelete, setToDelete] = useState<Customer | null>(null);

  const avatarUrl = (id: number | null) =>
    id == null
      ? null
      : resolveFileUrl(files.find((f) => f.id === id)?.detail ?? null);
  const adminName = (id: number) =>
    admins.find((a) => a.id === id)?.username ?? `#${id}`;

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
      { key: "admin", header: "Owner", render: (c) => adminName(c.adminId) },
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
          admins.length === 0 ? (
            <button
              className="btn-primary"
              disabled
              title="Create an admin first — every customer needs an owner"
            >
              + New customer
            </button>
          ) : (
            <Link href="/customers/new" className="btn-primary">
              + New customer
            </Link>
          )
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
            <Link href={`/customers/${c.id}/edit`} className="btn-row">
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
        title="Delete customer"
        message={`Delete customer "${toDelete?.username}"? This cannot be undone.`}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
