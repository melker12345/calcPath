"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error }: { error: Error }) {
  useEffect(() => {
    console.error("App error", error);

    // In development, if this looks like a content-architecture / legacy shim crash,
    // emit the migration diagnostics (including last-seen component render stack if available).
    if (process.env.NODE_ENV === "development") {
      import("@/lib/migration-diagnostics")
        .then((m) => m.onContentRelatedError(error))
        .catch(() => {});
    }
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-zinc-500">
        We logged the issue. Try refreshing or go back home.
      </p>
      <p className="text-xs text-amber-600">
        Dev hint: if you see “topics is not defined” / legacy content errors, run <code>window.__dumpLegacyReport()</code> in the console.
      </p>
      <Link className="btn-primary" href="/">
        Back to home
      </Link>
    </div>
  );
}
