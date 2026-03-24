"use client";

import Image from "next/image";
import { useNotes } from "@/features/notes/hooks/use-notes";
import { NoteCard } from "@/features/notes/components/note-card";

export function NotesGrid() {
  const { data: notes, isLoading } = useNotes();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Loading notes...</p>
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return <NotesEmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}

function NotesEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <Image
        src="/images/coffee.png"
        alt="Boba tea waiting for your notes"
        width={200}
        height={200}
        priority
      />
      <p className="text-muted-foreground text-center text-lg">
        I&apos;m just here waiting for your charming notes...
      </p>
    </div>
  );
}
