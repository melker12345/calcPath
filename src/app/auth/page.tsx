"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

type Mode = "google" | "email" | "phone";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const { user, signInWithGoogle, sendEmailOtp, sendPhoneOtp, verifyOtp } =
    useAuth();

  const [mode, setMode] = useState<Mode>("google");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState<{ email?: string; phone?: string } | null>(
    null,
  );
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => {
    if (mode === "google") return "Continue with Google";
    if (mode === "email") return "Sign in with email";
    return "Sign in with phone";
  }, [mode]);

  useEffect(() => {
    if (user) router.replace(next);
  }, [user, router, next]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-blue-50 via-white to-transparent dark:from-blue-950/40 dark:via-black" />

      <div className="mx-auto w-full max-w-5xl px-6 py-14">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-300">
            Create your CalcPath account to save progress, unlock Pro, and sync
            across devices.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <div className="flex flex-wrap justify-center gap-2">
            {(
              [
                ["google", "Google"],
                ["email", "Email"],
                ["phone", "Phone"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setMode(key);
                  setPending(null);
                  setStatus(null);
                  setError(null);
                  setCode("");
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  mode === key
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "border border-zinc-300 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {mode === "google" && (
              <button
                type="button"
                onClick={async () => {
                  setStatus(null);
                  setError(null);
                  try {
                    await signInWithGoogle();
                  } catch (err) {
                    setError("Google sign-in failed. Try again.");
                  }
                }}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4 text-base font-semibold text-white shadow-md transition hover:shadow-lg active:scale-[0.99]"
              >
                Continue with Google
              </button>
            )}

            {mode === "email" && (
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
                      setPending({ email: trimmed });
                      setStatus(
                        "We sent you a login link (and may also send a code depending on your Supabase settings).",
                      );
                    } catch {
                      setError("Could not send email. Double-check the address.");
                    }
                  }}
                  className="w-full rounded-2xl bg-zinc-900 px-5 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-zinc-800 active:scale-[0.99] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  Send login link / code
                </button>
              </div>
            )}

            {mode === "phone" && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  Phone number
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 123 4567"
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 shadow-sm outline-none ring-0 focus:border-blue-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />
                <button
                  type="button"
                  onClick={async () => {
                    setStatus(null);
                    setError(null);
                    const trimmed = phone.trim();
                    if (!trimmed) return;
                    try {
                      await sendPhoneOtp(trimmed);
                      setPending({ phone: trimmed });
                      setStatus("SMS sent. Enter the code below.");
                    } catch {
                      setError(
                        "Could not send SMS. Check the number and provider settings.",
                      );
                    }
                  }}
                  className="w-full rounded-2xl bg-zinc-900 px-5 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-zinc-800 active:scale-[0.99] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  Send SMS code
                </button>
              </div>
            )}

            {(pending?.email || pending?.phone) && (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Enter verification code
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
                          email: pending.email,
                          phone: pending.phone,
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

