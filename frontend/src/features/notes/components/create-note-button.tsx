"use client";

import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCreateNote } from "@/features/notes/hooks/use-create-note";
import type { Note } from "@/features/notes/types";

interface CreateNoteButtonProps {
  onNoteCreated?: (note: Note) => void;
}

export function CreateNoteButton({ onNoteCreated }: CreateNoteButtonProps) {
  const searchParams = useSearchParams();
  const createNote = useCreateNote(onNoteCreated);

  const activeCategoryParam = searchParams.get("category");
  const categoryId = activeCategoryParam
    ? parseInt(activeCategoryParam, 10)
    : null;

  return (
    <Button
      onClick={() => createNote.mutate({ category: categoryId })}
      disabled={createNote.isPending}
      variant="outline"
      size="lg"
    >
      <Plus className="mr-1 size-4" />
      New Note
    </Button>
  );
}
