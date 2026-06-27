"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useProgress } from "@/components/progress-provider";
import { getChapterCompletion } from "@/lib/progress";
import { SubjectBreadcrumbs } from "@/components/subject-breadcrumbs";

type CourseTopic = {
  id: string;
  title: string;
  description: string;
  estimatedMinutes?: number;
};

type ModuleSection = {
  title: string;
  /** Stable slug (preferred for # anchors when present; from new content/ derive or legacy) */
  section?: string;
};

type Module = {
  topicId: string;
  sections: ModuleSection[];
};

type Problem = {
  id: string;
  topicId: string;
};

export function CourseContentsPage({
  title,
  description,
  subjectSlug,
  topics,
  modules = [],
  problems = [],
  testCounts = {},
}: {
  title: string;
  description: string;
  subjectSlug: string;
  topics: CourseTopic[];
  modules?: Module[];
  problems?: Problem[];
  /** Recap-test pool size per topicId, for counting test questions toward progress. */
  testCounts?: Record<string, number>;
}) {
  const [openTopicId, setOpenTopicId] = useState<string | null>(null);

  const { progress } = useProgress();

  const modulesByTopic = useMemo(() => {
    const map: Record<string, Module | undefined> = {};
    for (const mod of modules) {
      map[mod.topicId] = mod;
    }
    return map;
  }, [modules]);

  const toggleTopic = (topicId: string) => {
    setOpenTopicId(openTopicId === topicId ? null : topicId);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="border-b border-[var(--border)] pb-6 dark:border-[var(--surface-2)]">
        <SubjectBreadcrumbs subjectSlug={subjectSlug} subjectLabel={title} />
        <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight theme-text sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 theme-text-secondary">
          {description}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm theme-text-muted">
          <span className="tabular-nums">{topics.length} chapters</span>
          <span className="opacity-40">·</span>
          <span className="tabular-nums">{problems.length} practice questions</span>
          <Link href="/dashboard" className="ml-auto font-medium text-[var(--accent)] hover:underline">
            Dashboard →
          </Link>
        </div>
      </div>

      <section className="py-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest theme-text-muted">
          Course contents
        </h2>
        <div className="mt-5 divide-y divide-[var(--border)] border-y border-[var(--border)] dark:divide-[var(--surface-2)] dark:border-[var(--surface-2)]">
          {topics.map((topic, index) => {
            const isOpen = openTopicId === topic.id;
            const moduleData = modulesByTopic[topic.id];
            const sections = moduleData?.sections || [];
            // Progress = questions done (practice + recap tests) / total available.
            const comp = getChapterCompletion(
              progress,
              topic.id,
              problems,
              testCounts[topic.id] ?? 0,
            );

            return (
              <div key={topic.id}>
                <button
                  onClick={() => toggleTopic(topic.id)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-center gap-4 py-4 text-left"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-sm font-bold tabular-nums text-[var(--accent)]">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] theme-text-muted">
                      Chapter {index + 1}
                      {comp.total > 0 && (
                        <span className="opacity-50"> · {comp.total} questions</span>
                      )}
                    </p>
                    <h3 className="mt-0.5 text-base font-semibold leading-snug theme-text sm:text-lg">
                      {topic.title}
                    </h3>
                    {comp.total > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-[var(--surface-2)]">
                          <div
                            className={`h-full rounded-full ${comp.isComplete ? "bg-emerald-500" : "bg-[var(--accent)]"}`}
                            style={{ width: `${comp.pct}%` }}
                          />
                        </div>
                        <span className="shrink-0 text-[11px] tabular-nums theme-text-muted">
                          {comp.isComplete
                            ? "Complete"
                            : comp.started
                              ? `${comp.done}/${comp.total} done`
                              : "Not started"}
                        </span>
                      </div>
                    )}
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 group-hover:text-[var(--accent)] dark:text-zinc-500 ${isOpen ? "rotate-90" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="pb-4 pl-[56px]">
                    <div className="border-l-2 border-[var(--accent)]/25 pl-4">
                      {topic.description && (
                        <p className="mb-3 text-sm leading-6 theme-text-secondary">
                          {topic.description}
                        </p>
                      )}
                      {sections.length > 0 && (
                        <ul className="space-y-0.5 text-sm">
                          {sections.map((section, sIdx) => {
                            // Prefer explicit stable .section (from new content/ MDX or legacy) for
                            // anchors (matches question.section and progress); fall back to slugified title.
                            const slug =
                              section.section ||
                              section.title
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/(^-|-$)/g, "");
                            return (
                              <li key={sIdx}>
                                <Link
                                  href={`/${subjectSlug}/modules/${topic.id}#${slug}`}
                                  className="flex items-start gap-2.5 rounded-md px-2 py-1.5 theme-text-secondary transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--accent)]"
                                >
                                  <span className="mt-0.5 shrink-0 font-mono text-xs tabular-nums theme-text-muted">
                                    {index + 1}.{sIdx + 1}
                                  </span>
                                  <span>{section.title}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          href={`/${subjectSlug}/modules/${topic.id}`}
                          className="rounded-lg bg-[var(--accent)] px-3.5 py-1.5 text-xs font-semibold text-[var(--accent-text)] transition hover:opacity-90 sm:text-sm"
                        >
                          Read chapter
                        </Link>
                        <Link
                          href={`/${subjectSlug}/practice/${topic.id}`}
                          className="rounded-lg border border-[var(--accent)] px-3.5 py-1.5 text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-[var(--accent-text)] sm:text-sm"
                        >
                          Practice
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}




