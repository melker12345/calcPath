"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Supabase handles session from URL automatically in the client.
    supabase.auth.getSession().finally(() => {
      router.replace("/dashboard");
    });
  }, [router]);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Signing you in…</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300">
        Redirecting to your dashboard.
      </p>
    </div>
  );
}

