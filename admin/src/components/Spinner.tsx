export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-ink-soft">
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-brand-600"
        aria-hidden
      />
      {label ?? "Loading…"}
    </div>
  );
}
