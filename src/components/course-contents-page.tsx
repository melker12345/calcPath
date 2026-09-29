"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useProgress } from "@/lib/use-progress";
import { chapterKey, getPracticeProgress } from "@/lib/progress";
import { SubjectBreadcrumbs } from "@/components/subject-breadcrumbs";

type CourseTopic = {
  id: string;
  title: string;
  description: string;
  estimatedMinutes?: number;
};

type ModuleSection = {
  title: string;
  /** The title typeset on the server (render-math), when it holds mathematics. */
  titleHtml?: string;
  /** Stable slug for # anchors; matches question.section and progress. */
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

function sectionSlug(section: ModuleSection): string {
  return (
    section.section ||
    section.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  );
}

/**
 * A subject's table of contents: every chapter in order, each expandable to
 * its numbered sections, with the learner's state for the chapter (read,
 * practice correct, problem set done) read from the progress in this browser.
 */
export function CourseContentsPage({
  title,
  description,
  subjectSlug,
  topics,
  modules = [],
  problems = [],
  problemSetTopicIds = [],
}: {
  title: string;
  description: string;
  subjectSlug: string;
  topics: CourseTopic[];
  modules?: Module[];
  /** Only `id` and `topicId` are read: enough for exact practice counts. */
  problems?: Problem[];
  /** Chapters that ship a printable problem set (resolved on the server). */
  problemSetTopicIds?: string[];
}) {
  const [openTopicId, setOpenTopicId] = useState<string | null>(null);
  const { progress } = useProgress();

  const modulesByTopic = useMemo(() => {
    const map: Record<string, Module | undefined> = {};
    for (const mod of modules) map[mod.topicId] = mod;
    return map;
  }, [modules]);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="border-b theme-border pb-6">
        <SubjectBreadcrumbs subjectSlug={subjectSlug} subjectLabel={title} />
        <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight theme-text sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 theme-text-secondary">{description}</p>
        <p className="mt-4 text-sm theme-text-secondary">
          <span className="tabular-nums">{topics.length} chapters</span>
          <span className="mx-2 theme-text-muted">·</span>
          <span className="tabular-nums">{problems.length} practice questions</span>
          <span className="mx-2 theme-text-muted">·</span>
          <Link prefetch={false} href={`/dashboard/${subjectSlug}`} className="text-[var(--accent)] hover:underline">
            Your progress
          </Link>
        </p>
      </div>

      <section className="py-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest theme-text-muted">Contents</h2>
        <ol className="mt-4 divide-y theme-border border-y">
          {topics.map((topic, index) => {
            const isOpen = openTopicId === topic.id;
            const sections = modulesByTopic[topic.id]?.sections ?? [];
            const key = chapterKey(subjectSlug, topic.id);
            const read = progress.readChapters.includes(key);
            const hasSheet = problemSetTopicIds.includes(topic.id);
            const sheetDone = hasSheet && progress.completedProblemSets.includes(key);
            const practice = getPracticeProgress(progress, topic.id, problems);

            return (
              <li key={topic.id} className="py-4">
                <div className="flex items-start gap-3">
                  <span className="w-7 shrink-0 pt-0.5 text-right tabular-nums theme-text-muted">{index + 1}.</span>
                  <div className="min-w-0 flex-1">
                    <Link prefetch={false}
                      href={`/${subjectSlug}/modules/${topic.id}`}
                      className="text-base font-semibold theme-text hover:underline sm:text-lg"
                    >
                      {topic.title}
                    </Link>
                    <p className="mt-1 text-sm theme-text-secondary">
                      <span className={read ? "text-[var(--accent)]" : "theme-text-muted"}>
                        {read ? "Read ✓" : "Not read"}
                      </span>
                      {practice.total > 0 && (
                        <>
                          <span className="mx-2 theme-text-muted">·</span>
                          <Link prefetch={false}
                            href={`/${subjectSlug}/practice/${topic.id}`}
                            className="tabular-nums hover:underline"
                          >
                            {practice.correct} / {practice.total} correct
                          </Link>
                        </>
                      )}
                      {hasSheet && (
                        <>
                          <span className="mx-2 theme-text-muted">·</span>
                          <Link prefetch={false} href={`/${subjectSlug}/test/${topic.id}`} className="hover:underline">
                            Problem set{sheetDone ? " ✓" : ""}
                          </Link>
                        </>
                      )}
                    </p>
                  </div>
                  {sections.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setOpenTopicId(isOpen ? null : topic.id)}
                      aria-expanded={isOpen}
                      aria-label={`${isOpen ? "Hide" : "Show"} sections of ${topic.title}`}
                      className="shrink-0 border theme-border px-2 py-1 text-xs theme-text-secondary"
                    >
                      {isOpen ? "Hide sections" : `${sections.length} sections`}
                    </button>
                  )}
                </div>

                {isOpen && (
                  <div className="mt-3 pl-10">
                    {topic.description && (
                      <p className="mb-2 text-sm leading-6 theme-text-secondary">{topic.description}</p>
                    )}
                    <ol className="text-sm">
                      {sections.map((section, sIdx) => {
                        const slug = sectionSlug(section);
                        return (
                          <li key={slug || sIdx} className="flex items-start gap-2.5 py-1">
                            <span className="shrink-0 tabular-nums theme-text-muted">
                              {index + 1}.{sIdx + 1}
                            </span>
                            <Link prefetch={false}
                              href={`/${subjectSlug}/modules/${topic.id}#${slug}`}
                              className="theme-text-secondary hover:underline"
                            >
                              {section.titleHtml ? (
                                <span dangerouslySetInnerHTML={{ __html: section.titleHtml }} />
                              ) : (
                                section.title
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
