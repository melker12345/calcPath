"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppStateProviders } from "@/components/scoped-providers";
import { useProgress } from "@/components/progress-provider";
import { subjectList } from "@/lib/subjects";
import { getPracticeProgress, getSectionPracticeProgress } from "@/lib/progress";

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

  // Expandable chapters state (keyed by "subjectSlug-ch-N")
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  const toggleChapter = (key: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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
                  href={`/${subject.slug}`}
                  className="text-sm font-medium text-[var(--accent)] hover:underline"
                >
                  Browse chapters →
                </Link>
              </div>

              <div className="mt-1 text-sm theme-text-muted">
                {subject.solved} of {subject.total} problems solved ({percent}%)
              </div>

              {/* Chapters (expandable cards) */}
              <div className="mt-4">
                <div className="mb-3 text-xs font-medium uppercase tracking-[1px] theme-text-muted">
                  Chapters
                </div>

                <div className="space-y-3">
                  {(subject.modules ?? []).map((mod, index) => {
                    const topic = subject.topicsWithProgress.find(t => t.id === mod.topicId);
                    if (!topic) return null;

                    const isComplete = topic.total > 0 && topic.correct === topic.total;
                    const questionsLeft = Math.max(0, topic.total - topic.correct);
                    const chapterNum = index + 1;
                    const accuracy = topic.total > 0 ? Math.round((topic.correct / topic.total) * 100) : 0;
                    const chapterKey = `${subject.slug}-ch-${chapterNum}`;
                    const isExpanded = !!expandedChapters[chapterKey];

                    return (
                      <div key={mod.topicId} className="rounded-xl border theme-border theme-surface overflow-hidden">
                        {/* Chapter card header - always shows overall chapter progress */}
                        <button
                          onClick={() => toggleChapter(chapterKey)}
                          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--surface-2)] transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded bg-[var(--surface-2)] theme-text-muted shrink-0">
                              Ch. {chapterNum}
                            </span>
                            <span className="font-semibold theme-text truncate">
                              {topic.title}
                            </span>
                            <span className="text-xs theme-text-muted hidden sm:inline">
                              — {topic.correct}/{topic.total} solved
                              {questionsLeft > 0 && ` (${questionsLeft} left)`}
                              — {accuracy}% accuracy
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm tabular-nums shrink-0">
                            <span className={`text-lg leading-none transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                              ▾
                            </span>
                          </div>
                        </button>

                        {/* Expanded: breakdown of topics/sections inside the chapter */}
                        {isExpanded && (
                          <div className="border-t theme-border px-4 py-4 bg-[var(--surface)]/40 text-sm">
                            {/* Individual sections with question counts + user progress */}
                            {mod.sections && mod.sections.length > 0 && (
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-widest theme-text-muted mb-2">
                                  Topics in this chapter
                                </div>
                                <div className="space-y-1">
                                  {mod.sections.map((section, sIndex) => {
                                    // Use the explicit stable section slug from module data.
                                    // This must match the `section` field on the corresponding questions.
                                    const sectionSlug = section.section;

                                    const secStats = sectionSlug
                                      ? getSectionPracticeProgress(
                                          progress,
                                          topic.id,
                                          sectionSlug,
                                          subject.problems
                                        )
                                      : { total: 0, correct: 0, attempted: 0, attemptedRate: 0, masteryRate: 0, accuracyRate: 0, isComplete: false };

                                    const hasData = secStats.total > 0;
                                    const solved = hasData ? secStats.correct : 0;
                                    const total = hasData ? secStats.total : 0;

                                    return (
                                      <div key={sIndex} className="flex justify-between items-center pl-1 text-sm">
                                        <span className="theme-text-secondary">{section.title}</span>
                                        <span className="tabular-nums text-xs theme-text-muted">
                                          {hasData ? `${solved} / ${total}` : "—"}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="mt-2 text-xs theme-text-muted pl-1">
                                  Section progress requires explicit <code>section</code> tags on both module sections and questions.
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {subject.solved === 0 && (
                <div className="mt-4 text-sm theme-text-muted">
                  You haven’t practiced this subject yet.{" "}
                  <Link href={`/${subject.slug}`} className="text-[var(--accent)] hover:underline">
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
