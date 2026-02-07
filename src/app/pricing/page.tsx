"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { trackEvent } from "@/lib/analytics";

export default function PricingPage() {
  const { user, isPro, setMembership } = useAuth();

  useEffect(() => {
    trackEvent("view_pricing", { plan: user ? (isPro ? "pro" : "free") : "anonymous" });
  }, [user, isPro]);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-zinc-900">Pricing</h1>
        <p className="text-sm text-zinc-600">
          Start free. Upgrade for structured learning paths and community.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border-2 border-orange-100 bg-white p-6 shadow-lg">
          <h2 className="text-xl font-bold text-zinc-900">Free</h2>
          <p className="text-3xl font-bold text-zinc-900">$0</p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-600">
            <li>All calculus practice problems</li>
            <li>Topic progress tracking</li>
            <li>Basic insights</li>
          </ul>
          <div className="mt-6">
            {user ? (
              <button
                type="button"
                className="btn-secondary w-full"
                onClick={() => {
                  setMembership({ plan: "free", proUntil: null });
                  trackEvent("downgrade_plan");
                }}
              >
                {isPro ? "Switch to free" : "Current plan"}
              </button>
            ) : (
              <Link className="btn-secondary w-full text-center" href="/">
                Start free
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-orange-500 to-rose-500 p-6 text-white shadow-xl">
          <h2 className="text-xl font-bold">Pro</h2>
          <p className="text-3xl font-bold">$12/mo</p>
          <ul className="mt-4 space-y-2 text-sm text-orange-100">
            <li>Guided learning paths</li>
            <li>Streaks, goals, and reminders</li>
            <li>Community forum access</li>
            <li>Advanced analytics</li>
          </ul>
          <div className="mt-6">
            {user ? (
              <button
                type="button"
                className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-orange-600 shadow-lg transition hover:shadow-xl"
                onClick={() => {
                  // Mock upgrade: grant 30 days of Pro in the profile.
                  const proUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
                  setMembership({ plan: "pro", proUntil });
                  trackEvent("upgrade_plan");
                }}
              >
                {isPro ? "Current plan" : "Upgrade to Pro"}
              </button>
            ) : (
              <Link className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-orange-600 shadow-lg" href="/">
                Create free account
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
