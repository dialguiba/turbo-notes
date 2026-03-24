import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  apiClient,
  ApiError,
  setTokens,
  getAccessToken,
} from "../api-client";

const API_URL = "http://localhost:8000";

// Helper to create a mock Response
function mockResponse(
  status: number,
  body: unknown = {},
  headers: Record<string, string> = {},
) {
  // 204 No Content cannot have a body per the fetch spec
  const responseBody = status === 204 ? null : JSON.stringify(body);
  return new Response(responseBody, {
    status,
    headers: status === 204 ? {} : { "Content-Type": "application/json", ...headers },
  });
}

describe("API client", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();

    // Reset window.location for redirect tests
    Object.defineProperty(window, "location", {
      value: { href: "http://localhost:3000" },
      writable: true,
      configurable: true,
    });
  });

  describe("request basics", () => {
    it("prefixes API_URL to all paths", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse(200, { ok: true }));

      await apiClient.get("/api/notes/");

      expect(globalThis.fetch).toHaveBeenCalledWith(
        `${API_URL}/api/notes/`,
        expect.any(Object),
      );
    });

    it("attaches Authorization header when access token exists", async () => {
      setTokens("my_token", "my_refresh");
      vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse(200, { ok: true }));

      await apiClient.get("/api/notes/");

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer my_token",
          }),
        }),
      );
    });

    it("omits Authorization header when no token exists", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse(200, { ok: true }));

      await apiClient.get("/api/notes/");

      const callArgs = fetchSpy.mock.calls[0][1] as RequestInit;
      const headers = callArgs.headers as Record<string, string>;
      expect(headers.Authorization).toBeUndefined();
    });

    it("parses JSON response body", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        mockResponse(200, { id: 1, title: "Test" }),
      );

      const data = await apiClient.get<{ id: number; title: string }>("/api/notes/1/");

      expect(data).toEqual({ id: 1, title: "Test" });
    });
  });

  describe("HTTP methods", () => {
    it("sends GET request", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse(200, []));

      await apiClient.get("/api/notes/");

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("sends POST request with JSON body", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse(201, { id: 1 }));

      await apiClient.post("/api/notes/", { title: "New note" });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ title: "New note" }),
        }),
      );
    });

    it("sends PATCH request with JSON body", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse(200, { id: 1 }));

      await apiClient.patch("/api/notes/1/", { title: "Updated" });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ title: "Updated" }),
        }),
      );
    });

    it("sends DELETE request", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse(204));

      await apiClient.delete("/api/notes/1/");

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  describe("401 refresh + retry flow", () => {
    it("refreshes token on 401 and retries the original request", async () => {
      setTokens("expired_access", "valid_refresh");

      const fetchSpy = vi.spyOn(globalThis, "fetch")
        // First call: original request → 401
        .mockResolvedValueOnce(mockResponse(401, { detail: "Token expired" }))
        // Second call: refresh endpoint → success
        .mockResolvedValueOnce(
          mockResponse(200, { access: "new_access_token" }),
        )
        // Third call: retried original request → success
        .mockResolvedValueOnce(mockResponse(200, { id: 1 }));

      const result = await apiClient.get<{ id: number }>("/api/notes/");

      // Verify refresh was called
      expect(fetchSpy).toHaveBeenCalledWith(
        `${API_URL}/api/auth/refresh/`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ refresh: "valid_refresh" }),
        }),
      );

      // Verify retry used the new token
      const retryCall = fetchSpy.mock.calls[2];
      const retryHeaders = (retryCall[1] as RequestInit).headers as Record<
        string,
        string
      >;
      expect(retryHeaders.Authorization).toBe("Bearer new_access_token");

      // Verify the new token was persisted
      expect(getAccessToken()).toBe("new_access_token");

      // Verify we got the final response
      expect(result).toEqual({ id: 1 });
    });

    it("clears tokens and redirects to /login when refresh fails", async () => {
      setTokens("expired_access", "expired_refresh");

      vi.spyOn(globalThis, "fetch")
        // Original request → 401
        .mockResolvedValueOnce(mockResponse(401, { detail: "Token expired" }))
        // Refresh → also fails
        .mockResolvedValueOnce(mockResponse(401, { detail: "Refresh expired" }));

      await expect(apiClient.get("/api/notes/")).rejects.toThrow();

      // Tokens should be cleared
      expect(getAccessToken()).toBeNull();

      // Should redirect to login
      expect(window.location.href).toBe("/login");
    });

    it("does not attempt refresh when no refresh token exists", async () => {
      // Only access token, no refresh
      localStorage.setItem("access_token", "some_token");

      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(mockResponse(401, { detail: "Token expired" }));

      await expect(apiClient.get("/api/notes/")).rejects.toThrow();

      // Should only have the one original call — no refresh attempt
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      // Should redirect to login
      expect(window.location.href).toBe("/login");
    });

    it("does not attempt refresh for auth endpoints", async () => {
      setTokens("expired_access", "valid_refresh");

      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(mockResponse(401, { detail: "Bad credentials" }));

      await expect(
        apiClient.post("/api/auth/login/", {
          email: "test@test.com",
          password: "wrong",
        }),
      ).rejects.toThrow();

      // Should NOT attempt refresh for auth endpoints
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("concurrent 401 handling", () => {
    it("deduplicates refresh calls when multiple requests get 401", async () => {
      setTokens("expired_access", "valid_refresh");

      let refreshCallCount = 0;

      vi.spyOn(globalThis, "fetch").mockImplementation(
        async (input: string | URL | Request, init?: RequestInit) => {
          const url = typeof input === "string" ? input : input.toString();

          if (url.includes("/api/auth/refresh/")) {
            refreshCallCount++;
            return mockResponse(200, { access: "new_token" });
          }

          // First time hitting these endpoints → 401
          // After refresh → 200
          const authHeader = (init?.headers as Record<string, string>)
            ?.Authorization;

          if (authHeader === "Bearer expired_access") {
            return mockResponse(401, { detail: "Token expired" });
          }

          return mockResponse(200, { data: url });
        },
      );

      // Fire two requests concurrently
      const [r1, r2] = await Promise.all([
        apiClient.get("/api/notes/"),
        apiClient.get("/api/categories/"),
      ]);

      // Only ONE refresh call should have been made
      expect(refreshCallCount).toBe(1);

      // Both requests should have succeeded
      expect(r1).toBeDefined();
      expect(r2).toBeDefined();
    });
  });

  describe("error handling", () => {
    it("throws an error with status and response body for non-401 errors", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        mockResponse(400, { email: ["This field is required."] }),
      );

      try {
        await apiClient.post("/api/auth/signup/", {});
        expect.unreachable("Should have thrown");
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.status).toBe(400);
        expect(apiError.data).toEqual({ email: ["This field is required."] });
      }
    });
  });
});
