"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/practice", label: "Practice" },
  { href: "/modules", label: "Modules" },
  { href: "/paths", label: "Learning Paths" },
  { href: "/streaks", label: "Streaks" },
  { href: "/forum", label: "Forum" },
  { href: "/pricing", label: "Pricing" },
];

export const SiteHeader = () => {
  const { user, isPro, signInWithGoogle, sendEmailOtp, sendPhoneOtp, verifyOtp, signOut } =
    useAuth();
  const [mode, setMode] = useState<"google" | "email" | "phone">("google");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState<{ email?: string; phone?: string } | null>(
    null,
  );
  const [status, setStatus] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/80 backdrop-blur-xl dark:border-blue-900/30 dark:bg-zinc-950/80">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">CalcPath</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-300">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-emerald-600 dark:hover:text-emerald-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-zinc-600 dark:text-zinc-300">
                {user.email ?? user.phone ?? user.id.slice(0, 8)} ·{" "}
                {(isPro ? "PRO" : "FREE")}
              </span>
              <Link
                className="rounded-full border border-zinc-300 px-3 py-1 text-sm"
                href="/account"
              >
                Account
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="rounded-full bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
              >
                Sign out
              </button>
            </>
          ) : (
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                    mode === "google"
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "border border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                  }`}
                  onClick={() => {
                    setMode("google");
                    setStatus(null);
                    setPending(null);
                  }}
                >
                  Google
                </button>
                <button
                  type="button"
                  className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                    mode === "email"
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "border border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                  }`}
                  onClick={() => {
                    setMode("email");
                    setStatus(null);
                    setPending(null);
                  }}
                >
                  Email
                </button>
                <button
                  type="button"
                  className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                    mode === "phone"
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "border border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                  }`}
                  onClick={() => {
                    setMode("phone");
                    setStatus(null);
                    setPending(null);
                  }}
                >
                  Phone
                </button>
              </div>

              {mode === "google" && (
                <button
                  type="button"
                  onClick={async () => {
                    setStatus(null);
                    await signInWithGoogle();
                  }}
                  className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
                >
                  Continue with Google
                </button>
              )}

              {mode === "email" && (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email"
                    className="rounded-full border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      setStatus(null);
                      const trimmed = email.trim().toLowerCase();
                      if (!trimmed) return;
                      await sendEmailOtp(trimmed);
                      setPending({ email: trimmed });
                      setStatus("Check your email for a login link or code.");
                    }}
                    className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
                  >
                    Send link/code
                  </button>
                </div>
              )}

              {mode === "phone" && (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Phone (+1...)"
                    className="rounded-full border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      setStatus(null);
                      const trimmed = phone.trim();
                      if (!trimmed) return;
                      await sendPhoneOtp(trimmed);
                      setPending({ phone: trimmed });
                      setStatus("SMS sent. Enter the code below.");
                    }}
                    className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
                  >
                    Send SMS
                  </button>
                </div>
              )}

              {(pending?.email || pending?.phone) && (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <input
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    placeholder="Code"
                    className="w-32 rounded-full border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      setStatus(null);
                      await verifyOtp({
                        email: pending.email,
                        phone: pending.phone,
                        token: otp,
                      });
                      setOtp("");
                      setPending(null);
                      setStatus("Signed in!");
                    }}
                    className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-500 hover:shadow-lg"
                  >
                    Verify
                  </button>
                </div>
              )}

              {status && (
                <div className="text-xs text-zinc-500 dark:text-zinc-300">
                  {status}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
