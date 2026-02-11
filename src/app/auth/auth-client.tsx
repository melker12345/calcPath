"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

type AuthMode = "signin" | "signup" | "forgot";

export function AuthClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const { user, signUp, signInWithPassword, sendEmailOtp, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace(next);
  }, [user, router, next]);

  const clearMessages = () => {
    setStatus(null);
    setError(null);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    clearMessages();
    setPassword("");
    setConfirmPassword("");
  };

  const handleSignIn = async () => {
    clearMessages();
    setLoading(true);
    try {
      const result = await signInWithPassword(email, password);
      if (result.error) {
        setError(result.error);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    clearMessages();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const result = await signUp(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        setStatus("Account created! Check your email to confirm, then sign in.");
        setMode("signin");
        setPassword("");
        setConfirmPassword("");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    clearMessages();
    setLoading(true);
    try {
      const result = await sendPasswordReset(email);
      if (result.error) {
        setError(result.error);
      } else {
        setStatus("Password reset link sent! Check your email.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    clearMessages();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setLoading(true);
    try {
      await sendEmailOtp(trimmed);
      setStatus("Magic link sent! Check your email to sign in.");
    } catch {
      setError("Could not send email. Double-check the address.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signin") handleSignIn();
    else if (mode === "signup") handleSignUp();
    else handleForgotPassword();
  };

  const title = mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Reset password";
  const subtitle =
    mode === "signin"
      ? "Welcome back! Sign in to continue your practice."
      : mode === "signup"
        ? "Create an account to track your progress."
        : "Enter your email and we'll send a reset link.";

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-14">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-4xl font-extrabold text-zinc-900">{title}</h1>
        <p className="mt-3 text-zinc-600">{subtitle}</p>
      </div>

      <div className="mx-auto mt-10 max-w-xl rounded-3xl border-2 border-orange-100 bg-white p-6 shadow-lg sm:p-8">
        {/* Tab switcher */}
        {mode !== "forgot" && (
          <div className="flex rounded-2xl bg-orange-50 p-1">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                mode === "signin"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                mode === "signup"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              Create account
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 text-base text-zinc-900 shadow-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
            />
          </div>

          {/* Password (not shown for forgot mode) */}
          {mode !== "forgot" && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                required
                minLength={6}
                className="w-full rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 text-base text-zinc-900 shadow-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
              />
            </div>
          )}

          {/* Confirm password (sign-up only) */}
          {mode === "signup" && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-700">
                Confirm password
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
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-4 text-base font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-[0.99] disabled:opacity-60"
          >
            {loading
              ? "Loading…"
              : mode === "signin"
                ? "Sign in"
                : mode === "signup"
                  ? "Create account"
                  : "Send reset link"}
          </button>

          {/* Forgot password link (sign-in only) */}
          {mode === "signin" && (
            <button
              type="button"
              onClick={() => switchMode("forgot")}
              className="block w-full text-center text-sm text-zinc-500 hover:text-orange-600 transition"
            >
              Forgot your password?
            </button>
          )}

          {/* Magic link alternative (sign-in only) */}
          {mode === "signin" && (
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-orange-100" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-zinc-400">or</span>
              </div>
            </div>
          )}
          {mode === "signin" && (
            <button
              type="button"
              onClick={handleMagicLink}
              disabled={loading}
              className="w-full rounded-2xl border-2 border-orange-200 bg-white px-5 py-3.5 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 active:scale-[0.99] disabled:opacity-60"
            >
              Sign in with magic link instead
            </button>
          )}

          {/* Back to sign-in (forgot mode) */}
          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className="block w-full text-center text-sm text-zinc-500 hover:text-orange-600 transition"
            >
              Back to sign in
            </button>
          )}

          {/* Status / error messages */}
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
        </form>
      </div>
    </div>
  );
}
