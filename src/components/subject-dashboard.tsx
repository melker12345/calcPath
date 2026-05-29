"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/components/auth-provider";
import { useProgress } from "@/components/progress-provider";
import { getPracticeProgress, getTopicTestStats } from "@/lib/progress";
import { trackEvent } from "@/lib/analytics";
import { getRecommendedDiagnosticAction, summarizeDiagnosticSkills } from "@/lib/diagnostics";
import type { Problem, Topic } from "@/lib/shared-types";

type SubjectDashboardProps = {
  subjectSlug: string;
  topics: Topic[];
  problems: Problem[];
  hasTests?: boolean;
};

// Colors now come from our theme CSS variables for proper light/dark support
// Colors now come entirely from the global theme system.
// No more local color object.

export function SubjectDashboard({
  subjectSlug,
  topics,
  problems,
  hasTests = false,
}: SubjectDashboardProps) {
  const { user } = useAuth();
  const { progress } = useProgress();
  // Colors come from global theme variables via .theme-* classes

  useEffect(() => {
    trackEvent("view_dashboard", {
      subject: subjectSlug,
      plan: user ? "user" : "anonymous",
    });
  }, [user, subjectSlug]);

  const stats = useMemo(() => {
    let totalMastered = 0;
    let totalAttempted = 0;

    for (const topic of topics) {
      const practiceStats = getPracticeProgress(progress, topic.id, problems);
      totalMastered += practiceStats.correct;
      totalAttempted += practiceStats.attempted;
    }

    const accuracy =
      totalAttempted === 0
        ? 0
        : Math.round((totalMastered / totalAttempted) * 100);
    return { totalMastered, totalProblems: problems.length, accuracy };
  }, [progress, topics, problems]);

  const recentDays = useMemo(() => {
    const counts = new Map<string, number>();
    const today = new Date();
    for (const a of progress.attempts) {
      const day = a.createdAt.slice(0, 10);
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
    const days: Array<{ day: string; count: number }> = [];
    for (let i = 13; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const day = date.toISOString().slice(0, 10);
      days.push({ day, count: counts.get(day) ?? 0 });
    }
    return days;
  }, [progress.attempts]);

  const completionPercent = Math.round(
    (stats.totalMastered / stats.totalProblems) * 100
  );

  const diagnosticSummaries = useMemo(
    () => summarizeDiagnosticSkills(progress.diagnostics),
    [progress.diagnostics],
  );
  const diagnosticAction = getRecommendedDiagnosticAction(diagnosticSummaries);
  const testedDiagnostics = diagnosticSummaries.filter((summary) => summary.status !== "not-tested");
  const needsReviewCount = diagnosticSummaries.filter((summary) =>
    summary.status === "weak" || summary.status === "needs-review"
  ).length;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 border-b theme-border pb-5 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight theme-text sm:text-4xl">
            Dashboard
          </h1>
          <p className="text-sm theme-text-muted">
            {user
              ? `Welcome back, ${user.email ?? "student"}`
              : "Sign in to sync progress across devices."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            className="border theme-border px-4 py-2 text-sm font-medium theme-text transition hover:theme-surface-2"
            href={`/${subjectSlug}/practice`}
          >
            Practice
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mb-6 grid gap-4 sm:mb-8 sm:grid-cols-3">
        <div className="theme-card-light theme-border p-4 sm:p-5">
          <div className="text-xs font-semibold uppercase tracking-wide theme-text">
            Problems Mastered
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold theme-text">
              {stats.totalMastered}
            </span>
            <span className="text-lg theme-text-muted">
              / {stats.totalProblems}
            </span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-[var(--accent)]/20">
            <div
              className="h-2 rounded-full bg-[var(--accent)] transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <div className="mt-2 text-sm theme-text-muted">
            {completionPercent}% complete
          </div>
        </div>

        <div className="theme-card-light theme-border p-4 sm:p-5">
          <div
            className="text-xs font-semibold uppercase tracking-wide theme-text">
            Current Streak
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold theme-text">
              {progress.streak.current}
            </span>
            <span className="text-lg theme-text-muted">
              days
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1">
            {recentDays.map((d) => {
              const opacity =
                d.count === 0
                  ? 0.15
                  : d.count < 3
                    ? 0.35
                    : d.count < 6
                      ? 0.6
                      : 0.9;
              return (
                <div
                  key={d.day}
                  title={`${d.day}: ${d.count} attempts`}
                  className="h-3 flex-1 rounded-sm bg-[var(--accent)]" style={{ opacity }}
                />
              );
            })}
          </div>
          <div className="mt-2 text-sm theme-text-muted">
            Best: {progress.streak.longest} days
          </div>
        </div>

        <div className="theme-card-light theme-border p-4 sm:p-5">
          <div className="text-xs font-semibold uppercase tracking-wide theme-text">
            Accuracy
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold theme-text">
              {stats.accuracy}%
            </span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-[var(--accent)]/20">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${stats.accuracy}%`,
                background:
                  stats.accuracy >= 80
                    ? "#22c55e"
                    : stats.accuracy >= 60
                      ? "#f59e0b"
                      : "var(--accent)",
              }}
            />
          </div>
          <div className="mt-2 text-sm theme-text-muted">
            First-try success rate
          </div>
        </div>
      </div>

      {subjectSlug === "calculus" && (
        <div className="mb-6 theme-card-light theme-border p-4 sm:mb-8 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold theme-text">
                Readiness Map
              </h3>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed theme-text-muted">
                Check prerequisite skills and get a suggested starting point before going deeper.
              </p>
            </div>
            <Link
              href="/diagnostic"
              className="inline-flex rounded-xl px-4 py-2 text-sm font-semibold transition bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 shadow-sm"
            >
              {testedDiagnostics.length === 0 ? "Take diagnostic" : "Retake diagnostic"}
            </Link>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <DiagnosticMiniStat label="Skills tested" value={`${testedDiagnostics.length}/${diagnosticSummaries.length}`} />
            <DiagnosticMiniStat label="Needs review" value={String(needsReviewCount)} />
            <DiagnosticMiniStat label="Next step" value={diagnosticAction.label} />
          </div>
        </div>
      )}

      {/* Weekly Goal */}
      <div className="mb-6 grid gap-4 sm:mb-8 sm:grid-cols-2">
        <div className="theme-card-light theme-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold theme-text">
            Weekly Goal
          </h3>
          <p className="mt-1 text-xs theme-text-muted">
            Finish 30 problems this week to keep your streak growing.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 w-full rounded-full bg-[var(--accent)]/20">
              <div
                className="h-2 rounded-full bg-[var(--accent)] transition-all"
                style={{ width: `${Math.min(100, (progress.completedProblemIds.length / 30) * 100)}%` }}
              />
            </div>
            <span className="shrink-0 text-sm font-semibold theme-text-muted">
              {progress.completedProblemIds.length}/30
            </span>
          </div>
          <Link
            className="mt-3 inline-flex rounded-xl px-4 py-2 text-sm font-semibold transition bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 shadow-sm"
            href={`/${subjectSlug}/practice`}
          >
            Keep practicing
          </Link>
        </div>
        <div className="theme-card-light theme-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold theme-text">
            Focus Recommendation
          </h3>
          <p className="mt-1 text-xs theme-text-muted">
            Build consistent mastery with high-impact topics.
          </p>
          <p className="mt-3 text-sm theme-text-muted">
            You have {problems.length} problems available. Start with topics
            where your accuracy is lowest.
          </p>
          <Link
            className="mt-3 inline-flex rounded-xl border px-4 py-2 text-sm font-medium transition theme-border theme-text hover:bg-[var(--surface-2)]"
            href={`/${subjectSlug}/practice`}
          >
            Start practicing
          </Link>
        </div>
      </div>

      {/* Topic Progress */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold theme-text sm:text-xl">
          Topic Progress
        </h2>

        {topics.map((topic) => {
          const practiceStats = getPracticeProgress(
            progress,
            topic.id,
            problems
          );
          const testStats = hasTests
            ? getTopicTestStats(progress, topic.id)
            : null;

          return (
            <div
              key={topic.id}
              className="theme-card-light theme-border p-4 transition sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold theme-text">
                    {topic.title}
                  </h3>
                  <p className="mt-0.5 text-sm theme-text-muted">
                    {topic.description}
                  </p>
                </div>
                <Link
                  href={`/${subjectSlug}/modules/${topic.id}`}
                  className="text-sm font-medium text-[var(--text-muted)] transition hover:opacity-70"
                >
                  View module →
                </Link>
              </div>

              <div
                className={`mt-5 grid gap-6 ${hasTests ? "md:grid-cols-2" : ""}`}
              >
                {/* Practice Progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium theme-text">
                        Practice
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold theme-text">
                        {practiceStats.correct}/{practiceStats.total}
                      </span>
                      {practiceStats.isComplete && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          Complete
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="h-2.5 rounded-full bg-[var(--accent)]/20">
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{
                        width: `${practiceStats.masteryRate}%`,
                        background: practiceStats.isComplete
                          ? "#22c55e"
                          : "var(--accent)",
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="theme-text-muted">
                      {practiceStats.accuracyRate}% accuracy
                    </span>
                    <Link
                      href={`/${subjectSlug}/practice/${topic.id}`}
                      className="font-semibold theme-text transition hover:opacity-80"
                    >
                      Practice →
                    </Link>
                  </div>
                </div>

                {/* Test Progress (only for subjects with tests) */}
                {hasTests && testStats && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium theme-text">
                          Test
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {testStats.bestScore !== null ? (
                          <>
                            <span className="text-sm font-semibold theme-text">
                              {testStats.bestScore}/{testStats.bestTotal}
                            </span>
                            {testStats.isPerfect && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                Perfect
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-sm text-[var(--text-muted)]">
                            Not taken
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="h-2.5 rounded-full bg-[var(--accent)]/20">
                      {testStats.bestPercentage !== null && (
                        <div
                          className="h-2.5 rounded-full transition-all"
                          style={{
                            width: `${testStats.bestPercentage}%`,
                            background: testStats.isPerfect
                              ? "#f59e0b"
                              : (testStats.bestPercentage ?? 0) >= 70
                                ? "#22c55e"
                                : "var(--accent)",
                          }}
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="theme-text-muted">
                        {testStats.attemptCount > 0
                          ? `${testStats.attemptCount} attempt${testStats.attemptCount !== 1 ? "s" : ""}`
                          : "20 questions"}
                      </span>
                      <Link
                        href={`/${subjectSlug}/test/${topic.id}`}
                        className="font-semibold theme-text transition hover:opacity-80"
                      >
                        {testStats.attemptCount > 0
                          ? "Retake →"
                          : "Take Test →"}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DiagnosticMiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="theme-card-light rounded-xl border border-black/5 px-3 py-2">
      <p className="truncate text-sm font-bold text-zinc-900 dark:text-[var(--text-primary)]">{value}</p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-[var(--text-muted)]">
        {label}
      </p>
    </div>
  );
}
