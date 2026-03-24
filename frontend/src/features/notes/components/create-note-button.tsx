"use client";

import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCreateNote } from "@/features/notes/hooks/use-create-note";

export function CreateNoteButton() {
  const searchParams = useSearchParams();
  const createNote = useCreateNote();

  const activeCategoryParam = searchParams.get("category");
  const categoryId = activeCategoryParam
    ? parseInt(activeCategoryParam, 10)
    : null;

  return (
    <Button
      onClick={() => createNote.mutate({ category: categoryId })}
      disabled={createNote.isPending}
      size="sm"
    >
      <Plus className="mr-1 size-4" />
      New Note
    </Button>
  );
}
