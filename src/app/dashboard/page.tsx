"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SectionCard } from "@/components/section-card";
import { ProgressBar } from "@/components/progress-bar";
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
  const [attemptedTotal, setAttemptedTotal] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  useEffect(() => {
    trackEvent("view_dashboard", {
      plan: user ? (isPro ? "pro" : "free") : "anonymous",
    });
  }, [user, isPro]);

  useEffect(() => {
    // Calculate progress on client only to avoid hydration mismatch
    const solved = progress.completedProblemIds.length;
    const attempted = progress.attemptedProblemIds?.length ?? progress.attempts.length;
    setTotalSolved(solved);
    setAttemptedTotal(attempted);
    setCompletion(Math.round((solved / totalProblems) * 100));
    setAccuracy(attempted === 0 ? 0 : Math.round((solved / attempted) * 100));
  }, [
    progress.completedProblemIds.length,
    progress.attempts.length,
    progress.attemptedProblemIds?.length,
    totalProblems,
  ]);

  const recentDays = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of progress.attempts) {
      const day = a.createdAt.slice(0, 10);
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
    const days: Array<{ day: string; count: number }> = [];
    for (let i = 13; i >= 0; i -= 1) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      days.push({ day: d, count: counts.get(d) ?? 0 });
    }
    return days;
  }, [progress.attempts]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-sm text-zinc-500">
            {user
              ? `Welcome back, ${user.email ?? "student"}`
              : "Sign in to sync progress across devices."}
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
        <SectionCard title="Overall progress" description="Solved across all topics.">
          <div className="flex items-end justify-between">
            <div className="text-3xl font-semibold">{completion}%</div>
            <div className="text-sm text-zinc-500">
              {totalSolved}/{totalProblems}
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar value={completion} label="Completion" />
          </div>
          <p className="mt-3 text-sm text-zinc-500">
            Attempted {attemptedTotal} problems total.
          </p>
        </SectionCard>
        <SectionCard title="Current Streak">
          <div className="text-3xl font-semibold">{progress.streak.current}</div>
          <p className="text-sm text-zinc-500">
            Longest streak: {progress.streak.longest} days
          </p>
          <div className="mt-4 flex items-center gap-1">
            {recentDays.map((d) => {
              const intensity =
                d.count === 0
                  ? "bg-zinc-100 dark:bg-zinc-800"
                  : d.count < 3
                    ? "bg-emerald-200 dark:bg-emerald-900/40"
                    : d.count < 6
                      ? "bg-emerald-400 dark:bg-emerald-700/60"
                      : "bg-emerald-600 dark:bg-emerald-500/80";
              return (
                <div
                  key={d.day}
                  title={`${d.day}: ${d.count} attempts`}
                  className={`h-4 w-4 rounded ${intensity}`}
                />
              );
            })}
          </div>
          <p className="mt-2 text-xs text-zinc-500">Last 14 days activity</p>
        </SectionCard>
        <SectionCard title="Accuracy" description="Correct vs attempted problems.">
          <div className="flex items-end justify-between">
            <div className="text-3xl font-semibold">{accuracy}%</div>
            <div className="text-sm text-zinc-500">
              {totalSolved}/{attemptedTotal || 0}
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar value={accuracy} label="Accuracy" />
          </div>
          {!isPro && (
            <p className="mt-3 text-sm text-zinc-500">
              Pro unlocks deeper analytics and learning paths.
            </p>
          )}
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
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="font-medium">{topic.title}</div>
                    <div className="mt-2">
                      <ProgressBar value={stats.masteryRate} />
                    </div>
                    <div className="mt-2 text-xs text-zinc-500">
                      {stats.solved}/{totals} attempted · {stats.correct} correct ·{" "}
                      {stats.accuracyRate}% accuracy
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
