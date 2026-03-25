"use client";

import { useRef, useState } from "react";
import { Trash2, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNote } from "@/features/notes/hooks/use-note";
import { useAutoSave } from "@/features/notes/hooks/use-auto-save";
import { useDeleteNote } from "@/features/notes/hooks/use-delete-note";
import { CategoryDropdown } from "@/features/notes/components/category-dropdown";
import { DeleteNoteDialog } from "@/features/notes/components/delete-note-dialog";
import { VoiceButton } from "@/features/notes/components/voice-button";
import { formatEditorDate } from "@/features/notes/format-editor-date";
import { apiClient } from "@/lib/api-client";
import type { Note, NoteCategory } from "@/features/notes/types";

interface NoteEditorProps {
  noteId: number | null;
  onClose: () => void;
}

export function NoteEditor({ noteId, onClose }: NoteEditorProps) {
  const queryClient = useQueryClient();
  const { data: note, isLoading, isError } = useNote(noteId);

  function handleClose() {
    queryClient.invalidateQueries({ queryKey: ["notes"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    onClose();
  }

  return (
    <Dialog
      open={noteId !== null}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="bg-beige! fixed! inset-0! top-0! left-0! flex h-screen! w-screen! max-w-none! translate-x-0! translate-y-0! flex-col rounded-none! p-0! ring-0!"
      >
        {/* Accessible title — visually hidden */}
        <DialogTitle className="sr-only">
          {note?.title || "Note Editor"}
        </DialogTitle>

        {isLoading && <EditorLoading onClose={handleClose} />}
        {isError && <EditorNotFound onClose={handleClose} />}
        {note && <EditorContent note={note} onClose={handleClose} />}
      </DialogContent>
    </Dialog>
  );
}

function EditorContent({ note, onClose }: { note: Note; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [category, setCategory] = useState<NoteCategory | null>(note.category);
  const [lastEdited, setLastEdited] = useState(note.updated_at);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(note.content.length);

  const autoSave = useAutoSave({ noteId: note.id });
  const deleteNote = useDeleteNote();

  // Immediate PATCH for category changes
  const categoryMutation = useMutation({
    mutationFn: (categoryId: number | null) =>
      apiClient.patch<Note>(`/api/notes/${note.id}/`, { category: categoryId }),
    onSuccess: (updatedNote) => {
      queryClient.setQueryData(["notes", note.id], updatedNote);
    },
  });

  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    setLastEdited(new Date().toISOString());
    autoSave.schedule({ title: newTitle, content });
  }

  function handleContentChange(newContent: string) {
    setContent(newContent);
    setLastEdited(new Date().toISOString());
    autoSave.schedule({ title, content: newContent });
  }

  function handleCategoryChange(categoryId: number | null) {
    // Only update to null optimistically — for switching categories,
    // keep the current one until the server responds to avoid flashing
    if (categoryId === null) {
      setCategory(null);
    }
    categoryMutation.mutate(categoryId, {
      onSuccess: (updatedNote) => {
        setCategory(updatedNote.category);
        setLastEdited(updatedNote.updated_at);
      },
    });
  }

  function handleClose() {
    autoSave.flush();
    onClose();
  }

  function handleDelete() {
    autoSave.flush();
    deleteNote.mutate(note.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        onClose();
      },
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-8 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <CategoryDropdown current={category} onSelect={handleCategoryChange} />
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-6" strokeWidth={1.5} />
            <span className="sr-only">Delete note</span>
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={handleClose}>
            <X className="size-8" strokeWidth={1.5} />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>

      {/* Note area — colored by category */}
      <div
        className="flex flex-1 flex-col overflow-hidden rounded-2xl px-10 py-8"
        style={{ backgroundColor: category?.color ?? undefined }}
      >
        {/* Timestamp */}
        <p className="mb-4 text-right text-xs opacity-60">
          {formatEditorDate(lastEdited)}
        </p>

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Note Title"
          aria-label="Note title"
          className="mb-3 bg-transparent text-2xl font-bold outline-none placeholder:opacity-40"
        />

        {/* Content + VoiceButton wrapper */}
        <div className="relative flex flex-1 flex-col">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onSelect={() => {
              if (textareaRef.current) {
                setCursorPosition(textareaRef.current.selectionStart);
              }
            }}
            placeholder="Pour your heart out..."
            aria-label="Note content"
            className="flex-1 resize-none bg-transparent text-base leading-relaxed outline-none placeholder:opacity-40"
          />
          <VoiceButton
            content={content}
            cursorPosition={cursorPosition}
            onContentChange={handleContentChange}
            onFlush={autoSave.flush}
          />
        </div>
      </div>

      <DeleteNoteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        isPending={deleteNote.isPending}
      />
    </div>
  );
}

function EditorLoading({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="flex items-center justify-end p-4">
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="size-5" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      <div className="flex flex-1 flex-col gap-4 px-6">
        <div className="bg-foreground/10 h-4 w-24 animate-pulse rounded" />
        <div className="bg-foreground/10 h-8 w-2/3 animate-pulse rounded" />
        <div className="bg-foreground/10 h-4 w-full animate-pulse rounded" />
        <div className="bg-foreground/10 h-4 w-5/6 animate-pulse rounded" />
        <div className="bg-foreground/10 h-4 w-3/4 animate-pulse rounded" />
      </div>
    </>
  );
}

function EditorNotFound({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="flex items-center justify-end p-4">
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="size-5" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        <p className="text-lg font-medium">Note not found</p>
        <p className="text-sm opacity-60">This note may have been deleted.</p>
      </div>
    </>
  );
}
