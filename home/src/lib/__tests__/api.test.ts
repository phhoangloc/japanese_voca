import { describe, expect, it, vi } from "vitest";
import { ApiClient, ApiError, buildUrl } from "../api";

function res(status: number, body?: unknown) {
  return {
    status,
    ok: status >= 200 && status < 300,
    text: async () => (body === undefined ? "" : JSON.stringify(body)),
  } as unknown as Response;
}

describe("buildUrl", () => {
  it("joins base and path with exactly one slash", () => {
    expect(buildUrl("http://api.test", "/api/courses")).toBe(
      "http://api.test/api/courses",
    );
    expect(buildUrl("http://api.test", "api/courses")).toBe(
      "http://api.test/api/courses",
    );
  });
});

describe("ApiClient", () => {
  it("sends the bearer token and parses a list", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(200, [{ id: 1 }]));
    const client = new ApiClient({
      baseUrl: "http://api.test",
      getToken: () => "tok",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const out = await client.list<{ id: number }>("courses");

    expect(out).toEqual([{ id: 1 }]);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("http://api.test/api/courses");
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer tok",
    );
  });

  it("maps a non-2xx body to ApiError", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(res(400, { error: "Validation failed" }));
    const client = new ApiClient({
      baseUrl: "http://api.test",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await expect(client.get("courses", 9)).rejects.toMatchObject({
      status: 400,
      message: "Validation failed",
    });
    await expect(client.get("courses", 9)).rejects.toBeInstanceOf(ApiError);
  });

  it("runs onUnauthorized on a non-login 401", async () => {
    const onUnauthorized = vi.fn();
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(res(401, { error: "expired" }));
    const client = new ApiClient({
      baseUrl: "http://api.test",
      onUnauthorized,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await expect(client.list("courses")).rejects.toBeInstanceOf(ApiError);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("does NOT run onUnauthorized for a failed login", async () => {
    const onUnauthorized = vi.fn();
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(res(401, { error: "Invalid credentials" }));
    const client = new ApiClient({
      baseUrl: "http://api.test",
      onUnauthorized,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await expect(client.login("u", "bad")).rejects.toMatchObject({
      status: 401,
    });
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it("returns undefined for 204", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(204));
    const client = new ApiClient({
      baseUrl: "http://api.test",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await expect(client.request("/x")).resolves.toBeUndefined();
  });
});
