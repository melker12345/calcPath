"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useProgress } from "@/components/progress-provider";
import { getPracticeProgress, getTopicTestStats } from "@/lib/progress";
import { trackEvent } from "@/lib/analytics";
import type { SubjectTheme } from "@/lib/themes";
import type { Problem, Topic } from "@/lib/shared-types";

type SubjectDashboardProps = {
  subjectSlug: string;
  theme: SubjectTheme;
  topics: Topic[];
  problems: Problem[];
  hasTests?: boolean;
};

export function SubjectDashboard({
  subjectSlug,
  theme,
  topics,
  problems,
  hasTests = false,
}: SubjectDashboardProps) {
  const { user } = useAuth();
  const { progress } = useProgress();
  const c = theme.colors;

  const [stats, setStats] = useState({
    totalMastered: 0,
    totalProblems: problems.length,
    accuracy: 0,
  });

  useEffect(() => {
    trackEvent("view_dashboard", {
      subject: subjectSlug,
      plan: user ? "user" : "anonymous",
    });
  }, [user, subjectSlug]);

  useEffect(() => {
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
    setStats({ totalMastered, totalProblems: problems.length, accuracy });
  }, [progress, topics, problems]);

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

  const completionPercent = Math.round(
    (stats.totalMastered / stats.totalProblems) * 100
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold sm:text-3xl"
            style={{ color: c.text }}
          >
            Dashboard
          </h1>
          <p className="text-sm" style={{ color: c.textMuted }}>
            {user
              ? `Welcome back, ${user.email ?? "student"}`
              : "Sign in to sync progress across devices."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            className="rounded-lg px-4 py-2 text-sm font-semibold transition hover:opacity-80"
            style={{
              border: `1.5px solid ${c.border}`,
              color: c.text,
            }}
            href={`/${subjectSlug}/practice`}
          >
            Practice
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mb-6 grid gap-4 sm:mb-8 sm:grid-cols-3">
        <div
          className="rounded-xl p-4 sm:rounded-2xl sm:p-5"
          style={{
            background: c.accentBg,
            border: `1.5px solid ${c.border}`,
          }}
        >
          <div
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: c.accent }}
          >
            Problems Mastered
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold" style={{ color: c.text }}>
              {stats.totalMastered}
            </span>
            <span className="text-lg" style={{ color: c.textMuted }}>
              / {stats.totalProblems}
            </span>
          </div>
          <div
            className="mt-3 h-2 rounded-full"
            style={{ background: c.accentLight }}
          >
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${completionPercent}%`,
                background: c.accent,
              }}
            />
          </div>
          <div className="mt-2 text-sm" style={{ color: c.textMuted }}>
            {completionPercent}% complete
          </div>
        </div>

        <div
          className="rounded-xl p-4 sm:rounded-2xl sm:p-5"
          style={{
            background: c.accentBg,
            border: `1.5px solid ${c.border}`,
          }}
        >
          <div
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: c.accent }}
          >
            Current Streak
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold" style={{ color: c.text }}>
              {progress.streak.current}
            </span>
            <span className="text-lg" style={{ color: c.textMuted }}>
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
                  className="h-3 flex-1 rounded-sm"
                  style={{ background: c.accent, opacity }}
                />
              );
            })}
          </div>
          <div className="mt-2 text-sm" style={{ color: c.textMuted }}>
            Best: {progress.streak.longest} days
          </div>
        </div>

        <div
          className="rounded-xl p-4 sm:rounded-2xl sm:p-5"
          style={{
            background: c.accentBg,
            border: `1.5px solid ${c.border}`,
          }}
        >
          <div
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: c.accent }}
          >
            Accuracy
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold" style={{ color: c.text }}>
              {stats.accuracy}%
            </span>
          </div>
          <div
            className="mt-3 h-2 rounded-full"
            style={{ background: c.accentLight }}
          >
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${stats.accuracy}%`,
                background:
                  stats.accuracy >= 80
                    ? "#22c55e"
                    : stats.accuracy >= 60
                      ? "#f59e0b"
                      : c.accent,
              }}
            />
          </div>
          <div className="mt-2 text-sm" style={{ color: c.textMuted }}>
            First-try success rate
          </div>
        </div>
      </div>

      {/* Weekly Goal */}
      <div className="mb-6 grid gap-4 sm:mb-8 sm:grid-cols-2">
        <div
          className="rounded-xl p-4 sm:rounded-2xl sm:p-5"
          style={{ border: `1.5px solid ${c.border}`, background: c.card }}
        >
          <h3 className="text-sm font-semibold" style={{ color: c.text }}>
            Weekly Goal
          </h3>
          <p className="mt-1 text-xs" style={{ color: c.textMuted }}>
            Finish 30 problems this week to keep your streak growing.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div
              className="h-2 w-full rounded-full"
              style={{ background: c.accentLight }}
            >
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (progress.completedProblemIds.length / 30) * 100)}%`,
                  background: c.accent,
                }}
              />
            </div>
            <span
              className="shrink-0 text-sm font-semibold"
              style={{ color: c.textMuted }}
            >
              {progress.completedProblemIds.length}/30
            </span>
          </div>
          <Link
            className="mt-3 inline-flex rounded-lg px-4 py-2 text-sm font-semibold transition hover:brightness-110"
            style={{ background: c.accent, color: c.navAccentText }}
            href={`/${subjectSlug}/practice`}
          >
            Keep practicing
          </Link>
        </div>
        <div
          className="rounded-xl p-4 sm:rounded-2xl sm:p-5"
          style={{ border: `1.5px solid ${c.border}`, background: c.card }}
        >
          <h3 className="text-sm font-semibold" style={{ color: c.text }}>
            Focus Recommendation
          </h3>
          <p className="mt-1 text-xs" style={{ color: c.textMuted }}>
            Build consistent mastery with high-impact topics.
          </p>
          <p className="mt-3 text-sm" style={{ color: c.textMuted }}>
            You have {problems.length} problems available. Start with topics
            where your accuracy is lowest.
          </p>
          <Link
            className="mt-3 inline-flex rounded-lg px-4 py-2 text-sm font-semibold transition hover:opacity-80"
            style={{ border: `1.5px solid ${c.border}`, color: c.text }}
            href={`/${subjectSlug}/practice`}
          >
            Start practicing
          </Link>
        </div>
      </div>

      {/* Topic Progress */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold sm:text-xl" style={{ color: c.text }}>
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
              className="rounded-xl p-4 transition sm:rounded-2xl sm:p-5"
              style={{
                background: c.card,
                border: `1.5px solid ${c.border}`,
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: c.text }}
                  >
                    {topic.title}
                  </h3>
                  <p
                    className="mt-0.5 text-sm"
                    style={{ color: c.textMuted }}
                  >
                    {topic.description}
                  </p>
                </div>
                <Link
                  href={`/${subjectSlug}/modules/${topic.id}`}
                  className="text-sm font-medium transition hover:opacity-70"
                  style={{ color: c.textDim }}
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
                      <span className="font-medium" style={{ color: c.text }}>
                        Practice
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: c.text }}
                      >
                        {practiceStats.correct}/{practiceStats.total}
                      </span>
                      {practiceStats.isComplete && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          Complete
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className="h-2.5 rounded-full"
                    style={{ background: c.accentLight }}
                  >
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{
                        width: `${practiceStats.masteryRate}%`,
                        background: practiceStats.isComplete
                          ? "#22c55e"
                          : c.accent,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: c.textMuted }}>
                      {practiceStats.accuracyRate}% accuracy
                    </span>
                    <Link
                      href={`/${subjectSlug}/practice/${topic.id}`}
                      className="font-semibold transition hover:opacity-80"
                      style={{ color: c.accent }}
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
                        <span
                          className="font-medium"
                          style={{ color: c.text }}
                        >
                          Test
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {testStats.bestScore !== null ? (
                          <>
                            <span
                              className="text-sm font-semibold"
                              style={{ color: c.text }}
                            >
                              {testStats.bestScore}/{testStats.bestTotal}
                            </span>
                            {testStats.isPerfect && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                Perfect
                              </span>
                            )}
                          </>
                        ) : (
                          <span
                            className="text-sm"
                            style={{ color: c.textDim }}
                          >
                            Not taken
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className="h-2.5 rounded-full"
                      style={{ background: c.accentLight }}
                    >
                      {testStats.bestPercentage !== null && (
                        <div
                          className="h-2.5 rounded-full transition-all"
                          style={{
                            width: `${testStats.bestPercentage}%`,
                            background: testStats.isPerfect
                              ? "#f59e0b"
                              : (testStats.bestPercentage ?? 0) >= 70
                                ? "#22c55e"
                                : c.accent,
                          }}
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: c.textMuted }}>
                        {testStats.attemptCount > 0
                          ? `${testStats.attemptCount} attempt${testStats.attemptCount !== 1 ? "s" : ""}`
                          : "20 questions"}
                      </span>
                      <Link
                        href={`/${subjectSlug}/test/${topic.id}`}
                        className="font-semibold transition hover:opacity-80"
                        style={{ color: c.accent }}
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
