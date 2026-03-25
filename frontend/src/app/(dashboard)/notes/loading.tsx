import { Skeleton } from "@/components/ui/skeleton";
import { CategoriesSidebarSkeleton } from "@/features/categories/components/categories-sidebar";
import { NotesGridSkeleton } from "@/features/notes/components/notes-grid";

export default function NotesLoading() {
  return (
    <div className="flex min-h-full flex-1">
      {/* Desktop sidebar skeleton */}
      <div className="hidden md:flex">
        <CategoriesSidebarSkeleton />
      </div>

      <main className="flex flex-1 flex-col p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-24" />
          <div className="hidden md:block">
            <Skeleton className="h-10 w-28 rounded-md" />
          </div>
        </div>

        {/* Notes grid skeleton */}
        <NotesGridSkeleton />
      </main>
    </div>
  );
}
