import { Suspense } from "react";
import { CallbackClient } from "./callback-client";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-2xl px-6 py-12">
          <h1 className="text-2xl font-bold text-zinc-900">Signing you in…</h1>
          <p className="mt-2 text-zinc-600">Redirecting to your dashboard.</p>
        </div>
      }
    >
      <CallbackClient />
    </Suspense>
  );
}
