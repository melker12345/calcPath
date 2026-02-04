"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { useProgress } from "@/components/progress-provider";
import { SectionCard } from "@/components/section-card";

export default function AccountPage() {
  const { user, isPro, signOut } = useAuth();
  const { resetProgress } = useProgress();

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <SectionCard title="Sign in required">
          <p className="text-sm text-zinc-500">
            Create a free account to save progress and unlock streak tracking.
          </p>
          <Link className="btn-primary mt-4 inline-flex" href="/">
            Go to home
          </Link>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-semibold">Account</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Profile">
          <p className="text-sm text-zinc-500">User ID</p>
          <p className="font-mono text-sm text-zinc-700 dark:text-zinc-200">
            {user.id}
          </p>
          <p className="mt-4 text-sm text-zinc-500">Email</p>
          <p className="font-medium">{user.email ?? "—"}</p>
          <p className="mt-4 text-sm text-zinc-500">Phone</p>
          <p className="font-medium">{user.phone ?? "—"}</p>
          <p className="mt-4 text-sm text-zinc-500">Plan</p>
          <p className="font-medium">{isPro ? "PRO" : "FREE"}</p>
          <p className="mt-4 text-sm text-zinc-500">Pro valid until</p>
          <p className="font-medium">{user.proUntil ?? "—"}</p>
          <p className="mt-4 text-sm text-zinc-500">Member since</p>
          <p className="font-medium">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
          </p>
        </SectionCard>
        <SectionCard title="Data & security">
          <p className="text-sm text-zinc-500">
            Your session is managed by Supabase. Progress sync is being added next.
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
