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
        <h1 className="text-3xl font-semibold">Pricing</h1>
        <p className="text-sm text-zinc-500">
          Start free. Upgrade for structured learning paths and community.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold">Free</h2>
          <p className="text-3xl font-semibold">$0</p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-500">
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

        <div className="rounded-2xl border border-zinc-900 bg-zinc-900 p-6 text-white shadow-sm">
          <h2 className="text-xl font-semibold">Pro</h2>
          <p className="text-3xl font-semibold">$12/mo</p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-200">
            <li>Guided learning paths</li>
            <li>Streaks, goals, and reminders</li>
            <li>Community forum access</li>
            <li>Advanced analytics</li>
          </ul>
          <div className="mt-6">
            {user ? (
              <button
                type="button"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-900"
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
              <Link className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-900" href="/">
                Create free account
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
