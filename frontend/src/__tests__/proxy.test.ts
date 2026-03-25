import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-constants";

// ---------------------------------------------------------------------------
// We test the proxy function directly by importing it.
// NextRequest is constructed with a URL and optional cookies.
// ---------------------------------------------------------------------------

// Dynamic import so we can control mocks per-test if needed later.
async function loadProxy() {
  const mod = await import("@/proxy");
  return mod;
}

function buildRequest(path: string, hasCookie = false): NextRequest {
  const url = new URL(path, "http://localhost:3000");
  const req = new NextRequest(url);
  if (hasCookie) {
    req.cookies.set(AUTH_COOKIE_NAME, "1");
  }
  return req;
}

function getRedirectUrl(response: Response): string | null {
  const location = response.headers.get("location");
  if (!location) return null;
  // Return just the pathname for easy assertion
  return new URL(location).pathname;
}

describe("Route protection proxy", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  // AC 1: Visiting /notes without a token redirects to /login
  it("redirects /notes to /login when unauthenticated", async () => {
    const { proxy } = await loadProxy();
    const response = proxy(buildRequest("/notes"));

    expect(response.status).toBe(307);
    expect(getRedirectUrl(response)).toBe("/login");
  });

  // AC 2: Visiting /notes/[id] without a token redirects to /login
  it("redirects /notes/123 to /login when unauthenticated", async () => {
    const { proxy } = await loadProxy();
    const response = proxy(buildRequest("/notes/123"));

    expect(response.status).toBe(307);
    expect(getRedirectUrl(response)).toBe("/login");
  });

  // AC 3: Visiting /login with a valid token redirects to /notes
  it("redirects /login to /notes when authenticated", async () => {
    const { proxy } = await loadProxy();
    const response = proxy(buildRequest("/login", true));

    expect(response.status).toBe(307);
    expect(getRedirectUrl(response)).toBe("/notes");
  });

  // AC 4: Visiting /signup with a valid token redirects to /notes
  it("redirects /signup to /notes when authenticated", async () => {
    const { proxy } = await loadProxy();
    const response = proxy(buildRequest("/signup", true));

    expect(response.status).toBe(307);
    expect(getRedirectUrl(response)).toBe("/notes");
  });

  // AC 5: Proxy does NOT redirect for unrelated routes
  it("passes through for the home page", async () => {
    const { proxy } = await loadProxy();
    const response = proxy(buildRequest("/"));

    // Should not redirect
    expect(response.status).not.toBe(307);
  });

  it("passes through for static assets (_next/static)", async () => {
    const { proxy } = await loadProxy();
    const response = proxy(buildRequest("/_next/static/chunk.js"));

    expect(response.status).not.toBe(307);
  });

  // Edge case: authenticated user on /notes should pass through
  it("allows authenticated user to access /notes", async () => {
    const { proxy } = await loadProxy();
    const response = proxy(buildRequest("/notes", true));

    expect(response.status).not.toBe(307);
  });

  // Edge case: unauthenticated user on /login should pass through
  it("allows unauthenticated user to access /login", async () => {
    const { proxy } = await loadProxy();
    const response = proxy(buildRequest("/login"));

    expect(response.status).not.toBe(307);
  });
});
