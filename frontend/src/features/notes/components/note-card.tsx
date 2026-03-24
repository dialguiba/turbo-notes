"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatNoteDate } from "@/features/notes/format-note-date";
import type { Note } from "@/features/notes/types";

const CONTENT_PREVIEW_LENGTH = 120;

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  const truncatedContent =
    note.content.length > CONTENT_PREVIEW_LENGTH
      ? note.content.slice(0, CONTENT_PREVIEW_LENGTH) + "..."
      : note.content;

  return (
    <Link href={`/notes/${note.id}`}>
      <Card
        className="h-full cursor-pointer transition-shadow hover:shadow-md"
        style={{
          backgroundColor: note.category?.color ?? undefined,
        }}
      >
        <CardHeader className="gap-0.5">
          <div className="flex items-center justify-between text-xs opacity-70">
            <span>{formatNoteDate(note.updated_at)}</span>
            {note.category && <span>{note.category.name}</span>}
          </div>
          <h3 className="line-clamp-1 font-semibold">
            {note.title || "Untitled"}
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed opacity-80">
            {truncatedContent || "No content yet"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
