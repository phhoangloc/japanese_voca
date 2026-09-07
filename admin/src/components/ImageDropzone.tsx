"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isImage } from "@/lib/image";

interface ImageDropzoneProps {
  /** Existing image URL to show as the current preview, or null. */
  value: string | null;
  /** Called with the newly picked File, or null when the image is cleared. */
  onChange: (file: File | null) => void;
  label?: string;
}

/**
 * Image upload box (initial idea: "supports both drag-and-drop and click").
 * It does not upload by itself — it hands the chosen File to the parent, which
 * POSTs it to `/api/files` on submit.
 */
export function ImageDropzone({ value, onChange, label }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  // Revoke the object URL we created once it is no longer shown.
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!isImage(file)) {
        setError("Please choose an image file.");
        return;
      }
      setError(null);
      setLocalPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
      onChange(file);
    },
    [onChange],
  );

  const clear = () => {
    setLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setError(null);
    onChange(null);
  };

  const preview = localPreview ?? value;

  return (
    <div>
      {label && <span className="label">{label}</span>}

      {preview ? (
        <div className="flex items-center gap-4 rounded-lg border border-line bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Selected"
            className="h-20 w-20 rounded-lg object-cover"
          />
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
            "flex w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-8 text-center text-sm transition-colors",
            dragging
              ? "border-brand-500 bg-brand-50 text-brand-700"
              : "border-line bg-paper text-ink-soft hover:border-brand-400 hover:bg-brand-50/40",
          ].join(" ")}
        >
          <span className="text-2xl" aria-hidden>
            🖼️
          </span>
          <span className="font-semibold">
            Drag &amp; drop an image, or click to browse
          </span>
          <span className="text-xs text-ink-faint">
            PNG, JPG, GIF, WebP — up to 10 MB
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
