import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-6">
      <Link
        href="/notes"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Notes
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Note {id}</h1>
      <p className="text-muted-foreground">
        Full editor coming soon — this is a stub page.
      </p>
    </div>
  );
}
