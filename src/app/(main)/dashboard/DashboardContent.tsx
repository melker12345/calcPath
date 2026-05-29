"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AppStateProviders } from "@/components/scoped-providers";
import { useProgress } from "@/components/progress-provider";
import { subjectList } from "@/lib/subjects";
import { getPracticeProgress } from "@/lib/progress";

export default function DashboardContent() {
  return (
    <AppStateProviders>
      <DashboardInner />
    </AppStateProviders>
  );
}

function DashboardInner() {
  const { progress } = useProgress();

  // Memoize all the expensive progress aggregation so it only recomputes
  // when the actual progress data changes (not on every parent re-render).
  const {
    subjectsWithProgress,
    totalSolved,
    totalProblems,
    overallAccuracy,
    masteryPercent,
  } = useMemo(() => {
    const computedSubjects = subjectList.map((subject) => {
      let solved = 0;
      let total = subject.problems.length;

      const topicsWithProgress = subject.topics.map((topic) => {
        const stats = getPracticeProgress(progress, topic.id, subject.problems);
        solved += stats.correct;
        return {
          ...topic,
          correct: stats.correct,
          total: stats.total,
          percent: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
        };
      });

      const suggestedTopics = topicsWithProgress
        .filter((t) => t.correct > 0 && t.correct < t.total)
        .sort((a, b) => b.percent - a.percent)
        .slice(0, 3);

      return {
        ...subject,
        solved,
        total,
        topicsWithProgress,
        suggestedTopics,
      };
    });

    const tSolved = computedSubjects.reduce((sum, s) => sum + s.solved, 0);
    const tProblems = computedSubjects.reduce((sum, s) => sum + s.total, 0);

    // Single pass for accuracy (was duplicated before)
    let tAttempted = 0;
    let tCorrect = 0;

    subjectList.forEach((subject) => {
      subject.topics.forEach((topic) => {
        const stats = getPracticeProgress(progress, topic.id, subject.problems);
        tAttempted += stats.attempted;
        tCorrect += stats.correct;
      });
    });

    const acc = tAttempted === 0 ? 0 : Math.round((tCorrect / tAttempted) * 100);
    const mPercent = tProblems > 0 ? Math.round((tSolved / tProblems) * 100) : 0;

    return {
      subjectsWithProgress: computedSubjects,
      totalSolved: tSolved,
      totalProblems: tProblems,
      overallAccuracy: acc,
      masteryPercent: mPercent,
    };
  }, [progress]); // Only recompute when the actual progress state changes

  const currentStreak = progress.streak?.current ?? 0;
  const bestStreak = progress.streak?.longest ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight theme-text">
          Dashboard
        </h1>
        <p className="mt-2 text-[15px] theme-text-muted">
          Your progress and suggested practice across all subjects.
        </p>
      </div>

      {/* Stats Overview - restored from old dashboard */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {/* Problems Mastered */}
        <div className="theme-card-light theme-border p-4 sm:p-5">
          <div className="text-xs font-semibold uppercase tracking-wide theme-text">
            Problems Mastered
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold theme-text">
              {totalSolved}
            </span>
            <span className="text-lg theme-text-muted">
              / {totalProblems}
            </span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-[var(--accent)]/20">
            <div
              className="h-2 rounded-full bg-[var(--accent)] transition-all"
              style={{ width: `${masteryPercent}%` }}
            />
          </div>
          <div className="mt-2 text-sm theme-text-muted">
            {masteryPercent}% complete
          </div>
        </div>

        {/* Current Streak */}
        <div className="theme-card-light theme-border p-4 sm:p-5">
          <div className="text-xs font-semibold uppercase tracking-wide theme-text">
            Current Streak
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold theme-text">
              {currentStreak}
            </span>
            <span className="text-lg theme-text-muted">
              days
            </span>
          </div>
          <div className="mt-3 text-sm theme-text-muted">
            Best: {bestStreak} days
          </div>
        </div>

        {/* Accuracy */}
        <div className="theme-card-light theme-border p-4 sm:p-5">
          <div className="text-xs font-semibold uppercase tracking-wide theme-text">
            Accuracy
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold theme-text">
              {overallAccuracy}%
            </span>
          </div>
          <div className="mt-3 text-sm theme-text-muted">
            First-try success rate
          </div>
        </div>
      </div>

      {/* Global summary */}
      <div className="mb-8 rounded-2xl border theme-border theme-surface p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="theme-text-muted">Overall progress</span>
          <span className="font-mono text-lg font-medium tabular-nums theme-text">
            {totalSolved} / {totalProblems}
          </span>
        </div>
      </div>

      <div className="space-y-10">
        {subjectsWithProgress.map((subject) => {
          const percent = subject.total > 0 ? Math.round((subject.solved / subject.total) * 100) : 0;

          return (
            <div key={subject.slug}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{subject.icon}</span>
                  <h2 className="text-2xl font-semibold theme-text">{subject.label}</h2>
                </div>
                <Link
                  href={`/${subject.slug}/practice`}
                  className="text-sm font-medium text-[var(--accent)] hover:underline"
                >
                  Browse all practice →
                </Link>
              </div>

              <div className="mt-1 text-sm theme-text-muted">
                {subject.solved} of {subject.total} problems solved ({percent}%)
              </div>

              {/* Suggested topics to practice */}
              {subject.suggestedTopics.length > 0 && (
                <div className="mt-4">
                  <div className="mb-2 text-xs font-medium uppercase tracking-[1px] theme-text-muted">
                    Continue these topics
                  </div>
                  <div className="space-y-2">
                    {subject.suggestedTopics.map((topic) => (
                      <Link
                        key={topic.id}
                        href={`/${subject.slug}/practice`}
                        className="flex items-center justify-between rounded-xl border theme-border theme-surface px-4 py-3 text-sm transition hover:border-[var(--accent)]/40"
                      >
                        <span className="font-medium theme-text">{topic.title}</span>
                        <span className="tabular-nums text-xs theme-text-muted">
                          {topic.correct} / {topic.total} ({topic.percent}%)
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Fully solved topics */}
              {subject.topicsWithProgress.some((t) => t.correct === t.total && t.total > 0) && (
                <div className="mt-3 text-xs theme-text-muted">
                  {subject.topicsWithProgress.filter((t) => t.correct === t.total).length} topics fully mastered
                </div>
              )}

              {subject.suggestedTopics.length === 0 && subject.solved === 0 && (
                <div className="mt-4 text-sm theme-text-muted">
                  You haven’t practiced this subject yet.{" "}
                  <Link href={`/${subject.slug}/practice`} className="text-[var(--accent)] hover:underline">
                    Start practicing
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-12 border-t theme-border pt-6 text-center text-xs theme-text-muted">
        Progress is saved locally and synced when you are signed in.
      </div>
    </div>
  );
}
