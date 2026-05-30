"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CourseTopic = {
  id: string;
  title: string;
  description: string;
  estimatedMinutes?: number;
};

type ModuleSection = {
  title: string;
};

type Module = {
  topicId: string;
  sections: ModuleSection[];
};

type Problem = {
  topicId: string;
};

export function CourseContentsPage({
  title,
  description,
  subjectSlug,
  topics,
  modules = [],
  problems = [],
}: {
  title: string;
  description: string;
  subjectSlug: string;
  topics: CourseTopic[];
  modules?: Module[];
  problems?: Problem[];
}) {
  const [openTopicId, setOpenTopicId] = useState<string | null>(null);

  const questionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const problem of problems) {
      counts[problem.topicId] = (counts[problem.topicId] || 0) + 1;
    }
    return counts;
  }, [problems]);

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
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="border-b theme-border pb-6">
        <p className="text-sm theme-text-muted">
          <Link href="/" className="text-blue-700 hover:underline dark:text-[var(--accent)]">
            Contents
          </Link>
          {" / "}
          {title}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight theme-text sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 theme-text-secondary">
          {description}
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href="/dashboard" className="text-blue-700 hover:underline dark:text-[var(--accent)]">
            Dashboard
          </Link>
        </div>
      </div>

      <section className="py-8">
        <h2 className="text-xl font-semibold theme-text">Course Contents</h2>
        <ol className="mt-5 divide-y theme-border border-y">
          {topics.map((topic, index) => {
            const isOpen = openTopicId === topic.id;
            const questionCount = questionCounts[topic.id] || 0;
            const moduleData = modulesByTopic[topic.id];
            const sections = moduleData?.sections || [];

            return (
              <li key={topic.id} className="border-b theme-border last:border-b-0 py-[10px]">
                <button
                  onClick={() => toggleTopic(topic.id)}
                  className="flex w-full items-center justify-between gap-4 py-[10px] text-left hover:bg-[var(--surface-2)] rounded-lg px-3 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3">
                      <span className="text-sm font-medium tabular-nums theme-text-muted shrink-0">
                        Chapter {index + 1}
                      </span>
                      <span className="font-semibold theme-text text-lg leading-tight">
                        {topic.title}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 theme-text-secondary line-clamp-2">
                      {topic.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm text-stone-500 dark:text-[var(--text-muted)] whitespace-nowrap hidden sm:block">
                      {questionCount} questions
                    </span>

                    {/* Practice chapter button */}
                    <Link
                      href={`/${subjectSlug}/practice/${topic.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-lg border border-[var(--accent)] px-3 py-1 text-xs font-medium text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-white sm:text-sm"
                    >
                      Practice chapter
                    </Link>

                    {/* Chevron on the right */}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 group-hover:text-[var(--accent)] ${isOpen ? 'rotate-90' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>

                {isOpen && sections.length > 0 && (
                  <div className="pb-4 px-3">
                    <div className="pl-4 border-l-2 border-zinc-200 dark:border-zinc-700">
                      <ul className="space-y-1 text-sm">
                        {sections.map((section, sIdx) => {
                          const slug = section.title
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)/g, "");
                          const chapterNum = index + 1;
                          const sectionNum = sIdx; // 0-based as per your example (1.0, 1.1, ...)
                          return (
                            <li key={sIdx}>
                              <Link
                                href={`/${subjectSlug}/modules/${topic.id}#${slug}`}
                                className="flex items-start gap-2 py-1.5 text-zinc-600 hover:text-[var(--accent)] dark:text-[var(--text-secondary)] transition-colors"
                              >
                                <span className="font-mono text-xs text-zinc-400 tabular-nums shrink-0 mt-0.5">
                                  {chapterNum}.{sectionNum}
                                </span>
                                <span>{section.title}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
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
