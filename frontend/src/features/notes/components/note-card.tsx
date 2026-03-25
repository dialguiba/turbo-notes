"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNoteDate } from "@/features/notes/format-note-date";
import type { Note } from "@/features/notes/types";

interface NoteCardProps {
  note: Note;
  onSelect: (id: number) => void;
}

export function NoteCard({ note, onSelect }: NoteCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      className="flex h-52 cursor-pointer flex-col overflow-hidden ring-0 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      style={{
        backgroundColor: note.category?.color ?? undefined,
        border: note.category?.color
          ? `3px solid color-mix(in hsl, ${note.category.color}, oklch(0.58 0.2 none))`
          : undefined,
      }}
      onClick={() => onSelect(note.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(note.id);
        }
      }}
    >
      <CardHeader className="gap-0.5">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-foreground">
            {formatNoteDate(note.updated_at)}
          </span>
          {note.category && <span>{note.category.name}</span>}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <CardTitle className="line-clamp-1">
          {note.title || "Untitled"}
        </CardTitle>
        <p className="line-clamp-3 text-sm leading-relaxed opacity-80">
          {note.content || "No content yet"}
        </p>
      </CardContent>
    </Card>
  );
}
