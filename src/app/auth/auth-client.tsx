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
    <div className="mx-auto w-full max-w-5xl px-6 py-14">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-4xl font-extrabold text-zinc-900">
          Sign in with email
        </h1>
        <p className="mt-3 text-zinc-600">
          We'll send you a secure sign-in link. Once you sign in, you'll stay
          signed in on this device.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-xl rounded-3xl border-2 border-orange-100 bg-white p-6 shadow-lg sm:p-8">
        <div className="mt-6 space-y-4">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-zinc-700">
              Email address
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 text-base text-zinc-900 shadow-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
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
              className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-4 text-base font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-[0.99]"
            >
              Send sign-in link
            </button>
          </div>

          {pendingEmail && (
            <div className="rounded-2xl border-2 border-orange-100 bg-orange-50 p-4">
              <p className="text-sm font-medium text-zinc-700">
                Enter verification code (optional)
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className="min-w-[180px] flex-1 rounded-xl border-2 border-orange-100 bg-white px-4 py-3 text-base text-zinc-900 shadow-sm outline-none focus:border-orange-300"
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
                  className="rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:shadow-md active:scale-[0.99]"
                >
                  Verify
                </button>
              </div>
            </div>
          )}

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

          <p className="pt-2 text-center text-sm text-zinc-500">
            By continuing you agree to our{" "}
            <Link className="text-zinc-900 underline" href="#">
              Terms
            </Link>{" "}
            and{" "}
            <Link className="text-zinc-900 underline" href="#">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
