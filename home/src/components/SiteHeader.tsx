import Link from "next/link";

interface SiteHeaderProps {
  backHref?: string;
  backLabel?: string;
}

/** The 用語ー図書館 wordmark bar, shared by every page. */
export function SiteHeader({ backHref, backLabel }: SiteHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-black/10 px-6 py-5 sm:px-12">
      <Link href="/" className="flex items-baseline gap-2.5 text-ink">
        <span className="font-display text-[30px] font-extrabold">
          用語ー図書館
        </span>
        <span className="hidden text-[12px] tracking-[0.04em] text-ink-soft sm:inline">
          日本語を食べたい
        </span>
      </Link>
      {backHref && (
        <Link
          href={backHref}
          className="btn-pill border border-black/20 text-ink"
        >
          ← {backLabel ?? "戻る"}
        </Link>
      )}
    </header>
  );
}
