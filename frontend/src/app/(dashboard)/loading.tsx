import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-full flex-1">
      {/* Sidebar placeholder */}
      <div className="hidden w-56 shrink-0 px-4 py-4 md:flex md:flex-col">
        <div className="flex-1 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <Skeleton className="size-3 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Main content placeholder */}
      <main className="flex flex-1 flex-col p-6">
        <Skeleton className="mb-6 h-8 w-32" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      </main>
    </div>
  );
}
