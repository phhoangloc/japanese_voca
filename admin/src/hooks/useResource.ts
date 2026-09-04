"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import { ApiError } from "@/lib/api";

interface UseResourceResult<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  create: (body: unknown) => Promise<T>;
  update: (id: number, body: unknown) => Promise<T>;
  remove: (id: number) => Promise<void>;
}

/**
 * Loads and mutates one backend resource (`admins` | `customers` | `files`).
 * Mutations re-fetch the list so the table always reflects the server.
 */
export function useResource<T>(resource: string): UseResourceResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await api.list<T>(resource));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const create = useCallback(
    async (body: unknown) => {
      const created = await api.create<T>(resource, body);
      await reload();
      return created;
    },
    [resource, reload],
  );

  const update = useCallback(
    async (id: number, body: unknown) => {
      const updated = await api.update<T>(resource, id, body);
      await reload();
      return updated;
    },
    [resource, reload],
  );

  const remove = useCallback(
    async (id: number) => {
      await api.remove(resource, id);
      await reload();
    },
    [resource, reload],
  );

  return { items, loading, error, reload, create, update, remove };
}
