"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

type PaywallGateProps = {
  children: React.ReactNode;
  /** What the user is trying to access (shown in the gate message) */
  feature: string;
};

/**
 * Wraps protected content. If the user is not Pro, shows an upgrade prompt.
 * If the user is not signed in at all, prompts them to sign in first.
 */
export function PaywallGate({ children, feature }: PaywallGateProps) {
  const { user, isPro } = useAuth();

  // Pro users see everything
  if (isPro) return <>{children}</>;

  // Not signed in
  if (!user) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-12 text-center sm:px-6 sm:py-20">
        <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-5 shadow-xl sm:rounded-3xl sm:p-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-rose-100 text-4xl">
            🎯
          </div>
          <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl">
            {feature} is a Pro feature
          </h2>
          <p className="mt-3 text-zinc-600">
            Sign up for free to explore modules, or upgrade to Pro for full access to {feature.toLowerCase()}, tests, dashboard, and more.
          </p>

          {/* Free sample nudge */}
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-medium text-emerald-800">
              Want a taste first?{" "}
              <Link href="/try" className="font-bold underline hover:text-emerald-900">
                Try 5 free problems
              </Link>{" "}
              — no sign-up needed.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/auth"
              className="rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-8 py-3 font-bold text-white shadow-md transition hover:shadow-lg"
            >
              Sign up free
            </Link>
            <Link
              href="/modules"
              className="rounded-2xl border-2 border-orange-200 bg-white px-8 py-3 font-semibold text-orange-700 transition hover:bg-orange-50"
            >
              Browse free modules
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Signed in but not Pro
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12 text-center sm:px-6 sm:py-20">
      <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-5 shadow-xl sm:rounded-3xl sm:p-10">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-rose-400 text-4xl text-white shadow-lg">
          ⭐
        </div>
        <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl">Upgrade to access {feature}</h2>
        <p className="mt-3 text-zinc-600">
          {feature} is available to Pro members. Unlock everything for just $8/mo.
        </p>
        <ul className="mt-5 space-y-2 text-left text-sm text-zinc-700">
          <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> 240+ practice problems</li>
          <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Module tests with score tracking</li>
          <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Personal dashboard & analytics</li>
          <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Flash cards for all formulas</li>
          <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Structured learning paths</li>
        </ul>

        {/* Free sample nudge */}
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-medium text-emerald-800">
            Not sure yet?{" "}
            <Link href="/try" className="font-bold underline hover:text-emerald-900">
              Try 5 free problems
            </Link>{" "}
            to see what Pro is like.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/pricing"
            className="rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-8 py-3 font-bold text-white shadow-md transition hover:shadow-lg"
          >
            Upgrade to Pro
          </Link>
          <Link
            href="/modules"
            className="rounded-2xl border-2 border-orange-200 bg-white px-8 py-3 font-semibold text-orange-700 transition hover:bg-orange-50"
          >
            Browse free modules
          </Link>
        </div>
      </div>
    </div>
  );
}
