"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppStateProviders } from "@/components/scoped-providers";
import { useProgress } from "@/components/progress-provider";
import type { NavSubject } from "@/lib/subjects";
import { subjectThemeClass } from "@/lib/themes";
import {
  getPracticeProgress,
  getSectionPracticeProgress,
  type ProgressState,
} from "@/lib/progress";
import type { Topic, Problem } from "@/lib/shared-types";
import {
  getDiagnosticHistoryForSubject,
  getRecommendedPrerequisiteAction,
  type DiagnosticResult,
} from "@/lib/diagnostics";
import { DiagnosticStatusPill } from "@/app/(main)/diagnostic/DiagnosticStatusPill";

type SlimModule = { topicId: string; sections: Array<{ title: string; section?: string }> };

export type SubjectOverviewData = {
  topics: Topic[];
  problems: Problem[];
  modules: SlimModule[];
};

type TopicWithProgress = Topic & { correct: number; total: number; percent: number };

type SubjectWithProgress = NavSubject & {
  topics: Topic[];
  problems: Problem[];
  modules: SlimModule[];
  solved: number;
  total: number;
  topicsWithProgress: TopicWithProgress[];
};

function sectionSlugFromTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatDiagnosticDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

function DiagnosticPanel({
  slug,
  label,
  latest,
  history,
}: {
  slug: string;
  label: string;
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
    <section className="mb-8 rounded-xl border theme-border theme-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold theme-text">Prerequisite readiness</h2>
          {latest ? (
            <p className="mt-1 text-sm theme-text-muted">
              Last taken {formatDiagnosticDate(latest.completedAt)}
            </p>
          ) : (
            <p className="mt-1 text-sm theme-text-muted">Not taken yet</p>
          )}
        </div>
        {scorePct != null ? (
          <div className="shrink-0 text-right">
            <div className="text-3xl font-bold tabular-nums theme-text">{scorePct}%</div>
            <div className="text-xs tabular-nums theme-text-muted">
              {score}/{total} correct
            </div>
          </div>
        ) : null}
      </div>

      {summaries.length > 0 ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
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
          className="rounded-lg bg-[var(--accent)] px-3 py-1.5 font-medium text-[var(--accent-text)] transition hover:opacity-90"
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
    </section>
  );
}

function SubjectOverviewInner({
  subject,
  realData,
  hasDiagnostic,
}: {
  subject: NavSubject;
  realData: SubjectOverviewData;
  hasDiagnostic: boolean;
}) {
  const { progress } = useProgress();
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  const toggleChapter = (key: string) => {
    setExpandedChapters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const subjectWithProgress = useMemo((): SubjectWithProgress => {
    const effTopics = realData.topics?.length ? realData.topics : [];
    const effProblems = realData.problems?.length ? realData.problems : [];
    const effModules = realData.modules?.length ? realData.modules : [];

    const topicsWithProgress = effTopics.map((topic) => {
      const stats = getPracticeProgress(progress, topic.id, effProblems);
      return {
        ...topic,
        correct: stats.correct,
        total: stats.total,
        percent: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      };
    });

    const solved = topicsWithProgress.reduce((sum, topic) => sum + topic.correct, 0);

    return {
      ...subject,
      topics: effTopics,
      problems: effProblems,
      modules: effModules,
      solved,
      total: effProblems.length,
      topicsWithProgress,
    };
  }, [progress, realData, subject]);

  const percent =
    subjectWithProgress.total > 0
      ? Math.round((subjectWithProgress.solved / subjectWithProgress.total) * 100)
      : 0;

  const chapters = subjectWithProgress.modules
    .map((mod, index) => {
      const topic = subjectWithProgress.topicsWithProgress.find((t) => t.id === mod.topicId);
      if (!topic) return null;
      return { mod, topic, chapterNum: index + 1 };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const latestDiagnostic = progress.diagnostics
    .filter((r) => r.mode === "prerequisite" && r.targetSubject === subject.slug)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];

  const diagnosticHistory = getDiagnosticHistoryForSubject(progress.diagnostics, subject.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <nav className="mb-6 text-sm theme-text-muted">
        <Link href="/dashboard" className="hover:text-[var(--accent)] hover:underline">
          Dashboard
        </Link>
        <span className="mx-2 opacity-40">/</span>
        <span className="theme-text">{subject.label}</span>
      </nav>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          {/* Same colored glyph treatment as the /subjects cards. */}
          <span
            className={`shrink-0 font-serif text-3xl leading-none text-[var(--subject-accent,var(--accent))] ${subjectThemeClass(subject.slug)}`}
            aria-hidden
          >
            {subject.icon}
          </span>
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight theme-text">{subject.label}</h1>
            <p className="mt-2 text-sm theme-text-muted">
              {chapters.length} {chapters.length === 1 ? "chapter" : "chapters"}
              <span className="mx-1.5 opacity-40">·</span>
              <span className="tabular-nums">
                {subjectWithProgress.solved}/{subjectWithProgress.total} solved ({percent}%)
              </span>
            </p>
          </div>
        </div>
        <Link
          href={`/${subject.slug}`}
          className="shrink-0 rounded-lg border theme-border px-4 py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--surface-2)]"
        >
          Browse course →
        </Link>
      </div>

      <div className="mb-8 h-2 overflow-hidden rounded-full bg-[var(--accent)]/15">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      {hasDiagnostic ? (
        <DiagnosticPanel
          slug={subject.slug}
          label={subject.label}
          latest={latestDiagnostic}
          history={diagnosticHistory}
        />
      ) : null}

      <section>
        <h2 className="mb-4 text-lg font-semibold theme-text">Chapter progress</h2>
        {chapters.length > 0 ? (
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {chapters.map(({ mod, topic, chapterNum }) => {
              const chapterKey = `${subject.slug}-${topic.id}`;
              return (
                <ChapterRow
                  key={topic.id}
                  subject={subjectWithProgress}
                  mod={mod}
                  topic={topic}
                  chapterNum={chapterNum}
                  isExpanded={!!expandedChapters[chapterKey]}
                  onToggle={() => toggleChapter(chapterKey)}
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
      </section>
    </div>
  );
}

export default function SubjectOverviewContent({
  subject,
  realData,
  hasDiagnostic,
}: {
  subject: NavSubject;
  realData: SubjectOverviewData;
  hasDiagnostic: boolean;
}) {
  return (
    <AppStateProviders>
      <SubjectOverviewInner
        subject={subject}
        realData={realData}
        hasDiagnostic={hasDiagnostic}
      />
    </AppStateProviders>
  );
}