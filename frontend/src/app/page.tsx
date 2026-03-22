import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">Turbo Notes</h1>
      <p className="text-muted-foreground">
        Note-taking with categories, auto-save, and voice-to-text.
      </p>
      <nav className="flex gap-4">
        <Link
          href="/login"
          className="text-primary underline underline-offset-4"
        >
          Login
        </Link>
        <Link
          href="/notes"
          className="text-primary underline underline-offset-4"
        >
          Notes
        </Link>
      </nav>
    </main>
  );
}
