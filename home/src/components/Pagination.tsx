import type { ReactNode } from "react";

interface PaginationProps {
  /** 1-based current page. */
  page: number;
  /** Total number of pages. */
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Pass both to show an "X–Y / Z" summary on the left. */
  totalItems?: number;
  pageSize?: number;
  className?: string;
}

/** Compact page list with gaps: 1 … 4 5 [6] 7 8 … 20 */
function pageWindow(page: number, pageCount: number): (number | "gap")[] {
  const siblings = 1;
  const left = Math.max(2, page - siblings);
  const right = Math.min(pageCount - 1, page + siblings);

  const out: (number | "gap")[] = [1];
  if (left > 2) out.push("gap");
  for (let i = left; i <= right; i += 1) out.push(i);
  if (right < pageCount - 1) out.push("gap");
  if (pageCount > 1) out.push(pageCount);
  return out;
}

const cell =
  "inline-flex min-w-[34px] items-center justify-center rounded-lg border " +
  "border-line bg-white/60 px-2.5 py-1.5 text-[13px] font-semibold text-ink " +
  "transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40";

/**
 * Controlled pager. The parent owns `page` and slices its own rows (see
 * usePagination); this only renders the controls. Renders nothing when the
 * list is empty or fits on a single page.
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  totalItems,
  pageSize,
  className,
}: PaginationProps) {
  if (pageCount <= 1 || totalItems === 0) return null;

  const go = (n: number) => {
    const next = Math.min(Math.max(n, 1), pageCount);
    if (next !== page) onPageChange(next);
  };

  const summary: ReactNode =
    totalItems != null && pageSize != null ? (
      <span className="text-[12px] text-ink-faint">
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalItems)} /{" "}
        {totalItems}
      </span>
    ) : (
      <span />
    );

  return (
    <nav
      className={["flex items-center justify-between gap-3", className ?? ""].join(
        " ",
      )}
      aria-label="ページ送り"
    >
      {summary}

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className={cell}
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          aria-label="前のページ"
        >
          ← 前
        </button>

        {pageWindow(page, pageCount).map((p, i) =>
          p === "gap" ? (
            <span
              key={`gap-${i}`}
              className="px-1 text-xs text-ink-faint"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => go(p)}
              aria-current={p === page ? "page" : undefined}
              className={[
                cell,
                p === page
                  ? "border-accent bg-accent text-[oklch(0.97_0.006_80)] hover:bg-accent"
                  : "",
              ].join(" ")}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          className={cell}
          onClick={() => go(page + 1)}
          disabled={page >= pageCount}
          aria-label="次のページ"
        >
          次 →
        </button>
      </div>
    </nav>
  );
}
