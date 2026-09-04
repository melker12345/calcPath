"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { MathText } from "@/components/math-text";
import { ModuleSectionNav } from "@/components/module-section-nav";
import { VoteFeedback } from "@/components/vote-feedback";
import type { Problem, Topic } from "@/lib/shared-types";
import type { ModuleContent, ModuleSection, WorkedExample } from "@/lib/modules";
import { SubjectBreadcrumbs } from "@/components/subject-breadcrumbs";
import { MdxContent } from "@/components/mdx-content";
import { countNumberedBlocks } from "@/lib/content/math-blocks";
import { getSubjectPath } from "@/lib/subject-urls";

/**
 * Dual-support for legacy ModuleContent[] (from src/lib/modules/ tree) and the
 * shape produced by adapters (getLegacyModulesAndTopicsForSubject from content/ MDX).
 * UI and behavior 100% unchanged — this is the "granular component" bridge.
 * Over time callers will pass adapter output exclusively; then we can narrow the type.
 */
type SubjectModulePageProps = {
  subjectSlug: string;
  subjectLabel: string;
  modules: ModuleContent[];
  topics: Topic[];
  /** Optional problems for the topic (from content bundle) to power the print "Text + Questions" worksheet feature. */
  problems?: Array<Pick<Problem, "id" | "topicId" | "prompt" | "type" | "choices">>;
  faqs?: Record<string, { q: string; a: string }[]>;
};

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * A worked example, set the way a textbook sets one:
 *
 *   Example 4.7 (Product rule with an exponential). Find d/dx[x^3 e^x].
 *   Solution. ... steps ... □
 *
 * Authored content keeps the existing "**Worked Example: Title**" marker, where
 * the first bullet is the problem and the rest are the steps; the presentation
 * is what changes. Steps that spell out "Step 3:" have that prefix dropped — the
 * list already numbers them, and the doubled numbering is noise.
 */
function WorkedExampleBlock({
  example,
  number,
}: {
  example: WorkedExample;
  number: string;
}) {
  const steps: string[] = example.steps || [];
  // Rich content (e.g. a truth table inside the example) is rendered as MDX;
  // a plain step list is set as the solution proper.
  const hasTable = steps.some((s: string) => /\|-+\|/.test(s) || /^\s*\|/.test(s));
  const statement = steps.length > 1 ? steps[0] : null;
  const solutionSteps = (statement ? steps.slice(1) : steps).map((step) =>
    step.replace(/^\*{0,2}Step\s*\d+\s*[:.]\s*\*{0,2}/i, "").trim()
  );
  const hasTitle = Boolean(example.title) && !/^examples?$/i.test(example.title.trim());

  return (
    <section className="mb-env mb-env-declaration mb-env-example book-prose print-keep-together">
      <p className="mb-0">
        <span className="mb-env-head">
          <span className="mb-env-label">Example {number}</span>
          {hasTitle && (
            <span className="mb-env-title">
              {" ("}
              <MathText text={example.title} />
              {")"}
            </span>
          )}
          <span className="mb-env-stop">.</span>{" "}
        </span>
        {statement && <MathText text={statement} />}
      </p>

      {hasTable ? (
        <MdxContent mdxSource={steps.join("\n\n")} className="max-w-none" />
      ) : (
        <>
          <p className="mt-3 mb-0">
            <span className="mb-runin">Solution.</span>
          </p>
          <ol className="mb-solution-steps">
            {solutionSteps.map((step: string, stepIdx: number) => (
              <li key={stepIdx} className="theme-text-secondary">
                <MathText text={step} />
              </li>
            ))}
          </ol>
          <span className="mb-endmark-standalone">□</span>
        </>
      )}
    </section>
  );
}

export function SubjectModulePage({
  subjectSlug,
  subjectLabel,
  modules,
  topics,
  problems,
  faqs,
}: SubjectModulePageProps) {
  const params = useParams<{ topicId: string }>();
  const topicId = params?.topicId ?? "";

  const lessonModule = modules.find((item) => item.topicId === topicId);
  const topic = topics.find((item) => item.id === topicId);

  // Chapter number = the topic's position in the subject, so a lesson is
  // "Chapter 4" and its sections are 4.1, 4.2, ... exactly as in a printed book.
  const chapter = useMemo(() => {
    const index = topics.findIndex((t) => t.id === topicId);
    return index >= 0 ? index + 1 : undefined;
  }, [topics, topicId]);

  /**
   * Numbered environments (definitions, theorems, examples, ...) share ONE
   * counter across the whole topic — "Theorem 4.3" then "Example 4.4" — which is
   * how a reader finds a cross-reference in order. The offsets are derived here
   * so numbering is a pure function of the content: no counters mutated during
   * render, identical on the server and the client.
   */
  const sectionNumbering = useMemo(() => {
    if (!lessonModule) return [];
    // The chapter opener can hold environments too; it numbers first.
    let used = countNumberedBlocks((lessonModule.intro || []).join("\n\n"));
    return lessonModule.sections.map((section: ModuleSection) => {
      const bodySource = (section.body || []).join("\n\n");
      const bodyBlocks = countNumberedBlocks(bodySource);
      const bodyStart = used;
      const exampleStart = bodyStart + bodyBlocks;
      used = exampleStart + (section.examples?.length || 0);
      return { bodySource, bodyStart, exampleStart };
    });
  }, [lessonModule]);

  const navItems = useMemo(() => {
    if (!lessonModule) return [];
    return [
      { id: "intro", label: "Introduction" },
      ...lessonModule.sections.map((section: ModuleSection, index: number) => ({
        // Prefer stable .section (from <!-- section: xxx --> or explicit {#slug} in MDX) so that
        // practice "Review the explanation..." links using getSectionHref + question.section land on the right spot.
        id: section.section || toSlug(section.title),
        label: section.title,
        number: chapter ? `${chapter}.${index + 1}` : `${index + 1}`,
      })),
      { id: "mistakes", label: "Common Mistakes" },
    ];
  }, [lessonModule, chapter]);

  /* Print worksheet (restored from old calculus implementation, now generic for all subjects via content data) */
  const [printMode, setPrintMode] = useState<"text" | "questions" | null>(null);
  const [printQuestionCount, setPrintQuestionCount] = useState(0);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printStep, setPrintStep] = useState<"choose" | "count">("choose");

  const moduleProblems = useMemo(
    () => (problems || []).filter((p) => p.topicId === topicId),
    [problems, topicId]
  );

  useEffect(() => {
    if (!printMode) return;
    const frame = requestAnimationFrame(() => {
      window.print();
      setPrintMode(null);
      setPrintQuestionCount(0);
    });
    return () => cancelAnimationFrame(frame);
  }, [printMode]);

  if (!lessonModule || !topic) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-sm text-stone-600">Module not found.</p>
        <Link className="btn-secondary mt-4 inline-flex" href={getSubjectPath(subjectSlug)}>
          Back to {subjectLabel} contents
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
            <SubjectBreadcrumbs
              subjectSlug={subjectSlug}
              subjectLabel={subjectLabel}
              currentTopicTitle={topic.title}
            />
            <Link
              className="text-sm text-blue-800 hover:underline"
              href={getSubjectPath(subjectSlug)}
              data-no-print
            >
              Back to {subjectLabel} contents
            </Link>
            {chapter && (
              <p className="mt-4 book-chapter-label">Chapter {chapter}</p>
            )}
            <div className="mt-1 flex items-center gap-3">
              <h1 className="font-serif text-3xl font-semibold tracking-tight theme-text sm:text-4xl">
                {topic.title}
              </h1>
              {/* Print button + dropdown (restored generic feature; works for every subject via content/ questions) */}
              <div className="relative" data-no-print>
                <button
                  type="button"
                  onClick={() => {
                    setShowPrintModal((v) => !v);
                    setPrintStep("choose");
                  }}
                  className="print-button rounded-xl p-2 text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                  title="Print module"
                  aria-label="Print module"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                    <path
                      fillRule="evenodd"
                      d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.552c.377.046.752.097 1.126.153A2.212 2.212 0 0 1 18 8.653v4.097A2.25 2.25 0 0 1 15.75 15h-.75v.75c0 .966-.784 1.75-1.75 1.75h-6.5A1.75 1.75 0 0 1 5 15.75V15h-.75A2.25 2.25 0 0 1 2 12.75V8.653c0-1.082.775-2.034 1.874-2.198.374-.056.75-.107 1.126-.153V2.75ZM13.5 4V2.75a.25.25 0 0 0-.25-.25h-6.5a.25.25 0 0 0-.25.25V4h7ZM6.5 15.75v-3.5h7v3.5a.25.25 0 0 1-.25.25h-6.5a.25.25 0 0 1-.25-.25Zm-1-6a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {showPrintModal && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => {
                        setShowPrintModal(false);
                        setPrintStep("choose");
                      }}
                    />
                    <div className="print-modal absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border theme-border bg-[var(--surface)] p-3 shadow-xl">
                      {printStep === "choose" ? (
                        <>
                          <p className="mb-2 text-xs font-semibold text-[var(--text-muted)]">Print this module</p>
                          <button
                            type="button"
                            onClick={() => {
                              setShowPrintModal(false);
                              setPrintStep("choose");
                              setPrintMode("text");
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium theme-text-secondary transition hover:bg-[var(--surface-2)]"
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-xs">📄</span>
                            Text only
                          </button>
                          <button
                            type="button"
                            onClick={() => setPrintStep("count")}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium theme-text-secondary transition hover:bg-[var(--surface-2)]"
                            disabled={moduleProblems.length === 0}
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-xs">📝</span>
                            Text + Questions
                            {moduleProblems.length === 0 && <span className="ml-auto text-[10px] opacity-60">(none)</span>}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setPrintStep("choose")}
                            className="mb-2 text-xs font-medium text-[var(--accent)] hover:opacity-80"
                          >
                            ← Back
                          </button>
                          <p className="mb-2 text-xs font-semibold text-[var(--text-muted)]">
                            How many questions? ({moduleProblems.length} available)
                          </p>
                          {[1, 3, 5, moduleProblems.length].filter((n, i, a) => a.indexOf(n) === i).map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => {
                                setShowPrintModal(false);
                                setPrintStep("choose");
                                setPrintQuestionCount(n);
                                setPrintMode("questions");
                              }}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium theme-text-secondary transition hover:bg-[var(--surface-2)]"
                            >
                              {n === moduleProblems.length ? `All (${n})` : n}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            <p className="book-prose mt-3 theme-text-secondary">{topic.description}</p>
          </div>

          {/* Introduction — the chapter opener. Rendered through MdxContent so it
              gets the same book treatment (displayed equations, run-in heads) as
              the sections below. */}
          <div id="intro" className="scroll-mt-20 print-keep-together">
            <h2 className="book-section-heading mb-4 text-2xl font-semibold theme-text">
              <span>Introduction</span>
            </h2>
            <MdxContent
              mdxSource={lessonModule.intro.join("\n\n")}
              className="book-prose"
              chapter={chapter}
            />
          </div>

          {/* Sections */}
          {lessonModule.sections.map((section: ModuleSection, sectionIndex: number) => {
            const numbering = sectionNumbering[sectionIndex];
            const sectionNumber = chapter
              ? `${chapter}.${sectionIndex + 1}`
              : `${sectionIndex + 1}`;
            return (
            <div
              key={section.section || section.title}
              id={section.section || toSlug(section.title)}
              className="scroll-mt-20 mt-12 print-keep-together"
            >
              <h2 className="book-section-heading mb-4 text-2xl font-semibold theme-text">
                <span className="book-section-number">{sectionNumber}</span>
                <span>{section.title}</span>
              </h2>

              <MdxContent
                mdxSource={numbering?.bodySource ?? section.body.join("\n\n")}
                className="book-prose"
                chapter={chapter}
                startNumber={numbering?.bodyStart ?? 0}
              />

              {section.eli5 && section.eli5.length > 0 && (
                <aside className="mb-env mb-env-aside mb-env-intuition print-keep-together book-prose">
                  <span className="mb-env-head">
                    <span className="mb-env-label">Intuition</span>
                  </span>
                  {section.eli5.map((paragraph: string, index: number) => (
                    <p key={index} className="mb-2 last:mb-0">
                      <MathText text={paragraph} />
                    </p>
                  ))}
                </aside>
              )}

              {section.examples && section.examples.length > 0 &&
                section.examples.map((example: WorkedExample, idx: number) => (
                  <WorkedExampleBlock
                    key={idx}
                    example={example}
                    number={
                      chapter
                        ? `${chapter}.${(numbering?.exampleStart ?? 0) + idx + 1}`
                        : `${(numbering?.exampleStart ?? 0) + idx + 1}`
                    }
                  />
                ))}

              {/* Per-section practice link — a book's end-of-section exercises. */}
              <div className="mt-5" data-no-print>
                <Link
                  href={`/${subjectSlug}/practice/${topicId}?section=${section.section || toSlug(section.title)}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline dark:text-[var(--accent)]"
                >
                  Exercises for §{sectionNumber} →
                </Link>
              </div>
            </div>
            );
          })}

          {/* Common Mistakes */}
          {lessonModule.commonMistakes.length > 0 && (
            <div id="mistakes" className="mb-env mb-env-aside mb-env-pitfall book-prose print-keep-together scroll-mt-20 mt-12">
              <span className="mb-env-head">
                <span className="mb-env-label">Common Mistakes</span>
              </span>
              <ul className="space-y-3 leading-relaxed">
                {lessonModule.commonMistakes.map((mistake, index) => (
                  <li key={index} className="flex gap-3 theme-text-secondary">
                    <span className="mt-2.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 dark:bg-amber-400" />
                    {/* Wrap MathText content in a single block so its internal fragments/spans (from splitMath + bold) flow as continuous text with natural spacing.
                        Previously, multiple direct flex children + gap-3 created artificial large gaps around inline math and caused awkward wrapping/"stacking" for complex items like quantifier negations.
                        The internal MathText marginRight on math + word spacing now provide appropriate small breathing room. */}
                    <div className="min-w-0 flex-1">
                      <MathText text={mistake} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* FAQ Section (SEO) */}
          {faqs && faqs[topicId] && faqs[topicId].length > 0 && (
            <div className="mt-12" data-no-print>
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

          {/* Print-only worksheet (hidden on screen, revealed by @media print + .print-only when printMode set).
              Mirrors the old calculus print feature but now data-driven from any subject's content questions. */}
          {printMode === "questions" && printQuestionCount > 0 && (
            <section className="hidden print-only mt-8 border-t border-[var(--border)] pt-6">
              <h2 className="mb-6 text-xl font-bold theme-text">Practice Questions — {topic.title}</h2>
              <ol className="list-decimal space-y-8 pl-6 text-sm">
                {moduleProblems.slice(0, printQuestionCount).map((problem) => (
                  <li key={problem.id} className="print-keep-together">
                    <div className="mb-2">
                      <MathText text={problem.prompt} />
                    </div>
                    {problem.type === "mcq" && problem.choices && (
                      <div className="mt-2 space-y-1 pl-4">
                        {problem.choices.map((choice: string, ci: number) => (
                          <div key={ci} className="flex items-baseline gap-2 theme-text-secondary">
                            <span className="font-medium">{String.fromCharCode(65 + ci)}.</span>
                            <MathText text={choice} />
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Navigation */}
          <div className="mt-12 flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-between" data-no-print>
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

          <div className="mt-8 flex justify-center" data-no-print>
            <VoteFeedback targetType="module" targetId={topicId} />
          </div>
        </div>
      </div>
    </>
  );
}
