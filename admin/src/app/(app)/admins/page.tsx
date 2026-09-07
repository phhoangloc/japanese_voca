"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Column, DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { matchesQuery, useSearch } from "@/components/SearchContext";
import { useToast } from "@/components/Toast";
import { useResource } from "@/hooks/useResource";
import { ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Admin } from "@/lib/types";

export default function AdminsPage() {
  const { items, loading, error, remove } = useResource<Admin>("admins");
  const toast = useToast();
  const { query } = useSearch();

  const [toDelete, setToDelete] = useState<Admin | null>(null);

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
          <Link href="/admins/new" className="btn-primary">
            + New admin
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
        rowKey={(a) => a.id}
        loading={loading}
        emptyMessage={query ? "No admins match your search." : "No admins yet."}
        actions={(a) => (
          <>
            <Link href={`/admins/${a.id}/edit`} className="btn-row">
              Edit
            </Link>
            <button
              className="btn-row text-red-600 hover:bg-red-50"
              onClick={() => setToDelete(a)}
            >
              Delete
            </button>
          </>
        )}
      />

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
