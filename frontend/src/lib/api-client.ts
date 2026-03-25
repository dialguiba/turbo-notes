// Typed API client — all API calls go through here.
// Handles auth headers, token refresh on 401, and redirect on session expiry.
// WARNING: This module uses browser-only APIs (localStorage, document.cookie).
// Only import from 'use client' components.

import { AUTH_COOKIE_NAME } from "@/lib/auth-constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ---------------------------------------------------------------------------
// Token storage helpers
// ---------------------------------------------------------------------------

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; SameSite=Lax`;
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; Max-Age=0`;
}

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    super(`API error ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// ---------------------------------------------------------------------------
// Refresh mutex — prevents concurrent refresh calls
// ---------------------------------------------------------------------------

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) {
    throw new Error("No refresh token");
  }

  const res = await fetch(`${API_URL}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    throw new Error("Refresh failed");
  }

  const data = (await res.json()) as { access: string };
  localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
  // Note: only access token is rotated — the refresh token stays valid
  // until it expires (7 days per backend SIMPLE_JWT config).
  return data.access;
}

function getOrStartRefresh(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// ---------------------------------------------------------------------------
// Auth endpoints that should NOT trigger a refresh on 401
// ---------------------------------------------------------------------------

const AUTH_PATHS = [
  "/api/auth/login/",
  "/api/auth/signup/",
  "/api/auth/refresh/",
];

function isAuthPath(path: string): boolean {
  return AUTH_PATHS.some((p) => path.includes(p));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildHeaders(
  method: string,
  token: string | null,
): Record<string, string> {
  const headers: Record<string, string> = {};
  const hasBody = method !== "GET" && method !== "DELETE";
  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function buildInit(
  method: string,
  headers: Record<string, string>,
  body?: unknown,
): RequestInit {
  const init: RequestInit = { method, headers };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }
  return init;
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function handleSessionExpired(): never {
  clearTokens();
  window.location.href = "/login";
  throw new ApiError(401, { detail: "Session expired" });
}

// ---------------------------------------------------------------------------
// Core request function
// ---------------------------------------------------------------------------

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers = buildHeaders(method, getAccessToken());
  const init = buildInit(method, headers, body);

  const res = await fetch(`${API_URL}${path}`, init);

  // --- Happy path ---
  if (res.ok) return parseResponse<T>(res);

  // --- 401 handling ---
  if (res.status === 401 && !isAuthPath(path)) {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      handleSessionExpired();
    }

    // Attempt token refresh — on failure, kill the session
    const newAccess = await getOrStartRefresh().catch(() =>
      handleSessionExpired(),
    );

    // Retry the original request with the new token
    const retryHeaders = buildHeaders(method, newAccess);
    const retryInit = buildInit(method, retryHeaders, body);
    const retryRes = await fetch(`${API_URL}${path}`, retryInit);

    if (retryRes.ok) return parseResponse<T>(retryRes);

    // Retry failed for a non-auth reason (e.g. 500) — surface the real error
    throw new ApiError(
      retryRes.status,
      await retryRes.json().catch(() => null),
    );
  }

  // --- Other errors ---
  const errorData = await res.json().catch(() => null);
  throw new ApiError(res.status, errorData);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const apiClient = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: (path: string) => request<void>("DELETE", path),
};
