"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error }: { error: Error }) {
  useEffect(() => {
    console.error("App error", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-zinc-500">
        We logged the issue. Try refreshing or go back home.
      </p>
      <Link className="btn-primary" href="/">
        Back to home
      </Link>
    </div>
  );
}
