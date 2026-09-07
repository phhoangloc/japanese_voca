"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isImageDetail } from "@/lib/files";
import { isImage } from "@/lib/image";

interface FileDropzoneProps {
  label?: string;
  /** URL of the currently-linked file (for preview), or null. */
  value: string | null;
  /** Name of the currently-linked file, shown when it is not an image. */
  valueName?: string | null;
  /** Called with the newly picked File, or null when cleared. */
  onChange: (file: File | null) => void;
  /** `accept` attribute for the picker (default: any file). */
  accept?: string;
}

/**
 * Upload box for any file type. Drag-and-drop **and** click to browse.
 * Shows an image preview when the file is an image, otherwise its name
 * (word-idea.md: "if link is image show image, if not show name").
 */
export function FileDropzone({
  label,
  value,
  valueName,
  onChange,
  accept,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [picked, setPicked] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      setPicked(file);
      setLocalPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return isImage(file) ? URL.createObjectURL(file) : null;
      });
      onChange(file);
    },
    [onChange],
  );

  const clear = () => {
    setPicked(null);
    setLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    onChange(null);
  };

  const hasSelection = picked !== null || value !== null;
  const showImage = picked ? localPreview !== null : isImageDetail(value);
  const imageSrc = picked ? localPreview : value;
  const name = picked ? picked.name : valueName ?? "Attached file";

  return (
    <div>
      {label && <span className="label">{label}</span>}

      {hasSelection ? (
        <div className="flex items-center gap-4 rounded-lg border border-line bg-white p-3">
          {showImage && imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={name}
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-line-faint text-2xl">
              📄
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{name}</p>
            {imageSrc && !showImage && (
              <a
                href={imageSrc}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-brand-600 hover:underline"
              >
                Open file
              </a>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </button>
            <button
              type="button"
              className="btn-ghost text-red-600 hover:bg-red-50"
              onClick={clear}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={[
            "flex w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-6 text-center text-sm transition-colors",
            dragging
              ? "border-brand-500 bg-brand-50 text-brand-700"
              : "border-line bg-paper text-ink-soft hover:border-brand-400 hover:bg-brand-50/40",
          ].join(" ")}
        >
          <span className="text-xl" aria-hidden>
            ⬆️
          </span>
          <span className="font-semibold">
            Drag &amp; drop a file, or click to browse
          </span>
          <span className="text-xs text-ink-faint">up to 10 MB</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
