"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-beige flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="text-gray-600">
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
