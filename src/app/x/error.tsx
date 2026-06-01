"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DynamicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("/x/ dynamic area error:", error);
  }, [error]);

  return (
    <div className="px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-md rounded-2xl border theme-border bg-[var(--surface)] p-6 text-center">
        <div className="mx-auto mb-3 inline-block rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-medium theme-text-muted">/x/ dynamic</div>
        <h2 className="text-xl font-semibold theme-text">Something went wrong loading this view</h2>
        <p className="mt-2 text-sm theme-text-secondary">
          The content bundle could not be loaded (or a render error occurred). This area uses live FS reads from content/.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            onClick={() => reset()}
            className="btn-primary rounded-lg px-4 py-2 text-sm font-medium"
          >
            Try again
          </button>
          <Link href="/x" className="btn-secondary rounded-lg border px-4 py-2 text-sm font-medium">
            Back to dynamic content
          </Link>
        </div>
        <p className="mt-4 text-[10px] theme-text-muted">Check console for details. See NOTES.md for known limitations.</p>
      </div>
    </div>
  );
}
