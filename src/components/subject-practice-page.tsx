"use client";

import Link from "next/link";
import { useEffect } from "react";
import { SectionCard } from "@/components/section-card";
import { SubjectBreadcrumbs } from "@/components/subject-breadcrumbs";
import { useProgress } from "@/components/progress-provider";
import { getPracticeProgress } from "@/lib/progress";
import { trackEvent } from "@/lib/analytics";
import type { Problem, Topic } from "@/lib/shared-types";

type SubjectPracticePageProps = {
  subjectSlug: string;
  subjectLabel: string;
  topics: Topic[];
  problems: Problem[];
};

export function SubjectPracticePage({
  subjectSlug,
  subjectLabel,
  topics,
  problems,
}: SubjectPracticePageProps) {
  const { progress } = useProgress();

  useEffect(() => {
    trackEvent("view_practice_topics", { subject: subjectSlug });
  }, [subjectSlug]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 border-b theme-border pb-6 sm:mb-8">
        <SubjectBreadcrumbs subjectSlug={subjectSlug} subjectLabel={subjectLabel} />
        <h1 className="mt-3 text-2xl font-semibold theme-text sm:text-3xl">Practice problems</h1>
        <p className="mt-2 text-sm theme-text-secondary">
          Pick a chapter and work through its problem set. Progress is saved automatically.
        </p>
        <Link
          href={`/${subjectSlug}`}
          className="mt-3 inline-block text-sm font-medium text-[var(--accent)] hover:underline"
        >
          ← Back to chapters
        </Link>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {topics.map((topic) => {
          const stats = getPracticeProgress(progress, topic.id, problems);
          return (
            <SectionCard
              key={topic.id}
              title={topic.title}
              description={topic.description}
            >
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between gap-3 text-xs theme-text-muted">
                  <span>
                    <span className="font-semibold theme-text">{stats.correct}</span>
                    /{stats.total} solved
                  </span>
                  <span className="text-right">
                    {stats.accuracyRate}% accuracy · {topic.estimatedMinutes} min
                    {stats.isComplete && (
                      <span className="ml-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                        ✓ Done
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--accent)]/15">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      stats.isComplete ? "bg-emerald-500" : "bg-[var(--accent)]"
                    }`}
                    style={{ width: `${stats.masteryRate}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link className="btn-primary" href={`/${subjectSlug}/practice/${topic.id}`}>
                  {stats.correct > 0 && !stats.isComplete ? "Continue" : "Start"} practice
                </Link>
                <Link className="btn-secondary" href={`/${subjectSlug}/modules/${topic.id}`}>
                  Read module
                </Link>
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}
