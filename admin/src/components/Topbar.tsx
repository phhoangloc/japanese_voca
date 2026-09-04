"use client";

import { useAuth } from "@/lib/auth";
import { initials } from "@/lib/format";
import { useSearch } from "./SearchContext";

interface TopbarProps {
  onMenu: () => void;
}

export function Topbar({ onMenu }: TopbarProps) {
  const { username } = useAuth();
  const { query, setQuery } = useSearch();
  const name = username ?? "admin";

  return (
    <header className="flex items-center gap-3.5">
      <button
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink lg:hidden"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        ☰
      </button>

      <div className="flex flex-1 items-center gap-2.5 rounded-xl bg-white px-4 py-[11px]">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="oklch(0.6 0.01 150)"
          strokeWidth="1.5"
        >
          <circle cx="7" cy="7" r="5" />
          <path d="M11 11l3.5 3.5" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="flex-1 border-none bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="rounded-md border border-line-soft px-1.5 text-xs text-ink-faint hover:bg-line-faint"
            aria-label="Clear search"
          >
            Clear
          </button>
        )}
      </div>

      <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-white sm:flex">
        <svg
          width="17"
          height="17"
          viewBox="0 0 16 16"
          fill="none"
          stroke="oklch(0.4 0.01 150)"
          strokeWidth="1.4"
        >
          <rect x="1.5" y="3" width="13" height="10" rx="2" />
          <path d="M2 4l6 4.5L14 4" strokeLinecap="round" />
        </svg>
      </div>
      <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-white sm:flex">
        <svg
          width="17"
          height="17"
          viewBox="0 0 16 16"
          fill="none"
          stroke="oklch(0.4 0.01 150)"
          strokeWidth="1.4"
        >
          <path d="M8 1.5c-2 0-3.2 1.6-3.2 3.6v2.4c0 .8-.3 1.5-.9 2.2l-.6.7h9.4l-.6-.7c-.6-.7-.9-1.4-.9-2.2V5.1c0-2-1.2-3.6-3.2-3.6z" />
          <path d="M6.3 12.5a1.7 1.7 0 003.4 0" />
        </svg>
      </div>

      <div className="flex items-center gap-2.5 rounded-xl bg-white py-1.5 pl-2 pr-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[oklch(0.7_0.1_40)] text-[13px] font-bold text-white">
          {initials(name)}
        </span>
        <div className="hidden leading-tight sm:block">
          <div className="text-[13.5px] font-bold text-ink">{name}</div>
          <div className="text-[11.5px] text-ink-soft">Administrator</div>
        </div>
      </div>
    </header>
  );
}
