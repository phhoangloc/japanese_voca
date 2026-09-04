"use client";

import { ApiClient } from "./api";
import { clearToken, getToken } from "./auth";

/**
 * The single ApiClient the app uses. On any non-login 401 it drops the token and
 * sends the browser back to /login (FR-1.6).
 */
export const api = new ApiClient({
  getToken,
  onUnauthorized: () => {
    clearToken();
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  },
});
