"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";

/**
 * Client gate for the /admin subtree: shows a sign-in form until there is a
 * session. Defence in depth only — the real check is in /api/feedback, which
 * verifies the bearer token's email against ADMIN_EMAIL. A signed-in
 * non-admin gets past this gate and then sees the API's 403.
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, signInWithPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await signInWithPassword(email, password);
    setSubmitting(false);
    if (signInError) setError(signInError);
    // On success the auth provider updates `user` and the tree re-renders.
  };

  if (user === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm theme-text-muted">Checking session…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center px-6">
        <h1 className="font-serif text-2xl font-semibold tracking-tight theme-text">Admin sign in</h1>
        <p className="mt-2 text-sm theme-text-secondary">This area is for the site administrator.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-sm">
          <div>
            <label htmlFor="admin-email" className="block font-medium theme-text">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border theme-border bg-[var(--surface)] px-3 py-2 theme-text outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="block font-medium theme-text">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border theme-border bg-[var(--surface)] px-3 py-2 theme-text outline-none focus:border-[var(--accent)]"
            />
          </div>
          {error && (
            <p role="alert" className="text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 font-medium text-[var(--accent-text)] disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
