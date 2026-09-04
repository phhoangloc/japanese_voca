import { afterEach, describe, expect, it, vi } from "vitest";

/** Build an unsigned JWT-shaped string with the given payload. */
function makeJwt(payload: Record<string, unknown>): string {
  const b64 = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64(payload)}.sig`;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("usernameFromToken", () => {
  it("extracts the username claim", async () => {
    const { usernameFromToken } = await import("../auth");
    expect(usernameFromToken(makeJwt({ sub: 1, username: "root" }))).toBe("root");
  });

  it("returns null for null / malformed / claim-less tokens", async () => {
    const { usernameFromToken } = await import("../auth");
    expect(usernameFromToken(null)).toBeNull();
    expect(usernameFromToken("not-a-jwt")).toBeNull();
    expect(usernameFromToken("a.b")).toBeNull();
    expect(usernameFromToken(makeJwt({ sub: 1 }))).toBeNull();
  });
});

describe("token storage", () => {
  it("round-trips through localStorage and clears", async () => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: (k: string) => void store.delete(k),
      },
      addEventListener: () => {},
      removeEventListener: () => {},
    });

    const { getToken, setToken, clearToken } = await import("../auth");
    expect(getToken()).toBeNull();
    setToken("abc.def.ghi");
    expect(getToken()).toBe("abc.def.ghi");
    clearToken();
    expect(getToken()).toBeNull();
  });

  it("getToken returns null when window is absent (SSR)", async () => {
    const { getToken } = await import("../auth");
    expect(getToken()).toBeNull();
  });
});
