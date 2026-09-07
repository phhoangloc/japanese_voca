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
import type { Chapter, FieldErrors, FileRecord, Word } from "@/lib/types";
import { validateWord } from "@/lib/validation";

interface Slot {
  existingUrl: string | null;
  existingName: string | null;
  existingId: number | null;
  file: File | null;
  dirty: boolean;
}
const EMPTY_SLOT: Slot = {
  existingUrl: null,
  existingName: null,
  existingId: null,
  file: null,
  dirty: false,
};

type SlotKey = "image" | "sound" | "readExplain";

interface Draft {
  word: string;
  explain: string;
  chapterId: string;
  image: Slot;
  sound: Slot;
  readExplain: Slot;
}
const EMPTY: Draft = {
  word: "",
  explain: "",
  chapterId: "",
  image: EMPTY_SLOT,
  sound: EMPTY_SLOT,
  readExplain: EMPTY_SLOT,
};

const SLOT_META: { key: SlotKey; label: string; accept?: string }[] = [
  { key: "image", label: "Image", accept: "image/*" },
  { key: "sound", label: "Sound", accept: "audio/*" },
  { key: "readExplain", label: "Read explain (audio)", accept: "audio/*" },
];

/** Create (`/words/new`) or edit (`/words/[id]/edit`) one word. */
export function WordForm({ wordId }: { wordId?: number }) {
  const isEdit = wordId != null;
  const router = useRouter();
  const toast = useToast();

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [files, chapterList, word] = await Promise.all([
          api.list<FileRecord>("files"),
          api.list<Chapter>("chapters"),
          isEdit ? api.get<Word>("words", wordId) : null,
        ]);
        if (!alive) return;
        setChapters(chapterList);
        if (word) {
          const slot = (id: number | null): Slot => {
            if (id == null) return EMPTY_SLOT;
            const f = files.find((x) => x.id === id) ?? null;
            return {
              existingUrl: resolveFileUrl(f?.detail ?? null),
              existingName: f?.name ?? `file #${id}`,
              existingId: id,
              file: null,
              dirty: false,
            };
          };
          setDraft({
            word: word.word,
            explain: word.explain ?? "",
            chapterId: word.chapterId == null ? "" : String(word.chapterId),
            image: slot(word.imageId),
            sound: slot(word.soundId),
            readExplain: slot(word.readExplainId),
          });
        }
      } catch (err) {
        if (alive) {
          setLoadError(
            err instanceof ApiError ? err.message : "Failed to load word",
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [wordId, isEdit]);

  const setSlot = (key: SlotKey, file: File | null) =>
    setDraft((d) => ({
      ...d,
      [key]: { ...d[key], file, dirty: true, existingUrl: null },
    }));

  const resolveSlotId = async (slot: Slot): Promise<number | null> => {
    if (!slot.dirty) return slot.existingId;
    if (!slot.file) return null;
    const created = await api.upload<FileRecord>("files", slot.file, {
      name: slot.file.name,
    });
    return created.id;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientErrors = validateWord(draft);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSaving(true);
    try {
      const [imageId, soundId, readExplainId] = await Promise.all([
        resolveSlotId(draft.image),
        resolveSlotId(draft.sound),
        resolveSlotId(draft.readExplain),
      ]);
      const body = {
        word: draft.word.trim(),
        explain: draft.explain.trim() === "" ? null : draft.explain.trim(),
        imageId,
        soundId,
        readExplainId,
        chapterId: draft.chapterId === "" ? null : Number(draft.chapterId),
      };

      if (isEdit) {
        await api.update("words", wordId, body);
        toast.success("Word updated");
      } else {
        await api.create("words", body);
        toast.success("Word created");
      }
      router.push("/words");
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
        title={isEdit ? "Edit word" : "New word"}
        description="A term, its explanation, and optional image / sound / spoken-explanation files."
        action={
          <Link href="/words" className="btn-secondary">
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
        <form onSubmit={submit} className="card max-w-3xl space-y-4 p-5">
          <Field
            label="Word"
            value={draft.word}
            error={errors.word}
            onChange={(e) => setDraft({ ...draft, word: e.target.value })}
          />
          <div>
            <label htmlFor="w-explain" className="label">
              Explain
            </label>
            <textarea
              id="w-explain"
              className="input min-h-[96px]"
              value={draft.explain}
              onChange={(e) => setDraft({ ...draft, explain: e.target.value })}
            />
            {errors.explain && (
              <p className="mt-1 text-xs text-red-600">{errors.explain}</p>
            )}
          </div>

          <SelectField
            label="Chapter (optional)"
            value={draft.chapterId}
            onChange={(e) => setDraft({ ...draft, chapterId: e.target.value })}
          >
            <option value="">— none —</option>
            {chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                #{ch.number} {ch.name}
              </option>
            ))}
          </SelectField>

          <div className="grid gap-4 sm:grid-cols-3">
            {SLOT_META.map(({ key, label, accept }) => (
              <FileDropzone
                key={key}
                label={label}
                accept={accept}
                value={draft[key].existingUrl}
                valueName={draft[key].existingName}
                onChange={(file) => setSlot(key, file)}
              />
            ))}
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Link href="/words" className="btn-secondary">
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
