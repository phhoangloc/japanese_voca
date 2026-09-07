import type { ApiErrorBody } from "./types";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"
).replace(/\/+$/, "");

/** Thrown for any non-2xx API response. */
export class ApiError extends Error {
  readonly status: number;
  readonly details?: Record<string, string>;

  constructor(
    status: number,
    message: string,
    details?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export interface ApiClientOptions {
  baseUrl?: string;
  getToken?: () => string | null;
  onUnauthorized?: () => void;
  fetchImpl?: typeof fetch;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  skipAuthHandler?: boolean;
}

function buildUrl(baseUrl: string, path: string): string {
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
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
      (typeof fetch !== "undefined"
        ? fetch.bind(globalThis)
        : (undefined as never));
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, skipAuthHandler } = options;
    const headers: Record<string, string> = { Accept: "application/json" };

    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) headers["Content-Type"] = "application/json";

    const res = await this.fetchImpl(buildUrl(this.baseUrl, path), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401 && !skipAuthHandler) this.onUnauthorized?.();
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

  login(username: string, password: string): Promise<{ token: string }> {
    return this.request<{ token: string }>("/api/auth/login", {
      method: "POST",
      body: { username, password },
      skipAuthHandler: true,
    });
  }

  list<T>(resource: string): Promise<T[]> {
    return this.request<T[]>(`/api/${resource}`);
  }
  get<T>(resource: string, id: number): Promise<T> {
    return this.request<T>(`/api/${resource}/${id}`);
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
