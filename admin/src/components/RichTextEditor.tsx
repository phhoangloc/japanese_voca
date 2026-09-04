"use client";

import { useEffect, useRef, useState } from "react";
import { fileToDownscaledDataUrl, isImage } from "@/lib/image";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

type Cmd =
  | { kind: "block"; tag: string; label: string; title: string }
  | { kind: "inline"; command: string; label: string; title: string };

const COMMANDS: Cmd[] = [
  { kind: "block", tag: "h1", label: "H1", title: "Heading 1" },
  { kind: "block", tag: "h2", label: "H2", title: "Heading 2" },
  { kind: "block", tag: "h3", label: "H3", title: "Heading 3" },
  { kind: "block", tag: "h4", label: "H4", title: "Heading 4" },
  { kind: "block", tag: "h5", label: "H5", title: "Heading 5" },
  { kind: "block", tag: "p", label: "¶", title: "Paragraph" },
  { kind: "inline", command: "bold", label: "B", title: "Bold" },
  { kind: "inline", command: "italic", label: "I", title: "Italic" },
  { kind: "inline", command: "underline", label: "U", title: "Underline" },
];

/**
 * FR-8: lightweight rich text editor over contentEditable + execCommand.
 * Produces an HTML string. Uploaded images are downscaled and inserted at the
 * caret.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something…",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [busy, setBusy] = useState(false);

  // Seed the editable once (and when an external value replaces it, e.g. opening
  // a different record). Avoid overwriting while the user is typing.
  useEffect(() => {
    const el = editorRef.current;
    if (el && el.innerHTML !== value && document.activeElement !== el) {
      el.innerHTML = value ?? "";
    }
  }, [value]);

  const emit = () => onChange(editorRef.current?.innerHTML ?? "");

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        savedRange.current = range.cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    if (savedRange.current) {
      sel.addRange(savedRange.current);
    } else {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      sel.addRange(range);
    }
  };

  const run = (fn: () => void) => {
    restoreSelection();
    fn();
    saveSelection();
    emit();
  };

  const applyCommand = (cmd: Cmd) => {
    run(() => {
      if (cmd.kind === "block") {
        document.execCommand("formatBlock", false, cmd.tag.toUpperCase());
      } else {
        document.execCommand(cmd.command, false);
      }
    });
  };

  const addLink = () => {
    const url = window.prompt("Link URL", "https://");
    if (!url) return;
    run(() => document.execCommand("createLink", false, url));
  };

  const addImageUrl = () => {
    const url = window.prompt("Image URL", "https://");
    if (!url) return;
    run(() => document.execCommand("insertImage", false, url));
  };

  const addImageUpload = async (file: File | undefined) => {
    if (!file) return;
    if (!isImage(file)) return;
    setBusy(true);
    try {
      const dataUrl = await fileToDownscaledDataUrl(file);
      run(() => document.execCommand("insertImage", false, dataUrl));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border border-line bg-white">
      <div
        className="flex flex-wrap items-center gap-1 border-b border-line-soft px-2 py-1.5"
        onMouseDown={(e) => {
          // keep the caret inside the editor when a toolbar button is pressed
          e.preventDefault();
        }}
      >
        {COMMANDS.map((cmd) => (
          <button
            key={cmd.label}
            type="button"
            title={cmd.title}
            onClick={() => applyCommand(cmd)}
            className="rounded px-2 py-1 text-sm font-semibold text-ink-soft hover:bg-line-faint"
          >
            {cmd.label}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-line-soft" />
        <button
          type="button"
          title="Insert link"
          onClick={addLink}
          className="rounded px-2 py-1 text-sm text-ink-soft hover:bg-line-faint"
        >
          🔗
        </button>
        <button
          type="button"
          title="Insert image by URL"
          onClick={addImageUrl}
          className="rounded px-2 py-1 text-sm text-ink-soft hover:bg-line-faint"
        >
          🌐🖼️
        </button>
        <button
          type="button"
          title="Upload image at cursor"
          onClick={() => {
            saveSelection();
            fileRef.current?.click();
          }}
          className="rounded px-2 py-1 text-sm text-ink-soft hover:bg-line-faint"
        >
          {busy ? "⏳" : "⬆️🖼️"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void addImageUpload(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={() => {
          saveSelection();
          emit();
        }}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        className="rte-content min-h-[180px] max-w-none px-3 py-2 text-sm text-ink focus:outline-none"
      />
    </div>
  );
}
