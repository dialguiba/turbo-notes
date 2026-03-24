"use client";

import { Suspense } from "react";
import { CategoriesSidebar } from "@/features/categories/components/categories-sidebar";
import { CreateNoteButton } from "@/features/notes/components/create-note-button";
import { MobileTopBar } from "@/features/notes/components/mobile-top-bar";
import { NotesGrid } from "@/features/notes/components/notes-grid";

export default function NotesPage() {
  return (
    <div className="flex min-h-full flex-1">
      {/* Desktop sidebar — hidden on mobile */}
      <Suspense>
        <div className="hidden md:block">
          <CategoriesSidebar />
        </div>
      </Suspense>

      <main className="flex flex-1 flex-col p-6">
        {/* Mobile top bar — hidden on desktop */}
        <Suspense>
          <MobileTopBar />
        </Suspense>

        {/* Desktop header with title + create button */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Notes</h1>
          <div className="hidden md:block">
            <Suspense>
              <CreateNoteButton />
            </Suspense>
          </div>
        </div>

        <Suspense>
          <NotesGrid />
        </Suspense>
      </main>
    </div>
  );
}
