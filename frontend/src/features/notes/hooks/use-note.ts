import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Note } from "@/features/notes/types";

export function useNote(id: number | null) {
  return useQuery<Note>({
    queryKey: ["notes", id],
    queryFn: () => apiClient.get<Note>(`/api/notes/${id}/`),
    enabled: id !== null,
  });
}
