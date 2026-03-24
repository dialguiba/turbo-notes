import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import type { Note } from "@/features/notes/types";

interface CreateNotePayload {
  category: number | null;
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateNotePayload) =>
      apiClient.post<Note>("/api/notes/", payload),
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.push(`/notes/${note.id}`);
    },
  });
}
