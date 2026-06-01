"use client";

import Link from "next/link";

interface Topic {
  id: string;
  title: string;
  description: string;
}

interface Section {
  title: string;
}

interface TopicRowProps {
  subjectSlug: string;
  topic: Topic;
  index: number;
  questionCount: number;
  sections: Section[];
}

function slugifyForSections(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function TopicRow({
  subjectSlug,
  topic,
  index,
  questionCount,
  sections,
}: TopicRowProps) {
  const hasSections = sections.length > 0;

  return (
    <li className="border-b theme-border last:border-b-0 py-[10px]">
      <details className="group">
        <summary className="flex w-full items-center justify-between gap-4 py-[10px] text-left hover:bg-[var(--surface-2)] rounded-lg px-3 transition-colors cursor-pointer list-none focus:outline-none group-open:bg-[var(--surface-2)]/50">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3">
              <span className="text-sm font-medium tabular-nums theme-text-muted shrink-0">
                Chapter {index + 1}
              </span>
              <Link
                href={`/x/${subjectSlug}/modules/${topic.id}`}
                onClick={(e) => e.stopPropagation()}
                className="font-semibold theme-text text-lg leading-tight hover:underline hover:text-[var(--accent)]"
              >
                {topic.title}
              </Link>
            </div>
            <p className="mt-1 text-sm leading-6 theme-text-secondary line-clamp-2">
              {topic.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm text-stone-500 dark:text-[var(--text-muted)] whitespace-nowrap hidden sm:block">
              {questionCount} questions
            </span>

            {/* Practice chapter button (always visible in header like real) */}
            <Link
              href={`/x/${subjectSlug}/practice/${topic.id}`}
              onClick={(e) => e.stopPropagation()}
              className="rounded-lg border border-[var(--accent)] px-3 py-1 text-xs font-medium text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-white sm:text-sm"
            >
              Practice chapter
            </Link>

            {/* Chevron (rotates on open via group-open) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 group-hover:text-[var(--accent)] group-open:rotate-90`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </summary>

        {hasSections && (
          <div className="pb-4 px-3">
            <div className="pl-4 border-l-2 border-zinc-200 dark:border-zinc-700">
              <ul className="space-y-1 text-sm">
                {sections.map((section, sIdx) => {
                  const slug = slugifyForSections(section.title);
                  const chapterNum = index + 1;
                  const sectionNum = sIdx;
                  return (
                    <li key={sIdx}>
                      <Link
                        href={`/x/${subjectSlug}/modules/${topic.id}#${slug}`}
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
      </details>
    </li>
  );
}
