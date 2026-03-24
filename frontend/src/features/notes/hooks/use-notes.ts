import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import type { Note } from "@/features/notes/types";

export function useNotes() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  return useQuery<Note[]>({
    queryKey: ["notes", { category }],
    queryFn: () => {
      const path = category
        ? `/api/notes/?category=${category}`
        : "/api/notes/";
      return apiClient.get<Note[]>(path);
    },
  });
}
