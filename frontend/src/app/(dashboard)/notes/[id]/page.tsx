export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Note {id}</h1>
      <p className="text-muted-foreground">Note detail stub</p>
    </div>
  );
}
