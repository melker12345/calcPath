"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { trackEvent } from "@/lib/analytics";

export default function PricingPage() {
  const { user, isPro } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("view_pricing", {
      plan: user ? (isPro ? "pro" : "free") : "anonymous",
    });
  }, [user, isPro]);

  const handleUpgrade = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        trackEvent("upgrade_plan");
        window.location.href = data.url;
      }
    } catch {
      setError("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleManage = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Failed to open billing portal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-zinc-900">Pricing</h1>
        <p className="text-sm text-zinc-600">
          Read all modules for free. Upgrade for practice, tests, and full analytics.
        </p>
      </div>

      {error && (
        <div className="mx-auto mb-6 max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Free plan */}
        <div className="rounded-3xl border-2 border-orange-100 bg-white p-8 shadow-lg">
          <h2 className="text-xl font-bold text-zinc-900">Free</h2>
          <p className="mt-2 text-4xl font-bold text-zinc-900">
            $0<span className="text-lg font-medium text-zinc-500">/forever</span>
          </p>
          <ul className="mt-6 space-y-3 text-base text-zinc-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-500">✓</span>
              All module explanations & worked examples
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-500">✓</span>
              5 preview practice problems per module
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-500">✓</span>
              &ldquo;Explain it simply&rdquo; sections
            </li>
          </ul>
          <div className="mt-8">
            {user ? (
              <div className="rounded-2xl bg-zinc-100 px-4 py-3 text-center text-sm font-medium text-zinc-600">
                {isPro ? "Included in your Pro plan" : "Your current plan"}
              </div>
            ) : (
              <Link
                className="block rounded-2xl bg-zinc-100 px-4 py-3 text-center text-sm font-semibold text-zinc-700 transition hover:bg-zinc-200"
                href="/auth"
              >
                Create free account
              </Link>
            )}
          </div>
        </div>

        {/* Pro plan */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-rose-500 p-8 text-white shadow-xl">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative">
            <div className="mb-1 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              Most popular
            </div>
            <h2 className="text-xl font-bold">Pro</h2>
            <p className="mt-2 text-4xl font-bold">
              $8<span className="text-lg font-medium text-orange-100">/month</span>
            </p>
            <ul className="mt-6 space-y-3 text-base text-orange-100">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-white">✓</span>
                <span className="text-white">Everything in Free</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-white">✓</span>
                Unlimited practice problems with smart input
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-white">✓</span>
                20-question module tests with detailed solutions
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-white">✓</span>
                Full dashboard, streaks & progress analytics
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-white">✓</span>
                Flashcards for every topic
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-white">✓</span>
                Achievement emblems
              </li>
            </ul>
            <div className="relative mt-8">
              {user ? (
                isPro ? (
                  <button
                    type="button"
                    className="w-full rounded-2xl bg-white px-4 py-3 text-base font-semibold text-orange-600 shadow-lg transition hover:shadow-xl disabled:opacity-60"
                    onClick={handleManage}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Manage subscription"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="w-full rounded-2xl bg-white px-4 py-3 text-base font-semibold text-orange-600 shadow-lg transition hover:shadow-xl hover:scale-[1.02] disabled:opacity-60"
                    onClick={handleUpgrade}
                    disabled={loading}
                  >
                    {loading ? "Redirecting to checkout..." : "Upgrade to Pro — $8/mo"}
                  </button>
                )
              ) : (
                <Link
                  className="block rounded-2xl bg-white px-4 py-3 text-center text-base font-semibold text-orange-600 shadow-lg transition hover:shadow-xl"
                  href="/auth"
                >
                  Sign up to get Pro
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ / trust */}
      <div className="mt-12 text-center text-sm text-zinc-500">
        <p>Cancel anytime from your account page. No questions asked.</p>
        <p className="mt-1">Payments securely processed by Stripe.</p>
      </div>
    </div>
  );
}
