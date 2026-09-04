"use client";

import { useCallback, useEffect, useState } from "react";

const TOKEN_KEY = "ump.admin.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage disabled — nothing we can do */
  }
  notify();
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
  notify();
}

/** Decode the `username` claim from a JWT without verifying the signature. */
export function usernameFromToken(token: string | null): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const json = atobUrl(parts[1]);
    const payload = JSON.parse(json) as { username?: unknown };
    return typeof payload.username === "string" ? payload.username : null;
  } catch {
    return null;
  }
}

function atobUrl(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  if (typeof atob === "function") return atob(padded);
  // Node fallback (tests)
  return Buffer.from(padded, "base64").toString("binary");
}

// --- reactive hook ---------------------------------------------------------

type Listener = () => void;
const listeners = new Set<Listener>();
function notify() {
  listeners.forEach((l) => l());
}

export function useAuth() {
  const [token, setTokenState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setTokenState(getToken());
    sync();
    setReady(true);
    listeners.add(sync);
    window.addEventListener("storage", sync);
    return () => {
      listeners.delete(sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const login = useCallback((next: string) => setToken(next), []);
  const logout = useCallback(() => clearToken(), []);

  return {
    ready,
    token,
    isAuthenticated: !!token,
    username: usernameFromToken(token),
    login,
    logout,
  };
}
