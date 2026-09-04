"use client";

import { useEffect, useRef } from "react";

function useEventCallback<A extends unknown[]>(fn: (...args: A) => void) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  return useRef((...args: A) => ref.current(...args)).current;
}

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  wide,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const stableClose = useEventCallback(onClose);

  // Runs only when `open` flips — not on every parent re-render — so it never
  // steals focus from an input the user is typing into.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stableClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, stableClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-night/45 p-4 sm:p-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={[
          "my-4 w-full rounded-xl bg-white outline-none",
          wide ? "max-w-3xl" : "max-w-lg",
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-6 pb-2 pt-5">
          <h2 className="text-lg font-extrabold tracking-tight text-ink">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="btn-ghost -mr-2 px-2 py-1 text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2.5 px-6 pb-6 pt-2">{footer}</div>
        )}
      </div>
    </div>
  );
}
