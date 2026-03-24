import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

// --- Mocks ---------------------------------------------------------------

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/notes",
}));

vi.mock("@/features/categories/hooks/use-categories", () => ({
  useCategories: () => ({ data: [], isLoading: false }),
}));

const mockLogout = vi.fn();
vi.mock("@/app/providers", () => ({
  useAuth: () => ({ logout: mockLogout }),
}));

import { MobileTopBar } from "../mobile-top-bar";

// --- Helpers -------------------------------------------------------------

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

// --- Tests ---------------------------------------------------------------

describe("MobileTopBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls logout when clicking the logout icon", async () => {
    const user = userEvent.setup();
    render(<MobileTopBar />, { wrapper: createWrapper() });

    await user.click(screen.getByRole("button", { name: /log out/i }));

    expect(mockLogout).toHaveBeenCalledOnce();
  });
});
