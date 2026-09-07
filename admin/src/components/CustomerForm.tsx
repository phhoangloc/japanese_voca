"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Field, SelectField } from "@/components/Field";
import { ImageDropzone } from "@/components/ImageDropzone";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/Toast";
import { ApiError } from "@/lib/api";
import { api } from "@/lib/client";
import { resolveFileUrl } from "@/lib/files";
import type { Admin, Customer, FieldErrors, FileRecord } from "@/lib/types";
import { validateCustomer } from "@/lib/validation";

interface Draft {
  username: string;
  email: string;
  password: string;
  point: string;
  adminId: string;
  avatar: string | null;
  avatarFile: File | null;
  avatarDirty: boolean;
}

const EMPTY: Draft = {
  username: "",
  email: "",
  password: "",
  point: "0",
  adminId: "",
  avatar: null,
  avatarFile: null,
  avatarDirty: false,
};

/** Create (`/customers/new`) or edit (`/customers/[id]/edit`) one customer. */
export function CustomerForm({ customerId }: { customerId?: number }) {
  const isEdit = customerId != null;
  const router = useRouter();
  const toast = useToast();

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [existingAvatarId, setExistingAvatarId] = useState<number | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [adminList, fileList, customer] = await Promise.all([
          api.list<Admin>("admins"),
          api.list<FileRecord>("files"),
          isEdit ? api.get<Customer>("customers", customerId) : null,
        ]);
        if (!alive) return;
        setAdmins(adminList);
        if (customer) {
          const avatarDetail =
            customer.avatarId == null
              ? null
              : fileList.find((f) => f.id === customer.avatarId)?.detail ?? null;
          setExistingAvatarId(customer.avatarId);
          setDraft({
            username: customer.username,
            email: customer.email,
            password: "",
            point: String(customer.point),
            adminId: String(customer.adminId),
            avatar: resolveFileUrl(avatarDetail),
            avatarFile: null,
            avatarDirty: false,
          });
        } else {
          setDraft((d) => ({
            ...d,
            adminId: adminList[0] ? String(adminList[0].id) : "",
          }));
        }
      } catch (err) {
        if (alive) {
          setLoadError(
            err instanceof ApiError ? err.message : "Failed to load customer",
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [customerId, isEdit]);

  const resolveAvatarId = async (): Promise<number | null> => {
    if (!draft.avatarDirty) return existingAvatarId;
    if (!draft.avatarFile) return null;
    const created = await api.upload<FileRecord>("files", draft.avatarFile, {
      name: `avatar-${draft.username.trim() || "customer"}`,
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
        avatarId,
      };
      if (draft.password) body.password = draft.password;

      if (isEdit) {
        await api.update("customers", customerId, body);
        toast.success("Customer updated");
      } else {
        await api.create("customers", { ...body, password: draft.password });
        toast.success("Customer created");
      }
      router.push("/customers");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details) setErrors(err.details);
        else toast.error(err.message);
      } else {
        toast.error("Something went wrong");
      }
      setSaving(false);
    }
  };

  const noAdmins = !isEdit && admins.length === 0;

  return (
    <div className="flex flex-col gap-3.5">
      <PageHeader
        title={isEdit ? "Edit customer" : "New customer"}
        description="Customer details, loyalty points, owning admin and avatar."
        action={
          <Link href="/customers" className="btn-secondary">
            Back
          </Link>
        }
      />

      {loadError ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </p>
      ) : loading ? (
        <p className="text-sm text-ink-soft">Loading…</p>
      ) : noAdmins ? (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          There are no admins yet. <Link href="/admins/new">Add an admin</Link>{" "}
          before creating customers.
        </p>
      ) : (
        <form
          onSubmit={submit}
          className="card grid max-w-3xl gap-4 p-5 sm:grid-cols-2"
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
              onChange={(file) =>
                setDraft({
                  ...draft,
                  avatarFile: file,
                  avatar: null,
                  avatarDirty: true,
                })
              }
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2 sm:col-span-2">
            <Link href="/customers" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
