"use client";

import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotes } from "@/features/notes/hooks/use-notes";
import { NoteCard } from "@/features/notes/components/note-card";

interface NotesGridProps {
  onSelectNote: (id: number) => void;
}

export function NotesGridSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-card flex h-52 flex-col overflow-hidden rounded-xl border p-4"
        >
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="mt-3 h-5 w-3/4" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotesGrid({ onSelectNote }: NotesGridProps) {
  const { data: notes, isLoading } = useNotes();

  if (isLoading) {
    return <NotesGridSkeleton />;
  }

  if (!notes || notes.length === 0) {
    return <NotesEmptyState />;
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} onSelect={onSelectNote} />
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
