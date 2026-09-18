"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { Field, SelectField } from "@/components/Field";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/Toast";
import { ApiError } from "@/lib/api";
import { api } from "@/lib/client";
import { resolveFileUrl } from "@/lib/files";
import { htmlToPreview } from "@/lib/format";
import type {
  Chapter,
  Course,
  FieldErrors,
  FileRecord,
  Word,
} from "@/lib/types";
import { validateChapter } from "@/lib/validation";

interface Draft {
  number: string;
  name: string;
  courseId: string;
  imageUrl: string | null;
  imageName: string | null;
  imageId: number | null;
  imageFile: File | null;
  imageDirty: boolean;
}
const EMPTY: Draft = {
  number: "1",
  name: "",
  courseId: "",
  imageUrl: null,
  imageName: null,
  imageId: null,
  imageFile: null,
  imageDirty: false,
};

/** Create (`/chapters/new`) or edit (`/chapters/[id]/edit`) one chapter. */
export function ChapterForm({ chapterId }: { chapterId?: number }) {
  const isEdit = chapterId != null;
  const router = useRouter();
  const toast = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [words, setWords] = useState<Word[] | null>(null);
  useEffect(() => {
    if (!isEdit) return;
    let alive = true;
    (async () => {
      try {
        const all = await api.list<Word>("words");
        if (alive) setWords(all.filter((w) => w.chapterId === chapterId));
      } catch {
        /* the section below just stays empty on failure */
      }
    })();
    return () => {
      alive = false;
    };
  }, [chapterId, isEdit]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [courseList, files, chapter] = await Promise.all([
          api.list<Course>("courses"),
          api.list<FileRecord>("files"),
          isEdit ? api.get<Chapter>("chapters", chapterId) : null,
        ]);
        if (!alive) return;
        setCourses(courseList);
        if (chapter) {
          const f =
            chapter.imageId == null
              ? null
              : files.find((x) => x.id === chapter.imageId) ?? null;
          setDraft({
            number: String(chapter.number),
            name: chapter.name,
            courseId: String(chapter.courseId),
            imageUrl: resolveFileUrl(f?.detail ?? null),
            imageName:
              f?.name ?? (chapter.imageId ? `file #${chapter.imageId}` : null),
            imageId: chapter.imageId,
            imageFile: null,
            imageDirty: false,
          });
        } else {
          setDraft((d) => ({
            ...d,
            courseId: courseList[0] ? String(courseList[0].id) : "",
          }));
        }
      } catch (err) {
        if (alive) {
          setLoadError(
            err instanceof ApiError ? err.message : "Failed to load chapter",
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [chapterId, isEdit]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientErrors = validateChapter(draft);
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
      const body = {
        number: Number(draft.number),
        name: draft.name.trim(),
        courseId: Number(draft.courseId),
        imageId,
      };

      if (isEdit) {
        await api.update("chapters", chapterId, body);
        toast.success("Chapter updated");
      } else {
        await api.create("chapters", body);
        toast.success("Chapter created");
      }
      router.push("/chapters");
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

  const noCourses = !isEdit && courses.length === 0;

  return (
    <div className="flex flex-col gap-3.5">
      <PageHeader
        title={isEdit ? "Edit chapter" : "New chapter"}
        description="A chapter belongs to a course. It has a number, a name and an optional image."
        action={
          <Link href="/chapters" className="btn-secondary">
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
      ) : noCourses ? (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          There are no courses yet. <Link href="/courses/new">Add a course</Link>{" "}
          before creating chapters.
        </p>
      ) : (
        <form onSubmit={submit} className="card space-y-4 p-5">
          <FileDropzone
            label="Image"
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

          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Number"
              type="number"
              min={0}
              value={draft.number}
              error={errors.number}
              onChange={(e) => setDraft({ ...draft, number: e.target.value })}
            />
            <Field
              label="Name"
              value={draft.name}
              error={errors.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
            <SelectField
              label="Course"
              value={draft.courseId}
              error={errors.courseId}
              onChange={(e) =>
                setDraft({ ...draft, courseId: e.target.value })
              }
            >
              <option value="">Select a course…</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (#{c.id})
                </option>
              ))}
            </SelectField>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Link href="/chapters" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      )}

      {isEdit && !loading && !loadError && (
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">
              Words in this chapter{words ? ` (${words.length})` : ""}
            </h2>
            <Link
              href={`/words/new?chapterId=${chapterId}`}
              className="btn-secondary"
            >
              + New word
            </Link>
          </div>

          {words === null ? (
            <p className="text-sm text-ink-soft">Loading…</p>
          ) : words.length === 0 ? (
            <p className="text-sm text-ink-soft">No words in this chapter yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {words.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between gap-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{w.word}</p>
                    <p className="truncate text-sm text-ink-soft">
                      {htmlToPreview(w.explain, 90) || "—"}
                    </p>
                  </div>
                  <Link
                    href={`/words/${w.id}/edit`}
                    className="btn-row shrink-0"
                  >
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
