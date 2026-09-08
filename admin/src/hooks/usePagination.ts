"use client";

import { useEffect, useMemo, useState } from "react";

interface Options {
  pageSize?: number;
  /** When this value changes, jump back to page 1 (e.g. pass the search query). */
  resetKey?: unknown;
}

interface Pagination<T> {
  page: number;
  setPage: (page: number) => void;
  pageRows: T[];
  pageCount: number;
  pageSize: number;
  total: number;
}

/**
 * Client-side pager over an already-filtered/sorted array. The caller renders
 * `pageRows` and drops a <Pagination> control below it.
 */
export function usePagination<T>(
  rows: T[],
  { pageSize = 10, resetKey }: Options = {},
): Pagination<T> {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));

  // Back to page 1 when the search/filter changes.
  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  // Never leave the current page beyond the last one (after deletes, reloads…).
  useEffect(() => {
    setPage((p) => Math.min(Math.max(p, 1), pageCount));
  }, [pageCount]);

  const pageRows = useMemo(
    () => rows.slice((page - 1) * pageSize, page * pageSize),
    [rows, page, pageSize],
  );

  return { page, setPage, pageRows, pageCount, pageSize, total: rows.length };
}
