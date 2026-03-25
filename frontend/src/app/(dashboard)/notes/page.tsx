"use client";

import { Suspense, useState } from "react";
import { CategoriesSidebar } from "@/features/categories/components/categories-sidebar";
import { CreateNoteButton } from "@/features/notes/components/create-note-button";
import { MobileTopBar } from "@/features/notes/components/mobile-top-bar";
import { NotesGrid } from "@/features/notes/components/notes-grid";
import { NoteEditor } from "@/features/notes/components/note-editor";
import type { Note } from "@/features/notes/types";

export default function NotesPage() {
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);

  function handleNoteCreated(note: Note) {
    setSelectedNoteId(note.id);
  }

  return (
    <div className="flex h-full flex-1">
      {/* Desktop sidebar — hidden on mobile */}
      <Suspense>
        <div className="hidden md:flex">
          <CategoriesSidebar />
        </div>
      </Suspense>

      <main className="flex min-h-0 flex-1 flex-col p-6">
        {/* Mobile top bar — hidden on desktop */}
        <Suspense>
          <MobileTopBar onNoteCreated={handleNoteCreated} />
        </Suspense>

        {/* Desktop header with title + create button */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Notes</h1>
          <div className="hidden md:block">
            <Suspense>
              <CreateNoteButton onNoteCreated={handleNoteCreated} />
            </Suspense>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <Suspense>
            <NotesGrid onSelectNote={setSelectedNoteId} />
          </Suspense>
        </div>
      </main>

      <NoteEditor
        noteId={selectedNoteId}
        onClose={() => setSelectedNoteId(null)}
      />
    </div>
  );
}
