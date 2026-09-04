import type { ApiErrorBody, FieldErrors } from "./types";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"
).replace(/\/+$/, "");

/** Thrown for any non-2xx API response. */
export class ApiError extends Error {
  readonly status: number;
  readonly details?: FieldErrors;

  constructor(status: number, message: string, details?: FieldErrors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export interface ApiClientOptions {
  baseUrl?: string;
  /** Returns the current bearer token, or null when unauthenticated. */
  getToken?: () => string | null;
  /** Invoked once when any non-login call returns 401. */
  onUnauthorized?: () => void;
  /** Injectable for tests. */
  fetchImpl?: typeof fetch;
}

type Query = Record<string, string | number | boolean | undefined>;

interface RequestOptions {
  method?: string;
  body?: unknown;
  query?: Query;
  /** Skip the onUnauthorized callback (used by login). */
  skipAuthHandler?: boolean;
}

function buildUrl(baseUrl: string, path: string, query?: Query): string {
  const url = new URL(
    `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`,
  );
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly getToken: () => string | null;
  private readonly onUnauthorized?: () => void;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? API_BASE_URL).replace(/\/+$/, "");
    this.getToken = options.getToken ?? (() => null);
    this.onUnauthorized = options.onUnauthorized;
    this.fetchImpl =
      options.fetchImpl ??
      (typeof fetch !== "undefined" ? fetch.bind(globalThis) : (undefined as never));
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, query, skipAuthHandler } = options;
    const headers: Record<string, string> = { Accept: "application/json" };

    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) headers["Content-Type"] = "application/json";

    const res = await this.fetchImpl(buildUrl(this.baseUrl, path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401 && !skipAuthHandler) {
      this.onUnauthorized?.();
    }

    if (res.status === 204) return undefined as T;

    const text = await res.text();
    const payload = text ? safeJsonParse(text) : undefined;

    if (!res.ok) {
      const errBody = (payload ?? {}) as ApiErrorBody;
      throw new ApiError(
        res.status,
        errBody.error || `Request failed (${res.status})`,
        errBody.details,
      );
    }

    return payload as T;
  }

  // --- Auth -----------------------------------------------------------------
  login(username: string, password: string): Promise<{ token: string }> {
    return this.request<{ token: string }>("/api/auth/login", {
      method: "POST",
      body: { username, password },
      skipAuthHandler: true,
    });
  }

  // --- Generic resource CRUD ---------------------------------------------------
  list<T>(resource: string): Promise<T[]> {
    return this.request<T[]>(`/api/${resource}`);
  }
  get<T>(resource: string, id: number): Promise<T> {
    return this.request<T>(`/api/${resource}/${id}`);
  }
  create<T>(resource: string, body: unknown): Promise<T> {
    return this.request<T>(`/api/${resource}`, { method: "POST", body });
  }
  update<T>(resource: string, id: number, body: unknown): Promise<T> {
    return this.request<T>(`/api/${resource}/${id}`, { method: "PUT", body });
  }
  remove(resource: string, id: number): Promise<void> {
    return this.request<void>(`/api/${resource}/${id}`, { method: "DELETE" });
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export { buildUrl };
