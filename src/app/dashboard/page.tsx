"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SectionCard } from "@/components/section-card";
import { useAuth } from "@/components/auth-provider";
import { useProgress } from "@/components/progress-provider";
import { getTopicProgress } from "@/lib/progress";
import { problems, topics } from "@/lib/content";
import { trackEvent } from "@/lib/analytics";

const totalProblemsByTopic = topics.reduce<Record<string, number>>(
  (acc, topic) => {
    acc[topic.id] = problems.filter((problem) => problem.topicId === topic.id)
      .length;
    return acc;
  },
  {},
);

export default function DashboardPage() {
  const { user, isPro } = useAuth();
  const { progress } = useProgress();
  const [totalSolved, setTotalSolved] = useState(0);
  const totalProblems = problems.length;
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    trackEvent("view_dashboard", {
      plan: user ? (isPro ? "pro" : "free") : "anonymous",
    });
  }, [user, isPro]);

  useEffect(() => {
    // Calculate progress on client only to avoid hydration mismatch
    const solved = progress.completedProblemIds.length;
    setTotalSolved(solved);
    setCompletion(Math.round((solved / totalProblems) * 100));
  }, [progress.completedProblemIds.length, totalProblems]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-sm text-zinc-500">
            {user
              ? `Welcome back, ${user.email}`
              : "Sign in to save your progress across devices."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link className="btn-secondary" href="/practice">
            Start practice
          </Link>
          <Link className="btn-primary" href="/paths">
            View learning paths
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <SectionCard title="Overall Progress">
          <div className="text-3xl font-semibold">{completion}%</div>
          <p className="text-sm text-zinc-500">
            {totalSolved} of {totalProblems} problems solved
          </p>
        </SectionCard>
        <SectionCard title="Current Streak">
          <div className="text-3xl font-semibold">{progress.streak.current}</div>
          <p className="text-sm text-zinc-500">
            Longest streak: {progress.streak.longest} days
          </p>
        </SectionCard>
        <SectionCard title="Accuracy">
          <div className="text-3xl font-semibold">
            {progress.attempts.length === 0
              ? 0
              : Math.round(
                  (progress.attempts.filter((a) => a.correct).length /
                    progress.attempts.length) *
                    100,
                )}
            %
          </div>
          <p className="text-sm text-zinc-500">Across all attempts</p>
        </SectionCard>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Topic mastery"
          description="Track your completion and accuracy by topic."
        >
          <div className="space-y-3">
            {topics.map((topic) => {
              const totals = totalProblemsByTopic[topic.id];
              const stats = getTopicProgress(progress, topic.id, totals);
              return (
                <div
                  key={topic.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800"
                >
                  <div>
                    <div className="font-medium">{topic.title}</div>
                    <div className="text-xs text-zinc-500">
                      {stats.solved}/{totals} solved · {stats.accuracyRate}%
                      accuracy
                    </div>
                  </div>
                  <Link
                    className="text-xs font-semibold text-zinc-700 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-300"
                    href={`/practice/${topic.id}`}
                  >
                    Continue →
                  </Link>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Next best actions"
          description="Stay consistent and hit your goals faster."
        >
          <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
            <li>Finish a 10-problem burst today.</li>
            <li>Maintain your streak with a 5-minute review.</li>
            <li>Unlock the Applications path to practice optimization.</li>
          </ul>
          <div className="mt-4 flex gap-2">
            <Link className="btn-secondary" href="/streaks">
              View streaks
            </Link>
            <Link className="btn-primary" href="/pricing">
              Upgrade for paths
            </Link>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
