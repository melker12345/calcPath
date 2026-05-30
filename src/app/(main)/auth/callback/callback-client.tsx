"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export function CallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [isRecovery, setIsRecovery] = useState(false);
  const recoveryRef = useRef(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check URL hash immediately (before any events fire)
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      recoveryRef.current = true;
      setIsRecovery(true);
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        recoveryRef.current = true;
        setIsRecovery(true);
        return;
      }
      // Only redirect on SIGNED_IN if this is NOT a recovery flow
      if (event === "SIGNED_IN" && !recoveryRef.current) {
        router.replace(next);
      }
    });

    // Fallback: if no events fire within 4s and not recovery, redirect
    const timeout = setTimeout(() => {
      if (!recoveryRef.current) {
        supabase.auth.getSession().then(({ data }) => {
          if (data.session) {
            router.replace(next);
          }
        });
      }
    }, 4000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setStatus("Password updated! Redirecting…");
      setTimeout(() => router.replace(next), 1500);
    }
  };

  if (isRecovery) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-14">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-4xl font-extrabold text-zinc-900">
            Set new password
          </h1>
          <p className="mt-3 text-zinc-600">
            Enter your new password below.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-xl rounded-3xl border-2 border-orange-100 bg-white p-6 shadow-lg sm:p-8">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-700">
                New password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 text-base text-zinc-900 shadow-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-700">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                minLength={6}
                className="w-full rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 text-base text-zinc-900 shadow-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-4 text-base font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? "Updating…" : "Update password"}
            </button>

            {status && (
              <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
                {status}
              </div>
            )}
            {error && (
              <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-900">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold text-zinc-900">Signing you in…</h1>
      <p className="mt-2 text-zinc-600">Redirecting to your dashboard.</p>
    </div>
  );
}
