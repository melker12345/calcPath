import { Suspense } from "react";
import { AuthClient } from "./auth-client";

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-3xl px-6 py-12">
          <p className="text-sm text-zinc-500">Loading…</p>
        </div>
      }
    >
      <AuthClient />
    </Suspense>
  );
}

