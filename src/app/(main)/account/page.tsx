"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useAuth } from "@/components/auth-provider";
import { useProgress } from "@/components/progress-provider";
import { AdminFeedbackShortcut } from "@/components/admin-feedback-shortcut";
import { SectionCard } from "@/components/section-card";

export default function AccountPage() {
  return (
    <Suspense>
      <AccountContent />
    </Suspense>
  );
}

function AccountContent() {
  const { user, signOut } = useAuth();
  const { resetProgress } = useProgress();

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <SectionCard title="Sign in required">
          <p className="text-sm text-zinc-600">
            Create a free account to save progress and sync reading completion across devices.
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
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-6 border-b border-stone-300 pb-5">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950">Account</h1>
        <p className="mt-2 text-base leading-7 text-stone-700">
          Manage sign-in, progress storage, and administrative shortcuts.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <SectionCard title="Profile">
          <p className="text-sm text-zinc-500">Email</p>
          <p className="font-medium text-zinc-900">{user.email ?? "—"}</p>
          <p className="mt-4 text-sm text-zinc-500">Member since</p>
          <p className="font-medium text-zinc-900">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
          </p>
        </SectionCard>

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

      <div className="mt-4 sm:mt-6">
        <AdminFeedbackShortcut />
      </div>
    </div>
  );
}
