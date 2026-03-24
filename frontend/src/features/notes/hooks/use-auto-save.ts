import { useCallback, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import type { Note, NotePayload } from "@/features/notes/types";

interface UseAutoSaveOptions {
  noteId: number;
  delay?: number;
  maxRetries?: number;
}

export function useAutoSave({
  noteId,
  delay = 1000,
  maxRetries = 3,
}: UseAutoSaveOptions) {
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<NotePayload | null>(null);
  const retryCountRef = useRef(0);

  const mutation = useMutation({
    mutationFn: (payload: NotePayload) =>
      apiClient.patch<Note>(`/api/notes/${noteId}/`, payload),
    onSuccess: (updatedNote) => {
      retryCountRef.current = 0;
      queryClient.setQueryData(["notes", noteId], updatedNote);
    },
    onError: (_error, failedPayload) => {
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        toast.error("Failed to save — retrying...");
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          mutation.mutate(failedPayload);
        }, 2000);
      } else {
        toast.error("Failed to save. Please check your connection.");
        retryCountRef.current = 0;
      }
    },
  });

  const schedule = useCallback(
    (payload: NotePayload) => {
      pendingRef.current = payload;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        pendingRef.current = null;
        mutation.mutate(payload);
      }, delay);
    },
    [delay, mutation],
  );

  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const payload = pendingRef.current;
    if (payload) {
      pendingRef.current = null;
      mutation.mutate(payload);
    }
  }, [mutation]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { schedule, flush };
}
