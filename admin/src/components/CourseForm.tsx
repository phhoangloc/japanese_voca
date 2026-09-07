"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { Field } from "@/components/Field";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/Toast";
import { ApiError } from "@/lib/api";
import { api } from "@/lib/client";
import { resolveFileUrl } from "@/lib/files";
import type { Course, FieldErrors, FileRecord } from "@/lib/types";
import { validateCourse } from "@/lib/validation";

interface Draft {
  name: string;
  imageUrl: string | null;
  imageName: string | null;
  imageId: number | null;
  imageFile: File | null;
  imageDirty: boolean;
}
const EMPTY: Draft = {
  name: "",
  imageUrl: null,
  imageName: null,
  imageId: null,
  imageFile: null,
  imageDirty: false,
};

/** Create (`/courses/new`) or edit (`/courses/[id]/edit`) one course. */
export function CourseForm({ courseId }: { courseId?: number }) {
  const isEdit = courseId != null;
  const router = useRouter();
  const toast = useToast();

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    let alive = true;
    (async () => {
      try {
        const [course, files] = await Promise.all([
          api.get<Course>("courses", courseId),
          api.list<FileRecord>("files"),
        ]);
        if (!alive) return;
        const f =
          course.imageId == null
            ? null
            : files.find((x) => x.id === course.imageId) ?? null;
        setDraft({
          name: course.name,
          imageUrl: resolveFileUrl(f?.detail ?? null),
          imageName: f?.name ?? (course.imageId ? `file #${course.imageId}` : null),
          imageId: course.imageId,
          imageFile: null,
          imageDirty: false,
        });
      } catch (err) {
        if (alive) {
          setLoadError(
            err instanceof ApiError ? err.message : "Failed to load course",
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [courseId, isEdit]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientErrors = validateCourse(draft);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSaving(true);
    try {
      let imageId = draft.imageId;
      if (draft.imageDirty) {
        imageId = draft.imageFile
          ? (await api.upload<FileRecord>("files", draft.imageFile, {
              name: draft.imageFile.name,
            })).id
          : null;
      }
      const body = { name: draft.name.trim(), imageId };

      if (isEdit) {
        await api.update("courses", courseId, body);
        toast.success("Course updated");
      } else {
        await api.create("courses", body);
        toast.success("Course created");
      }
      router.push("/courses");
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
        title={isEdit ? "Edit course" : "New course"}
        description="A course groups chapters. It has a name and an optional cover image."
        action={
          <Link href="/courses" className="btn-secondary">
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
            label="Name"
            value={draft.name}
            error={errors.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
          <FileDropzone
            label="Cover image"
            accept="image/*"
            value={draft.imageUrl}
            valueName={draft.imageName}
            onChange={(file) =>
              setDraft({
                ...draft,
                imageFile: file,
                imageUrl: null,
                imageDirty: true,
              })
            }
          />
          <div className="flex justify-end gap-2.5 pt-2">
            <Link href="/courses" className="btn-secondary">
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
