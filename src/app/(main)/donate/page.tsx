"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";

const PRESETS = [
  { cents: 300, label: "$3", note: "A coffee" },
  { cents: 500, label: "$5", note: "A good coffee" },
  { cents: 1000, label: "$10", note: "A chapter's worth" },
  { cents: 2000, label: "$20", note: "A textbook chapter" },
] as const;

export default function DonatePage() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<number | null>(500);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = selected ?? (custom ? Math.round(parseFloat(custom) * 100) : 0);
  const valid = Number.isFinite(amount) && amount >= 100;

  const clearError = () => {
    if (error) setError(null);
  };

  const handleDonate = async () => {
    if (!valid || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, email: user?.email ?? undefined }),
      });

      let data: { url?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        // Response wasn't JSON — fall through to a status-based error below.
      }

      if (!res.ok) {
        setError(data.error ?? "Couldn't start checkout. Please try again.");
        return;
      }

      if (!data.url) {
        setError("Checkout session created but no redirect URL was returned.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const isCustomActive = selected === null && custom !== "";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-20">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-rose-400 text-2xl font-bold text-white shadow-lg shadow-orange-200 dark:shadow-none dark:from-orange-500 dark:to-rose-500">
          ∫
        </div>
        <h1 className="text-3xl font-bold theme-text sm:text-4xl">
          Support CalcPath
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed theme-text-secondary">
          CalcPath is and will always be free. Every lesson, practice problem, and test is
          available to everyone — no paywalls, no tiers. If CalcPath has helped you learn,
          a donation helps us keep building.
        </p>
      </div>

      {/* Amount selection */}
      <div className="mt-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PRESETS.map(({ cents, label, note }) => {
            const active = selected === cents;
            return (
              <button
                key={cents}
                onClick={() => {
                  setSelected(cents);
                  setCustom("");
                  clearError();
                }}
                className={`group relative rounded-2xl border-2 p-4 text-left transition ${
                  active
                    ? "border-orange-400 bg-orange-50 shadow-md shadow-orange-100 dark:border-orange-500 dark:bg-orange-950/30 dark:shadow-none"
                    : "border-zinc-100 bg-white hover:border-orange-200 hover:shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)] dark:hover:border-[var(--accent)]"
                }`}
              >
                <span
                  className={`text-2xl font-bold ${
                    active ? "text-orange-600 dark:text-orange-400" : "theme-text"
                  }`}
                >
                  {label}
                </span>
                <span
                  className={`mt-1 block text-sm ${
                    active ? "text-orange-500 dark:text-orange-300" : "theme-text-muted"
                  }`}
                >
                  {note}
                </span>
                {active && (
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white dark:bg-orange-400">
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom amount */}
        <div className="mt-4">
          <div
            className={`flex items-center overflow-hidden rounded-2xl border-2 transition ${
              isCustomActive
                ? "border-orange-400 bg-orange-50 shadow-md shadow-orange-100 dark:border-orange-500 dark:bg-orange-950/30 dark:shadow-none"
                : "border-zinc-100 bg-white hover:border-orange-200 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:hover:border-[var(--accent)]"
            }`}
          >
            <span className="shrink-0 px-2 text-lg font-bold text-zinc-400 sm:px-3 dark:text-[var(--text-muted)]">$</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Custom amount"
              value={custom}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, "");
                setCustom(v);
                setSelected(null);
                clearError();
              }}
              onFocus={() => setSelected(null)}
              className="min-w-0 flex-1 bg-transparent py-4 pl-1.5 pr-3 text-lg font-semibold text-zinc-900 outline-none placeholder:font-normal placeholder:text-zinc-300 dark:text-[var(--text-primary)] dark:placeholder:text-[var(--text-muted)]"
            />
            {isCustomActive && custom && (
              <span className="shrink-0 whitespace-nowrap px-4 text-sm text-orange-500 sm:px-5 dark:text-orange-300">
                {parseFloat(custom) >= 1 ? "Thank you!" : "Min $1"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Donate button */}
      <div className="mt-8">
        <button
          onClick={handleDonate}
          disabled={!valid || loading}
          className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-orange-200 transition hover:shadow-xl disabled:opacity-40 dark:shadow-none dark:from-orange-600 dark:to-rose-600"
        >
          {loading
            ? "Redirecting to Stripe…"
            : valid
              ? `Donate $${(amount / 100).toFixed(amount % 100 === 0 ? 0 : 2)}`
              : "Choose an amount"}
        </button>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
          >
            {error}
          </p>
        )}
        <p className="mt-3 text-center text-sm text-zinc-400 dark:text-[var(--text-muted)]">
          Secure payment via Stripe. One-time, no recurring charges.
        </p>
      </div>

      {/* What donations support */}
      <div className="mt-14 theme-card-light theme-border rounded-2xl border-2 p-6 sm:p-8">
        <h2 className="text-lg font-bold theme-text">What your donation supports</h2>
        <ul className="mt-4 space-y-3 text-base theme-text-secondary">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-orange-400">→</span>
            Hosting and infrastructure to keep CalcPath fast and free
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-orange-400">→</span>
            New subjects and topics — Discrete Math and beyond
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-orange-400">→</span>
            More practice problems with step-by-step solutions
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-orange-400">→</span>
            Continued development by a small independent team
          </li>
        </ul>
      </div>
    </div>
  );
}
