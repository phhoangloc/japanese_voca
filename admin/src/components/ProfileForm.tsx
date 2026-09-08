"use client";

import { useEffect, useState } from "react";
import { Field } from "@/components/Field";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/Toast";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/client";
import type { Admin, FieldErrors } from "@/lib/types";
import { validateAdmin } from "@/lib/validation";

type Values = { username: string; email: string; password: string };
const EMPTY: Values = { username: "", email: "", password: "" };

/** Edit the signed-in administrator's own account (`/profile`). */
export function ProfileForm() {
  const { ready, adminId } = useAuth();
  const toast = useToast();

  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (adminId == null) {
      setLoadError("Could not identify the current account.");
      setLoading(false);
      return;
    }
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
            err instanceof ApiError ? err.message : "Failed to load profile",
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [ready, adminId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminId == null) return;

    const clientErrors = validateAdmin(values, true);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        username: values.username.trim(),
        email: values.email.trim(),
      };
      if (values.password) body.password = values.password;

      await api.update("admins", adminId, body);
      setValues({ ...values, password: "" });
      toast.success("Profile updated");
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

  return (
    <div className="flex flex-col gap-3.5">
      <PageHeader
        title="Profile"
        description="Update your own account details."
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
            label="Password (leave blank to keep current)"
            type="password"
            value={values.password}
            error={errors.password}
            onChange={(e) => setValues({ ...values, password: e.target.value })}
          />
          <div className="flex justify-end pt-2">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
