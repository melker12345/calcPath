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
      <h1 className="mb-6 text-3xl font-bold text-zinc-900">Account</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Profile">
          <p className="text-sm text-zinc-500">User ID</p>
          <p className="font-mono text-sm text-zinc-700">
            {user.id}
          </p>
          <p className="mt-4 text-sm text-zinc-500">Email</p>
          <p className="font-medium text-zinc-900">{user.email ?? "—"}</p>
          <p className="mt-4 text-sm text-zinc-500">Phone</p>
          <p className="font-medium text-zinc-900">{user.phone ?? "—"}</p>
          <p className="mt-4 text-sm text-zinc-500">Plan</p>
          <p className="font-medium text-zinc-900">{isPro ? "PRO" : "FREE"}</p>
          <p className="mt-4 text-sm text-zinc-500">Pro valid until</p>
          <p className="font-medium text-zinc-900">{user.proUntil ?? "—"}</p>
          <p className="mt-4 text-sm text-zinc-500">Member since</p>
          <p className="font-medium text-zinc-900">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
          </p>
        </SectionCard>
        <SectionCard title="Data & security">
          <p className="text-sm text-zinc-600">
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
