import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import type { Note, PaginatedResponse } from "@/features/notes/types";

function buildInitialPath(category: string | null): string {
  return category ? `/api/notes/?category=${category}` : "/api/notes/";
}

function extractPath(url: string): string {
  const parsed = new URL(url);
  return parsed.pathname + parsed.search;
}

export function useNotes() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  return useInfiniteQuery<PaginatedResponse<Note>>({
    queryKey: ["notes", { category }],
    queryFn: ({ pageParam }) => {
      const path =
        pageParam !== null
          ? extractPath(pageParam as string)
          : buildInitialPath(category);
      return apiClient.get<PaginatedResponse<Note>>(path);
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.next ?? undefined,
  });
}
