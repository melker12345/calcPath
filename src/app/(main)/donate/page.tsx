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

  const amount = selected ?? (custom ? Math.round(parseFloat(custom) * 100) : 0);
  const valid = amount >= 100;

  const handleDonate = async () => {
    if (!valid || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, email: user?.email ?? undefined }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const isCustomActive = selected === null && custom !== "";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-20">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-rose-400 text-2xl font-bold text-white shadow-lg shadow-orange-200">
          ∫
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
          Support CalcPath
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-zinc-600">
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
                }}
                className={`group relative rounded-2xl border-2 p-4 text-left transition ${
                  active
                    ? "border-orange-400 bg-orange-50 shadow-md shadow-orange-100"
                    : "border-zinc-100 bg-white hover:border-orange-200 hover:shadow-sm"
                }`}
              >
                <span
                  className={`text-2xl font-bold ${
                    active ? "text-orange-600" : "text-zinc-900"
                  }`}
                >
                  {label}
                </span>
                <span
                  className={`mt-1 block text-sm ${
                    active ? "text-orange-500" : "text-zinc-400"
                  }`}
                >
                  {note}
                </span>
                {active && (
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
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
                ? "border-orange-400 bg-orange-50 shadow-md shadow-orange-100"
                : "border-zinc-100 bg-white hover:border-orange-200"
            }`}
          >
            <span className="shrink-0 px-2 text-lg font-bold text-zinc-400 sm:px-3">$</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Custom amount"
              value={custom}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, "");
                setCustom(v);
                setSelected(null);
              }}
              onFocus={() => setSelected(null)}
              className="min-w-0 flex-1 bg-transparent py-4 pl-1.5 pr-3 text-lg font-semibold text-zinc-900 outline-none placeholder:font-normal placeholder:text-zinc-300"
            />
            {isCustomActive && custom && (
              <span className="shrink-0 whitespace-nowrap px-4 text-sm text-orange-500 sm:px-5">
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
          className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-orange-200 transition hover:shadow-xl disabled:opacity-40"
        >
          {loading
            ? "Redirecting to Stripe…"
            : valid
              ? `Donate $${(amount / 100).toFixed(amount % 100 === 0 ? 0 : 2)}`
              : "Choose an amount"}
        </button>
        <p className="mt-3 text-center text-sm text-zinc-400">
          Secure payment via Stripe. One-time, no recurring charges.
        </p>
      </div>

      {/* What donations support */}
      <div className="mt-14 rounded-2xl border-2 border-zinc-100 bg-white p-6 sm:p-8">
        <h2 className="text-lg font-bold text-zinc-900">What your donation supports</h2>
        <ul className="mt-4 space-y-3 text-base text-zinc-600">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-orange-400">→</span>
            Hosting and infrastructure to keep CalcPath fast and free
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-orange-400">→</span>
            New topics — Statistics, Linear Algebra, and Discrete Math are on the way
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
