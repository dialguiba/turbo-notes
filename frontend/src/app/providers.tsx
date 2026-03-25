"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import {
  apiClient,
  ApiError,
  clearTokens,
  getAccessToken,
  setTokens,
} from "@/lib/api-client";
import type { User } from "@/features/auth/types";

interface TokenResponse {
  access: string;
  refresh: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** Extract a human-readable message from DRF error responses. */
function extractErrorMessage(err: unknown): string {
  if (err instanceof ApiError && err.data && typeof err.data === "object") {
    const data = err.data as Record<string, unknown>;

    // simplejwt style: { detail: "..." }
    if (typeof data.detail === "string") return data.detail;

    // DRF field errors: { email: ["..."], password: ["..."] }
    for (const value of Object.values(data)) {
      if (Array.isArray(value) && typeof value[0] === "string") return value[0];
    }
  }
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred.";
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64));
}

function restoreUser(): User | null {
  if (typeof window === "undefined") return null;
  const token = getAccessToken();
  if (!token) return null;
  try {
    const payload = decodeJwtPayload(token);
    return {
      id: payload.user_id as number,
      email: (payload.email as string) ?? "",
    };
  } catch {
    clearTokens();
    return null;
  }
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(restoreUser);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const tokens = await apiClient.post<TokenResponse>("/api/auth/login/", {
        email,
        password,
      });
      setTokens(tokens.access, tokens.refresh);
      const payload = decodeJwtPayload(tokens.access);
      setUser({ id: payload.user_id as number, email });
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    try {
      const tokens = await apiClient.post<TokenResponse>("/api/auth/signup/", {
        email,
        password,
      });
      setTokens(tokens.access, tokens.refresh);
      const payload = decodeJwtPayload(tokens.access);
      setUser({ id: payload.user_id as number, email });
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  }, []);

  const logout = useCallback(() => {
    // TODO: In production, call POST /api/auth/logout/ to blacklist the
    // refresh token server-side (requires djangorestframework-simplejwt
    // token_blacklist). Currently relies on short-lived access token TTL.
    clearTokens();
    setUser(null);
    window.location.href = "/login";
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      signup,
      logout,
    }),
    [user, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a new client to isolate between requests
    return makeQueryClient();
  }
  // Browser: reuse the same client across renders
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  );
}
