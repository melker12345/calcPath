"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase/client";

/**
 * Client gate for the /admin subtree. Requires a signed-in session before
 * rendering admin UI. This is defense-in-depth only — the real authorization
 * happens server-side in /api/feedback, which checks the bearer token's email
 * against the ADMIN_EMAIL allowlist. A signed-in non-admin passes this gate but
 * the API returns 403, and the feedback panel shows its access-denied state.
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const { signInWithPassword } = useAuth();
  // undefined = still resolving the initial session; null = signed out.
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await signInWithPassword(email, password);
    setSubmitting(false);
    if (signInError) setError(signInError);
    // On success, onAuthStateChange updates `session` and the tree re-renders.
  };

  if (session === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm theme-text-muted">Checking session…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] theme-text-muted">
          Admin
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight theme-text">
          Sign in
        </h1>
        <p className="mt-2 text-sm leading-relaxed theme-text-secondary">
          This area is restricted to site administrators.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium theme-text">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border theme-border bg-[var(--surface)] px-3 py-2 text-sm theme-text outline-none focus:border-zinc-400"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium theme-text">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border theme-border bg-[var(--surface)] px-3 py-2 text-sm theme-text outline-none focus:border-zinc-400"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
