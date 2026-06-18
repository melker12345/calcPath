"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AppStateProviders } from "@/components/scoped-providers";
import { useProgress } from "@/components/progress-provider";
import type { NavSubject } from "@/lib/subjects";
import { getPracticeProgress } from "@/lib/progress";
import type { Topic, Problem } from "@/lib/shared-types";

type SlimModule = { topicId: string; sections: Array<{ title: string; section?: string }> };

export type DashboardRealData = Record<
  string,
  { topics: Topic[]; problems: Problem[]; modules?: SlimModule[] }
>;

type SubjectWithProgress = NavSubject & {
  solved: number;
  total: number;
  chapterCount: number;
};

function SubjectRow({ subject }: { subject: SubjectWithProgress }) {
  const percent = subject.total > 0 ? Math.round((subject.solved / subject.total) * 100) : 0;

  return (
    <section className="overflow-hidden rounded-xl border theme-border theme-surface">
      <div className="flex items-stretch">
        <Link
          href={`/dashboard/${subject.slug}`}
          className="flex min-w-0 flex-1 items-center gap-3 px-4 py-4 text-left transition hover:bg-[var(--surface-2)] sm:gap-4"
        >
          <span className="shrink-0 text-xl leading-none" aria-hidden>
            {subject.icon}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold theme-text sm:text-lg">
              {subject.label}
            </h2>
            <p className="mt-0.5 text-xs theme-text-muted sm:text-sm">
              {subject.chapterCount} {subject.chapterCount === 1 ? "chapter" : "chapters"}
              <span className="mx-1.5 opacity-40">·</span>
              <span className="tabular-nums">
                {subject.solved}/{subject.total} solved ({percent}%)
              </span>
            </p>
          </div>
          <div className="hidden w-28 shrink-0 sm:block">
            <div className="h-2 overflow-hidden rounded-full bg-[var(--accent)]/15">
              <div
                className="h-full rounded-full bg-[var(--accent)]"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </Link>
        <Link
          href={`/dashboard/${subject.slug}`}
          className="flex shrink-0 items-center border-l theme-border px-4 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--surface-2)]"
        >
          Open
        </Link>
      </div>
    </section>
  );
}

export default function DashboardContent({
  realData,
  subjectConfigs,
}: {
  realData?: DashboardRealData;
  subjectConfigs?: NavSubject[];
}) {
  return (
    <AppStateProviders>
      <DashboardInner realData={realData} subjectConfigs={subjectConfigs} />
    </AppStateProviders>
  );
}

function DashboardInner({
  realData,
  subjectConfigs,
}: {
  realData?: DashboardRealData;
  subjectConfigs?: NavSubject[];
}) {
  const { progress } = useProgress();
  const activeSubjects = subjectConfigs ?? [];

  const {
    subjectsWithProgress,
    totalSolved,
    totalProblems,
    overallAccuracy,
    masteryPercent,
  } = useMemo(() => {
    const computedSubjects: SubjectWithProgress[] = activeSubjects.map((subject) => {
      const bundle = realData?.[subject.slug];
      const effTopics = bundle?.topics?.length ? bundle.topics : [];
      const effProblems = bundle?.problems?.length ? bundle.problems : [];
      const effModules = bundle?.modules?.length ? bundle.modules : [];

      let solved = 0;
      const total = effProblems.length;

      effTopics.forEach((topic) => {
        const stats = getPracticeProgress(progress, topic.id, effProblems);
        solved += stats.correct;
      });

      return {
        ...subject,
        solved,
        total,
        chapterCount: effModules.length,
      };
    });

    const tSolved = computedSubjects.reduce((sum, s) => sum + s.solved, 0);
    const tProblems = computedSubjects.reduce((sum, s) => sum + s.total, 0);

    let tAttempted = 0;
    let tCorrect = 0;

    computedSubjects.forEach((subject) => {
      const bundle = realData?.[subject.slug];
      const effTopics = bundle?.topics?.length ? bundle.topics : [];
      const effProblems = bundle?.problems?.length ? bundle.problems : [];

      effTopics.forEach((topic) => {
        const stats = getPracticeProgress(progress, topic.id, effProblems);
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
  }, [progress, realData, activeSubjects]);

  const currentStreak = progress.streak?.current ?? 0;
  const bestStreak = progress.streak?.longest ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight theme-text">Dashboard</h1>
        <p className="mt-2 text-sm theme-text-muted">
          Your overall progress across all subjects. Open a subject for chapter breakdown and diagnostics.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold theme-text">Overall progress</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="theme-card-light theme-border p-4 sm:p-5">
            <div className="text-xs font-semibold uppercase tracking-wide theme-text">
              Problems Mastered
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold theme-text">{totalSolved}</span>
              <span className="text-lg theme-text-muted">/ {totalProblems}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-[var(--accent)]/20">
              <div
                className="h-2 rounded-full bg-[var(--accent)] transition-all"
                style={{ width: `${masteryPercent}%` }}
              />
            </div>
            <div className="mt-2 text-sm theme-text-muted">{masteryPercent}% complete</div>
          </div>

          <div className="theme-card-light theme-border p-4 sm:p-5">
            <div className="text-xs font-semibold uppercase tracking-wide theme-text">
              Current Streak
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold theme-text">{currentStreak}</span>
              <span className="text-lg theme-text-muted">days</span>
            </div>
            <div className="mt-3 text-sm theme-text-muted">Best: {bestStreak} days</div>
          </div>

          <div className="theme-card-light theme-border p-4 sm:p-5">
            <div className="text-xs font-semibold uppercase tracking-wide theme-text">Accuracy</div>
            <div className="mt-2 text-4xl font-bold theme-text">{overallAccuracy}%</div>
            <div className="mt-3 text-sm theme-text-muted">First-try success rate</div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold theme-text">Subjects</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {subjectsWithProgress.map((subject) => (
            <SubjectRow key={subject.slug} subject={subject} />
          ))}
        </div>
      </section>

      <div className="mt-10 border-t theme-border pt-6 text-center text-xs theme-text-muted">
        Progress is saved locally and can be synced across devices via /sync.
      </div>
    </div>
  );
}