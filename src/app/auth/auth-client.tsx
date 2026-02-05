"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export function AuthClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const { user, sendEmailOtp, verifyOtp } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.replace(next);
  }, [user, router, next]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-blue-50 via-white to-transparent dark:from-blue-950/40 dark:via-black" />

      <div className="mx-auto w-full max-w-5xl px-6 py-14">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight">
            Sign in with email
          </h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-300">
            We’ll send you a secure sign-in link. Once you sign in, you’ll stay
            signed in on this device.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <div className="mt-6 space-y-4">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Email address
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 shadow-sm outline-none ring-0 focus:border-blue-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              />
              <button
                type="button"
                onClick={async () => {
                  setStatus(null);
                  setError(null);
                  const trimmed = email.trim().toLowerCase();
                  if (!trimmed) return;
                  try {
                    await sendEmailOtp(trimmed);
                    setPendingEmail(trimmed);
                    setStatus(
                      "Check your email for a sign-in link. If your project is configured for codes, enter it below.",
                    );
                  } catch {
                    setError("Could not send email. Double-check the address.");
                  }
                }}
                className="w-full rounded-2xl bg-zinc-900 px-5 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-zinc-800 active:scale-[0.99] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Send sign-in link
              </button>
            </div>

            {pendingEmail && (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Enter verification code (optional)
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    className="min-w-[180px] flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 shadow-sm outline-none focus:border-blue-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      setStatus(null);
                      setError(null);
                      try {
                        await verifyOtp({
                          email: pendingEmail,
                          token: code,
                        });
                        setStatus("Signed in! Redirecting…");
                        router.replace(next);
                      } catch {
                        setError("Invalid code. Try again.");
                      }
                    }}
                    className="rounded-xl bg-emerald-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-500 active:scale-[0.99]"
                  >
                    Verify
                  </button>
                </div>
              </div>
            )}

            {status && (
              <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
                {status}
              </div>
            )}
            {error && (
              <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-900 dark:bg-red-950/30 dark:text-red-100">
                {error}
              </div>
            )}

            <p className="pt-2 text-center text-sm text-zinc-500">
              By continuing you agree to our{" "}
              <Link className="text-zinc-900 underline dark:text-white" href="#">
                Terms
              </Link>{" "}
              and{" "}
              <Link className="text-zinc-900 underline dark:text-white" href="#">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

