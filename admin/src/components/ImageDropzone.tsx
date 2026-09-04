"use client";

import { useCallback, useRef, useState } from "react";
import { fileToDownscaledDataUrl, isImage } from "@/lib/image";

interface ImageDropzoneProps {
  /** Current image as a data/URL string, or null. */
  value: string | null;
  /** Called with the new data URL, or null when cleared. */
  onChange: (dataUrl: string | null) => void;
  label?: string;
}

/**
 * FR-7: image upload box. Accepts a drop and a click (opens the OS picker).
 * Downscales the chosen image and emits a data URL.
 */
export function ImageDropzone({ value, onChange, label }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      if (!isImage(file)) {
        setError("Please choose an image file.");
        return;
      }
      setError(null);
      setBusy(true);
      try {
        onChange(await fileToDownscaledDataUrl(file));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not read image.");
      } finally {
        setBusy(false);
      }
    },
    [onChange],
  );

  return (
    <div>
      {label && <span className="label">{label}</span>}

      {value ? (
        <div className="flex items-center gap-4 rounded-lg border border-line bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
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
              onClick={() => onChange(null)}
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
            void handleFile(e.dataTransfer.files?.[0]);
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
            {busy ? "Processing…" : "Drag & drop an image, or click to browse"}
          </span>
          <span className="text-xs text-ink-faint">
            PNG, JPG, GIF, WebP — downscaled to 512 px
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
