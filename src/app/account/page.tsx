"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { useProgress } from "@/components/progress-provider";
import { SectionCard } from "@/components/section-card";

export default function AccountPage() {
  const { user, signOut } = useAuth();
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
          <p className="text-sm text-zinc-500">Email</p>
          <p className="font-medium">{user.email}</p>
          <p className="mt-4 text-sm text-zinc-500">Plan</p>
          <p className="font-medium">{user.plan.toUpperCase()}</p>
          <p className="mt-4 text-sm text-zinc-500">Member since</p>
          <p className="font-medium">
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </SectionCard>
        <SectionCard title="Data & security">
          <p className="text-sm text-zinc-500">
            Your progress is stored locally in this demo.
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
