import { describe, expect, it, vi } from "vitest";
import { ApiClient, ApiError, buildUrl } from "../api";

/** Minimal Response-shaped stub (avoids undici's 204 / single-read body rules). */
function res(status: number, body?: unknown) {
  return {
    status,
    ok: status >= 200 && status < 300,
    text: async () => (body === undefined ? "" : JSON.stringify(body)),
  } as unknown as Response;
}

describe("buildUrl", () => {
  it("joins base and path and appends query params", () => {
    expect(buildUrl("http://api.test", "/api/customers")).toBe(
      "http://api.test/api/customers",
    );
    expect(
      buildUrl("http://api.test", "api/customers", { page: 2, q: "x" }),
    ).toBe("http://api.test/api/customers?page=2&q=x");
  });

  it("skips undefined query values", () => {
    expect(buildUrl("http://api.test", "/x", { a: undefined, b: 1 })).toBe(
      "http://api.test/x?b=1",
    );
  });
});

describe("ApiClient", () => {
  it("sends the bearer token and parses JSON", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(200, [{ id: 1 }]));
    const client = new ApiClient({
      baseUrl: "http://api.test",
      getToken: () => "tok123",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const out = await client.list<{ id: number }>("customers");

    expect(out).toEqual([{ id: 1 }]);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("http://api.test/api/customers");
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer tok123",
    );
  });

  it("serialises the body and sets Content-Type on writes", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(201, { id: 9 }));
    const client = new ApiClient({
      baseUrl: "http://api.test",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await client.create("admins", { username: "a" });

    const [, init] = fetchImpl.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ username: "a" }));
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe(
      "application/json",
    );
  });

  it("uploads a File as multipart without a JSON Content-Type", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(201, { id: 7 }));
    const client = new ApiClient({
      baseUrl: "http://api.test",
      getToken: () => "tok",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const file = new File(["hello"], "pic.png", { type: "image/png" });
    const out = await client.upload<{ id: number }>("files", file, {
      name: "pic.png",
    });

    expect(out).toEqual({ id: 7 });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("http://api.test/api/files");
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get("file")).toBeInstanceOf(File);
    expect((init.body as FormData).get("name")).toBe("pic.png");
    expect(
      (init.headers as Record<string, string>)["Content-Type"],
    ).toBeUndefined();
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer tok",
    );
  });

  it("maps a non-2xx body to ApiError with details", async () => {
    const fetchImpl = vi.fn().mockImplementation(() =>
      Promise.resolve(
        res(400, {
          error: "Validation failed",
          details: { email: "email must be a valid email" },
        }),
      ),
    );
    const client = new ApiClient({
      baseUrl: "http://api.test",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(client.create("admins", {})).rejects.toMatchObject({
      status: 400,
      message: "Validation failed",
      details: { email: "email must be a valid email" },
    });
    await expect(client.create("admins", {})).rejects.toBeInstanceOf(ApiError);
  });

  it("returns undefined for 204 responses", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res(204));
    const client = new ApiClient({
      baseUrl: "http://api.test",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await expect(client.remove("files", 3)).resolves.toBeUndefined();
  });

  it("runs onUnauthorized for a 401 on a normal call", async () => {
    const onUnauthorized = vi.fn();
    const fetchImpl = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(res(401, { error: "Invalid or expired token" })),
      );
    const client = new ApiClient({
      baseUrl: "http://api.test",
      onUnauthorized,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(client.list("customers")).rejects.toBeInstanceOf(ApiError);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("does NOT run onUnauthorized for a failed login (401)", async () => {
    const onUnauthorized = vi.fn();
    const fetchImpl = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(res(401, { error: "Invalid credentials" })),
      );
    const client = new ApiClient({
      baseUrl: "http://api.test",
      onUnauthorized,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(client.login("u", "bad")).rejects.toMatchObject({
      status: 401,
      message: "Invalid credentials",
    });
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
