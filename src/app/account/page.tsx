"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useProgress } from "@/components/progress-provider";
import { SectionCard } from "@/components/section-card";

export default function AccountPage() {
  return (
    <Suspense>
      <AccountContent />
    </Suspense>
  );
}

function AccountContent() {
  const { user, isPro, signOut, refreshProfile } = useAuth();
  const { resetProgress } = useProgress();
  const [portalLoading, setPortalLoading] = useState(false);
  const searchParams = useSearchParams();
  const checkoutStatus = searchParams?.get("checkout");

  // After successful checkout, poll for the webhook to update the profile
  useEffect(() => {
    if (checkoutStatus !== "success" || !user) return;

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      await refreshProfile();
      if (attempts >= 10) clearInterval(interval); // stop after ~20s
    }, 2000);

    return () => clearInterval(interval);
  }, [checkoutStatus, user, refreshProfile]);

  const handleManageSubscription = async () => {
    if (!user) return;
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Silently fail — user can try again
    } finally {
      setPortalLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <SectionCard title="Sign in required">
          <p className="text-sm text-zinc-600">
            Create a free account to save progress and unlock streak tracking.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="btn-primary inline-flex" href="/auth">
              Sign in / register
            </Link>
            <Link className="btn-secondary inline-flex" href="/">
              Back to home
            </Link>
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      {checkoutStatus === "success" && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
          <p className="font-semibold">Payment successful!</p>
          <p className="text-sm">
            {isPro
              ? "Your Pro subscription is now active. Enjoy!"
              : "Processing your subscription... This page will update automatically."}
          </p>
        </div>
      )}
      <h1 className="mb-6 text-3xl font-bold text-zinc-900">Account</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile info */}
        <SectionCard title="Profile">
          <p className="text-sm text-zinc-500">Email</p>
          <p className="font-medium text-zinc-900">{user.email ?? "—"}</p>
          <p className="mt-4 text-sm text-zinc-500">Member since</p>
          <p className="font-medium text-zinc-900">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
          </p>
        </SectionCard>

        {/* Subscription */}
        <SectionCard title="Subscription">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                isPro
                  ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {isPro ? "Pro" : "Free"}
            </span>
          </div>
          {isPro && user.proUntil && (
            <div className="mt-3">
              <p className="text-sm text-zinc-500">Current period ends</p>
              <p className="font-medium text-zinc-900">
                {new Date(user.proUntil).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}
          <div className="mt-4">
            {isPro ? (
              <button
                type="button"
                className="btn-secondary w-full"
                onClick={handleManageSubscription}
                disabled={portalLoading}
              >
                {portalLoading ? "Loading..." : "Manage subscription"}
              </button>
            ) : (
              <Link className="btn-primary inline-flex w-full justify-center" href="/pricing">
                Upgrade to Pro
              </Link>
            )}
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            {isPro
              ? "Cancel, change payment method, or view invoices via Stripe."
              : "Unlock practice problems, tests, dashboard & more."}
          </p>
        </SectionCard>

        {/* Data & security */}
        <SectionCard title="Data & security">
          <p className="text-sm text-zinc-600">
            Your progress is synced to the cloud. Resetting progress is irreversible.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={resetProgress}>
              Reset progress
            </button>
            <button className="btn-primary" onClick={signOut}>
              Sign out
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
