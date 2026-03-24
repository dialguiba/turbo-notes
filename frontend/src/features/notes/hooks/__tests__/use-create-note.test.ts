import { renderHook, act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

// --- Mocks ---------------------------------------------------------------

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockPost = vi.fn();
vi.mock("@/lib/api-client", () => ({
  apiClient: { post: (...args: unknown[]) => mockPost(...args) },
}));

import { useCreateNote } from "../use-create-note";

// --- Helpers -------------------------------------------------------------

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  // Seed the cache so we can verify invalidation
  queryClient.setQueryData(["notes", { category: null }], []);
  queryClient.setQueryData(["categories"], []);

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  return { wrapper, queryClient };
}

// --- Tests ---------------------------------------------------------------

describe("useCreateNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends POST /api/notes/ with the given category", async () => {
    mockPost.mockResolvedValue({ id: 42, title: "", content: "", category: null });
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useCreateNote(), { wrapper });

    await act(() => result.current.mutateAsync({ category: 5 }));

    expect(mockPost).toHaveBeenCalledWith("/api/notes/", { category: 5 });
  });

  it("sends category: null when no category is provided", async () => {
    mockPost.mockResolvedValue({ id: 43, title: "", content: "", category: null });
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useCreateNote(), { wrapper });

    await act(() => result.current.mutateAsync({ category: null }));

    expect(mockPost).toHaveBeenCalledWith("/api/notes/", { category: null });
  });

  it("calls onCreated callback with the new note on success", async () => {
    const createdNote = { id: 99, title: "", content: "", category: null };
    mockPost.mockResolvedValue(createdNote);
    const { wrapper } = createWrapper();
    const onCreated = vi.fn();

    const { result } = renderHook(() => useCreateNote(onCreated), { wrapper });

    await act(() => result.current.mutateAsync({ category: null }));

    expect(onCreated).toHaveBeenCalledWith(createdNote);
  });

  it("invalidates notes and categories caches on success", async () => {
    mockPost.mockResolvedValue({ id: 1, title: "", content: "", category: null });
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateNote(), { wrapper });

    await act(() => result.current.mutateAsync({ category: null }));

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["notes"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["categories"] });
    });
  });

  it("does not call onCreated when the API call fails", async () => {
    mockPost.mockRejectedValue(new Error("Server error"));
    const { wrapper } = createWrapper();
    const onCreated = vi.fn();

    const { result } = renderHook(() => useCreateNote(onCreated), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ category: null }).catch(() => {});
    });

    expect(onCreated).not.toHaveBeenCalled();
  });
});
