import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

// --- Mocks ---------------------------------------------------------------

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/notes",
}));

const mockUseCategories = vi.fn();
vi.mock("@/features/categories/hooks/use-categories", () => ({
  useCategories: () => mockUseCategories(),
}));

vi.mock("@/features/categories/hooks/use-create-category", () => ({
  useCreateCategory: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    reset: vi.fn(),
  }),
}));

import { CategoriesSidebar } from "../categories-sidebar";
import type { Category } from "@/features/categories/types";

// --- Fixtures ------------------------------------------------------------

const categories: Category[] = [
  {
    id: 1,
    name: "Random Thoughts",
    color: "#FFD4B2",
    note_count: 3,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "School",
    color: "#FFF3BF",
    note_count: 0,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: 3,
    name: "Personal",
    color: "#B2F2E5",
    note_count: 7,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

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

describe("CategoriesSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    mockUseCategories.mockReturnValue({ data: categories, isLoading: false });
  });

  it("renders all categories with color dot and name", () => {
    render(<CategoriesSidebar />, { wrapper: createWrapper() });

    expect(screen.getByText("All Categories")).toBeInTheDocument();
    expect(screen.getByText("Random Thoughts")).toBeInTheDocument();
    expect(screen.getByText("School")).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();
  });

  it("displays note count only when greater than 0", () => {
    render(<CategoriesSidebar />, { wrapper: createWrapper() });

    // "Random Thoughts" has 3 notes
    expect(screen.getByText("3")).toBeInTheDocument();
    // "Personal" has 7 notes
    expect(screen.getByText("7")).toBeInTheDocument();
    // "School" has 0 notes — count should NOT appear
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("renders color dots with correct background colors", () => {
    render(<CategoriesSidebar />, { wrapper: createWrapper() });

    const dots = document.querySelectorAll("[style]");
    const colors = Array.from(dots).map(
      (d) => (d as HTMLElement).style.backgroundColor,
    );

    // Browser normalises hex to rgb
    expect(colors).toContain("rgb(255, 212, 178)"); // #FFD4B2
    expect(colors).toContain("rgb(255, 243, 191)"); // #FFF3BF
    expect(colors).toContain("rgb(178, 242, 229)"); // #B2F2E5
  });

  it("sets ?category=<id> when clicking a category", async () => {
    const user = userEvent.setup();
    render(<CategoriesSidebar />, { wrapper: createWrapper() });

    await user.click(screen.getByText("Random Thoughts"));

    expect(mockPush).toHaveBeenCalledWith("/notes?category=1");
  });

  it("removes category param when clicking 'All Categories'", async () => {
    mockSearchParams = new URLSearchParams("category=1");
    const user = userEvent.setup();
    render(<CategoriesSidebar />, { wrapper: createWrapper() });

    await user.click(screen.getByText("All Categories"));

    expect(mockPush).toHaveBeenCalledWith("/notes");
  });

  it("bolds the active category name", () => {
    mockSearchParams = new URLSearchParams("category=3");
    render(<CategoriesSidebar />, { wrapper: createWrapper() });

    const personal = screen.getByText("Personal");
    expect(personal.closest("button")?.querySelector(".font-bold") ?? personal).toHaveClass("font-bold");

    // "All Categories" should NOT be bold
    const all = screen.getByText("All Categories");
    expect(all).not.toHaveClass("font-bold");
  });

  it("bolds 'All Categories' when no category param is set", () => {
    render(<CategoriesSidebar />, { wrapper: createWrapper() });

    expect(screen.getByText("All Categories")).toHaveClass("font-bold");
  });

  it("shows loading state", () => {
    mockUseCategories.mockReturnValue({ data: undefined, isLoading: true });
    render(<CategoriesSidebar />, { wrapper: createWrapper() });

    expect(screen.getByText("Loading…")).toBeInTheDocument();
    expect(screen.queryByText("All Categories")).not.toBeInTheDocument();
  });

  it("has accessible navigation landmark", () => {
    render(<CategoriesSidebar />, { wrapper: createWrapper() });

    expect(screen.getByRole("navigation", { name: "Categories" })).toBeInTheDocument();
  });
});
