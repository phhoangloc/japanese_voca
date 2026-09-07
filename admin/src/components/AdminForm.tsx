"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Field } from "@/components/Field";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/Toast";
import { ApiError } from "@/lib/api";
import { api } from "@/lib/client";
import type { Admin, FieldErrors } from "@/lib/types";
import { validateAdmin } from "@/lib/validation";

type Values = { username: string; email: string; password: string };
const EMPTY: Values = { username: "", email: "", password: "" };

/** Create (`/admins/new`) or edit (`/admins/[id]/edit`) one administrator. */
export function AdminForm({ adminId }: { adminId?: number }) {
  const isEdit = adminId != null;
  const router = useRouter();
  const toast = useToast();

  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    let alive = true;
    (async () => {
      try {
        const a = await api.get<Admin>("admins", adminId);
        if (alive) {
          setValues({ username: a.username, email: a.email, password: "" });
        }
      } catch (err) {
        if (alive) {
          setLoadError(
            err instanceof ApiError ? err.message : "Failed to load admin",
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [adminId, isEdit]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientErrors = validateAdmin(values, isEdit);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        username: values.username.trim(),
        email: values.email.trim(),
      };
      if (values.password) body.password = values.password;

      if (isEdit) {
        await api.update("admins", adminId, body);
        toast.success("Admin updated");
      } else {
        await api.create("admins", { ...body, password: values.password });
        toast.success("Admin created");
      }
      router.push("/admins");
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

  return (
    <div className="flex flex-col gap-3.5">
      <PageHeader
        title={isEdit ? "Edit admin" : "New admin"}
        description={
          isEdit
            ? "Update this administrator's details."
            : "Add an administrator who can sign in and manage the system."
        }
        action={
          <Link href="/admins" className="btn-secondary">
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
      ) : (
        <form onSubmit={submit} className="card max-w-xl space-y-4 p-5">
          <Field
            label="Username"
            value={values.username}
            error={errors.username}
            onChange={(e) => setValues({ ...values, username: e.target.value })}
          />
          <Field
            label="Email"
            type="email"
            value={values.email}
            error={errors.email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
          />
          <Field
            label={
              isEdit ? "Password (leave blank to keep current)" : "Password"
            }
            type="password"
            value={values.password}
            error={errors.password}
            onChange={(e) => setValues({ ...values, password: e.target.value })}
          />
          <div className="flex justify-end gap-2.5 pt-2">
            <Link href="/admins" className="btn-secondary">
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
