"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { MathText } from "@/components/math-text";
import { ModuleSectionNav } from "@/components/module-section-nav";
import { VoteFeedback } from "@/components/vote-feedback";
import type { Topic } from "@/lib/shared-types";
import type { ModuleContent } from "@/lib/modules/types";

type SubjectModulePageProps = {
  subjectSlug: string;
  subjectLabel: string;
  modules: ModuleContent[];
  topics: Topic[];
  faqs?: Record<string, { q: string; a: string }[]>;
};

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function SubjectModulePage({
  subjectSlug,
  subjectLabel,
  modules,
  topics,
  faqs,
}: SubjectModulePageProps) {
  const params = useParams<{ topicId: string }>();
  const topicId = params?.topicId ?? "";

  const lessonModule = modules.find((item) => item.topicId === topicId);
  const topic = topics.find((item) => item.id === topicId);

  const navItems = useMemo(() => {
    if (!lessonModule) return [];
    return [
      { id: "intro", label: "Introduction" },
      ...lessonModule.sections.map((section: any) => ({
        id: toSlug(section.title),
        label: section.title,
      })),
      { id: "mistakes", label: "Common Mistakes" },
    ];
  }, [lessonModule]);

  if (!lessonModule || !topic) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-sm text-stone-600">Module not found.</p>
        <Link className="btn-secondary mt-4 inline-flex" href={`/${subjectSlug}/modules`}>
          Back to {subjectLabel} modules
        </Link>
      </div>
    );
  }

  const topicIndex = topics.findIndex((t) => t.id === topicId);
  const prevTopic = topicIndex > 0 ? topics[topicIndex - 1] : null;
  const nextTopic = topicIndex < topics.length - 1 ? topics[topicIndex + 1] : null;

  return (
    <>
      <ModuleSectionNav items={navItems} />
      <div className="mx-auto w-full max-w-[760px] px-4 py-8 sm:px-6 sm:py-10">
        <div className="min-w-0">
          <div className="mb-6 border-b border-[var(--border)] pb-5 sm:mb-8">
            <Link
              className="text-sm text-blue-800 hover:underline"
              href={`/${subjectSlug}/modules`}
              data-no-print
            >
              Back to {subjectLabel} contents
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight theme-text sm:text-4xl">
              {topic.title}
            </h1>
            <p className="mt-3 text-base leading-7 theme-text-secondary">{topic.description}</p>
          </div>

          {/* Introduction */}
          <div id="intro" className="scroll-mt-20">
            <h2 className="mb-4 text-2xl font-semibold theme-text">Introduction</h2>
            <div className="prose prose-stone dark:prose-invert max-w-none">
              {lessonModule.intro.map((paragraph, index) => (
                <MathText key={index} text={paragraph} />
              ))}
            </div>
          </div>

          {/* Sections */}
          {lessonModule.sections.map((section) => (
            <div
              key={section.section || section.title}
              id={toSlug(section.title)}
              className="scroll-mt-20 mt-12"
            >
              <h2 className="mb-4 text-2xl font-semibold theme-text">{section.title}</h2>

              <div className="prose prose-stone dark:prose-invert max-w-none">
                {section.body.map((paragraph: string, index: number) => (
                  <MathText key={index} text={paragraph} />
                ))}
              </div>

              {section.eli5 && section.eli5.length > 0 && (
                <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                    Explain Like I'm 5
                  </div>
                  <div className="space-y-3 text-sm leading-relaxed theme-text-secondary">
                    {section.eli5.map((paragraph: string, index: number) => (
                      <MathText key={index} text={paragraph} />
                    ))}
                  </div>
                </div>
              )}

              {section.examples && section.examples.length > 0 && (
                <div className="mt-6">
                  <div className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                    Example{section.examples.length > 1 ? "s" : ""}
                  </div>
                  {section.examples.map((example, idx) => (
                    <div
                      key={idx}
                      className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
                    >
                      <div className="mb-3 font-semibold theme-text">{example.title}</div>
                      <ol className="list-decimal space-y-2 pl-5 text-sm">
                        {example.steps.map((step, stepIdx) => (
                          <li key={stepIdx} className="theme-text-secondary">
                            <MathText text={step} />
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Common Mistakes */}
          {lessonModule.commonMistakes.length > 0 && (
            <div id="mistakes" className="scroll-mt-20 mt-12">
              <h2 className="mb-4 text-2xl font-semibold theme-text">Common Mistakes</h2>
              <ul className="space-y-3 text-sm">
                {lessonModule.commonMistakes.map((mistake, index) => (
                  <li key={index} className="flex gap-3 theme-text-secondary">
                    <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--text-muted)]" />
                    <MathText text={mistake} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* FAQ Section (SEO) */}
          {faqs && faqs[topicId] && faqs[topicId].length > 0 && (
            <div className="mt-12">
              <h2 className="mb-4 text-2xl font-semibold theme-text">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs[topicId].map((faq: { q: string; a: string }, index: number) => (
                  <details key={index} className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                    <summary className="cursor-pointer font-medium theme-text marker:text-[var(--text-muted)]">
                      {faq.q}
                    </summary>
                    <div className="mt-3 text-sm leading-relaxed theme-text-secondary">
                      <MathText text={faq.a} />
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-12 flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-between">
            {prevTopic ? (
              <Link
                href={`/${subjectSlug}/modules/${prevTopic.id}`}
                className="btn-secondary inline-flex w-full justify-center sm:w-auto"
              >
                ← {prevTopic.title}
              </Link>
            ) : (
              <div />
            )}

            {nextTopic ? (
              <Link
                href={`/${subjectSlug}/modules/${nextTopic.id}`}
                className="btn-primary inline-flex w-full justify-center sm:w-auto"
              >
                {nextTopic.title} →
              </Link>
            ) : (
              <Link
                href={`/${subjectSlug}/practice/${topicId}`}
                className="btn-primary inline-flex w-full justify-center sm:w-auto"
              >
                Practice this topic →
              </Link>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <VoteFeedback targetType="module" targetId={topicId} />
          </div>
        </div>
      </div>
    </>
  );
}
