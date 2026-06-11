"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppStateProviders } from "@/components/scoped-providers";
import { useProgress } from "@/components/progress-provider";
import type { NavSubject } from "@/lib/subjects";
import {
  getPracticeProgress,
  getSectionPracticeProgress,
  type ProgressState,
} from "@/lib/progress";
import type { Topic, Problem } from "@/lib/shared-types";
import {
  getDiagnosticHistoryForSubject,
  getLatestDiagnosticBySubject,
  getRecommendedPrerequisiteAction,
  type DiagnosticResult,
} from "@/lib/diagnostics";
import { DiagnosticStatusPill } from "@/app/(main)/diagnostic/DiagnosticStatusPill";
import type { DiagnosticSubjectMeta } from "./DashboardShell";

type SlimModule = { topicId: string; sections: Array<{ title: string; section?: string }> };

export type DashboardRealData = Record<
  string,
  { topics: Topic[]; problems: Problem[]; modules?: SlimModule[] }
>;

type TopicWithProgress = Topic & { correct: number; total: number; percent: number };

type SubjectWithProgress = NavSubject & {
  topics: Topic[];
  problems: Problem[];
  modules: SlimModule[];
  solved: number;
  total: number;
  topicsWithProgress: TopicWithProgress[];
  suggestedTopics: TopicWithProgress[];
};

function sectionSlugFromTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function SectionTopicRow({
  subjectSlug,
  topicId,
  title,
  sectionSlug,
  correct,
  total,
  percent,
}: {
  subjectSlug: string;
  topicId: string;
  title: string;
  sectionSlug: string;
  correct: number;
  total: number;
  percent: number;
}) {
  const hasProgress = total > 0;

  return (
    <Link
      href={`/${subjectSlug}/practice/${topicId}?section=${sectionSlug}`}
      className="group flex flex-col gap-2 rounded-lg border theme-border bg-[var(--surface)] p-3 transition hover:border-[var(--accent)]/35 hover:bg-[var(--surface-2)]"
    >
      <span className="text-sm font-medium leading-snug theme-text group-hover:text-[var(--accent)]">
        {title}
      </span>
      {hasProgress ? (
        <>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--accent)]/15">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-xs tabular-nums theme-text-muted">
            {correct} / {total} solved
          </span>
        </>
      ) : (
        <span className="text-xs theme-text-muted">No practice tagged yet</span>
      )}
    </Link>
  );
}

function ChapterRow({
  subject,
  mod,
  topic,
  chapterNum,
  isExpanded,
  onToggle,
  progress,
}: {
  subject: SubjectWithProgress;
  mod: SlimModule;
  topic: TopicWithProgress;
  chapterNum: number;
  isExpanded: boolean;
  onToggle: () => void;
  progress: ProgressState;
}) {
  const isComplete = topic.total > 0 && topic.correct === topic.total;
  const sectionCount = mod.sections?.length ?? 0;

  return (
    <div
      className={`overflow-hidden rounded-xl border theme-border theme-surface ${isExpanded ? "md:col-span-2" : ""}`}
    >
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[var(--surface-2)] sm:gap-4 sm:py-4"
        >
          <span className="shrink-0 rounded-md bg-[var(--surface-2)] px-2 py-1 text-xs font-semibold tabular-nums theme-text-muted">
            Ch. {chapterNum}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold theme-text sm:text-base">{topic.title}</p>
            <p className="mt-0.5 text-xs theme-text-muted">
              {sectionCount} {sectionCount === 1 ? "topic" : "topics"}
              <span className="mx-1.5 opacity-40">·</span>
              <span className="tabular-nums">
                {topic.correct}/{topic.total} solved
              </span>
            </p>
          </div>
          <div className="hidden w-24 shrink-0 sm:block">
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--accent)]/15">
              <div
                className="h-full rounded-full bg-[var(--accent)]"
                style={{ width: `${topic.percent}%` }}
              />
            </div>
          </div>
          {isComplete ? (
            <span className="shrink-0 text-sm text-[var(--accent)]" aria-label="Complete">
              ✓
            </span>
          ) : null}
          <span
            className={`shrink-0 text-lg leading-none theme-text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
            aria-hidden
          >
            ▾
          </span>
        </button>
      </div>

      {isExpanded && (
        <div className="border-t theme-border bg-[var(--surface)]/60 px-4 py-4">
          {mod.sections && mod.sections.length > 0 ? (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {mod.sections.map((section) => {
                const slug = section.section || sectionSlugFromTitle(section.title);
                const secStats = getSectionPracticeProgress(
                  progress,
                  topic.id,
                  slug,
                  subject.problems
                );

                const total = secStats.total;
                const correct = secStats.correct;
                const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

                return (
                  <SectionTopicRow
                    key={slug}
                    subjectSlug={subject.slug}
                    topicId={topic.id}
                    title={section.title}
                    sectionSlug={slug}
                    correct={correct}
                    total={total}
                    percent={percent}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-sm theme-text-muted">No topics listed for this chapter yet.</p>
          )}

          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link
              href={`/${subject.slug}/modules/${topic.id}`}
              className="font-medium text-[var(--accent)] hover:underline"
            >
              Read chapter →
            </Link>
            <Link
              href={`/${subject.slug}/practice/${topic.id}`}
              className="theme-text-secondary hover:theme-text hover:underline"
            >
              Practice all topics
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDiagnosticDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DiagnosticSubjectCard({
  slug,
  label,
  icon,
  latest,
  history,
}: {
  slug: string;
  label: string;
  icon?: string;
  latest?: DiagnosticResult;
  history: DiagnosticResult[];
}) {
  const summaries = latest?.prerequisiteSummaries ?? [];
  const action =
    summaries.length > 0
      ? getRecommendedPrerequisiteAction(summaries, summaries.map((s) => s.prerequisite), slug)
      : null;
  const score = latest?.score;
  const total = latest?.total;
  const scorePct =
    score != null && total != null && total > 0 ? Math.round((score / total) * 100) : null;

  const trend =
    history.length > 1
      ? [...history]
          .reverse()
          .map((attempt) =>
            attempt.score != null && attempt.total != null
              ? `${attempt.score}/${attempt.total}`
              : null,
          )
          .filter((value): value is string => value !== null)
      : [];

  return (
    <div className="flex h-full flex-col rounded-xl border theme-border theme-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {icon ? (
              <span className="text-lg leading-none" aria-hidden>
                {icon}
              </span>
            ) : null}
            <h3 className="truncate text-base font-semibold theme-text">{label}</h3>
          </div>
          {latest ? (
            <p className="mt-1 text-xs theme-text-muted">
              Last taken {formatDiagnosticDate(latest.completedAt)}
            </p>
          ) : (
            <p className="mt-1 text-xs theme-text-muted">Not taken yet</p>
          )}
        </div>
        {scorePct != null ? (
          <div className="shrink-0 text-right">
            <div className="text-2xl font-bold tabular-nums theme-text">{scorePct}%</div>
            <div className="text-xs tabular-nums theme-text-muted">
              {score}/{total} correct
            </div>
          </div>
        ) : null}
      </div>

      {summaries.length > 0 ? (
        <div className="mt-4 grid gap-2">
          {summaries.map((summary) => (
            <div
              key={summary.prerequisite.id}
              className="flex items-center justify-between gap-2 rounded-lg border theme-border bg-[var(--surface)] px-3 py-2"
            >
              <span className="min-w-0 truncate text-sm theme-text">{summary.prerequisite.label}</span>
              <div className="flex shrink-0 items-center gap-2">
                {summary.total > 0 ? (
                  <span className="text-xs tabular-nums theme-text-muted">
                    {summary.correct}/{summary.total}
                  </span>
                ) : null}
                <DiagnosticStatusPill status={summary.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-relaxed theme-text-muted">
          A short readiness check samples prerequisite skills before you dive into {label}.
        </p>
      )}

      {trend.length > 1 ? (
        <p className="mt-3 text-xs theme-text-muted">
          <span className="font-medium theme-text-secondary">Recent scores:</span>{" "}
          <span className="tabular-nums">{trend.join(" → ")}</span>
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link
          href={`/diagnostic/${slug}`}
          className="rounded-lg bg-[var(--accent)] px-3 py-1.5 font-medium text-white transition hover:opacity-90"
        >
          {latest ? "Retake diagnostic" : "Take diagnostic"}
        </Link>
        {action && latest ? (
          <Link
            href={action.href}
            className="rounded-lg border theme-border px-3 py-1.5 font-medium theme-text-secondary transition hover:bg-[var(--surface-2)]"
          >
            {action.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function DiagnosticProgressSection({
  diagnosticSubjects,
  diagnostics,
  subjectConfigs,
}: {
  diagnosticSubjects: DiagnosticSubjectMeta[];
  diagnostics: DiagnosticResult[];
  subjectConfigs: NavSubject[];
}) {
  if (diagnosticSubjects.length === 0) return null;

  const latestBySubject = getLatestDiagnosticBySubject(diagnostics);
  const iconBySlug = new Map(subjectConfigs.map((subject) => [subject.slug, subject.icon]));

  return (
    <section className="mb-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold theme-text">Prerequisite diagnostics</h2>
          <p className="mt-1 text-sm theme-text-muted">
            Readiness checks for subjects with prerequisite pools. Retakes update your latest map.
          </p>
        </div>
        <Link href="/diagnostic" className="text-sm font-medium text-[var(--accent)] hover:underline">
          All diagnostics →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {diagnosticSubjects.map((subject) => (
          <DiagnosticSubjectCard
            key={subject.slug}
            slug={subject.slug}
            label={subject.label}
            icon={iconBySlug.get(subject.slug)}
            latest={latestBySubject.get(subject.slug)}
            history={getDiagnosticHistoryForSubject(diagnostics, subject.slug)}
          />
        ))}
      </div>
    </section>
  );
}

function SubjectRow({
  subject,
  isExpanded,
  onToggle,
  expandedChapters,
  onToggleChapter,
  progress,
}: {
  subject: SubjectWithProgress;
  isExpanded: boolean;
  onToggle: () => void;
  expandedChapters: Record<string, boolean>;
  onToggleChapter: (key: string) => void;
  progress: ProgressState;
}) {
  const percent = subject.total > 0 ? Math.round((subject.solved / subject.total) * 100) : 0;
  const chapters = subject.modules
    .map((mod, index) => {
      const topic = subject.topicsWithProgress.find((t) => t.id === mod.topicId);
      if (!topic) return null;
      return { mod, topic, chapterNum: index + 1 };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const chapterCount = chapters.length;

  return (
    <section className="overflow-hidden rounded-xl border theme-border theme-surface">
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
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
              {chapterCount} {chapterCount === 1 ? "chapter" : "chapters"}
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
          <span
            className={`shrink-0 text-lg leading-none theme-text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
            aria-hidden
          >
            ▾
          </span>
        </button>
        <Link
          href={`/${subject.slug}`}
          className="flex shrink-0 items-center border-l theme-border px-4 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--surface-2)]"
        >
          Open
        </Link>
      </div>

      {isExpanded && (
        <div className="border-t theme-border bg-[var(--surface)]/40 px-3 py-3 sm:px-4 sm:py-4">
          {chapters.length > 0 ? (
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
              {chapters.map(({ mod, topic, chapterNum }) => {
                const chapterKey = `${subject.slug}-${topic.id}`;
                return (
                  <ChapterRow
                    key={topic.id}
                    subject={subject}
                    mod={mod}
                    topic={topic}
                    chapterNum={chapterNum}
                    isExpanded={!!expandedChapters[chapterKey]}
                    onToggle={() => onToggleChapter(chapterKey)}
                    progress={progress}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-sm theme-text-muted">
              No chapters yet.{" "}
              <Link href={`/${subject.slug}`} className="text-[var(--accent)] hover:underline">
                Browse subject
              </Link>
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export default function DashboardContent({
  realData,
  subjectConfigs,
  diagnosticSubjects,
}: {
  realData?: DashboardRealData;
  subjectConfigs?: NavSubject[];
  diagnosticSubjects?: DiagnosticSubjectMeta[];
}) {
  return (
    <AppStateProviders>
      <DashboardInner
        realData={realData}
        subjectConfigs={subjectConfigs}
        diagnosticSubjects={diagnosticSubjects}
      />
    </AppStateProviders>
  );
}

function DashboardInner({
  realData,
  subjectConfigs,
  diagnosticSubjects = [],
}: {
  realData?: DashboardRealData;
  subjectConfigs?: NavSubject[];
  diagnosticSubjects?: DiagnosticSubjectMeta[];
}) {
  const { progress } = useProgress();
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  const toggleSubject = (slug: string) => {
    setExpandedSubjects((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const toggleChapter = (key: string) => {
    setExpandedChapters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

      const topicsWithProgress = effTopics.map((topic) => {
        const stats = getPracticeProgress(progress, topic.id, effProblems);
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
        topics: effTopics,
        problems: effProblems,
        modules: effModules,
        solved,
        total,
        topicsWithProgress,
        suggestedTopics,
      };
    });

    const tSolved = computedSubjects.reduce((sum, s) => sum + s.solved, 0);
    const tProblems = computedSubjects.reduce((sum, s) => sum + s.total, 0);

    let tAttempted = 0;
    let tCorrect = 0;

    computedSubjects.forEach((subject) => {
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
  }, [progress, realData, activeSubjects]);

  const currentStreak = progress.streak?.current ?? 0;
  const bestStreak = progress.streak?.longest ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight theme-text">Dashboard</h1>
        <p className="mt-2 text-sm theme-text-muted">
          Expand a subject for chapters, then a chapter for topics and practice links.
        </p>
      </div>

      <DiagnosticProgressSection
        diagnosticSubjects={diagnosticSubjects}
        diagnostics={progress.diagnostics}
        subjectConfigs={activeSubjects}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
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

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {subjectsWithProgress.map((subject) => {
          const isSubjectExpanded = !!expandedSubjects[subject.slug];
          return (
            <div key={subject.slug} className={isSubjectExpanded ? "md:col-span-2" : ""}>
              <SubjectRow
                subject={subject}
                isExpanded={isSubjectExpanded}
                onToggle={() => toggleSubject(subject.slug)}
                expandedChapters={expandedChapters}
                onToggleChapter={toggleChapter}
                progress={progress}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-10 border-t theme-border pt-6 text-center text-xs theme-text-muted">
        Progress is saved locally and can be synced across devices via /sync.
      </div>
    </div>
  );
}