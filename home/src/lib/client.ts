"use client";

import { ApiClient } from "./api";

/**
 * The single ApiClient the library site uses. The reader-facing pages are
 * login-less — the backend serves `GET /api/{courses,chapters,files}` publicly —
 * so no token or 401 handling is wired here.
 */
export const api = new ApiClient();
