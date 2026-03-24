import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Note } from "@/features/notes/types";

interface CreateNotePayload {
  category: number | null;
}

export function useCreateNote(onCreated?: (note: Note) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNotePayload) =>
      apiClient.post<Note>("/api/notes/", payload),
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onCreated?.(note);
    },
  });
}
