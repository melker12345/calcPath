/**
 * Printable problem sheets.
 *
 * Server components, deliberately: no hooks, no state, no client bundle. The
 * one piece of interactivity — revealing a single question's answer — is a
 * native <details>, which needs no JavaScript and, crucially, is hidden in
 * print whether or not the learner opened it (see `.answer-reveal` in
 * globals.css). A sheet printed after checking question 4 must not arrive
 * spoiled.
 *
 * Two surfaces share everything here: the question sheet
 * (/[subject]/test/[topicId]) and the solutions sheet (…/answers).
 */

import type React from "react";
import Link from "next/link";
import type { ProblemSetFile, ProblemSetProblem } from "@/lib/content/schema";
import { renderMathHtml, renderMathParagraphs } from "@/lib/content/render-math";
import { MarkProblemSetDone } from "@/components/mark-problem-set-done";

const KIND_LABEL: Record<ProblemSetProblem["kind"], string> = {
  computation: "Computation",
  proof: "Proof",
  sketch: "Sketch",
  critique: "Critique",
};

/**
 * Blank ruled space printed under a question, in lines of about 7mm.
 * Scaled from the expected working time and clamped, so a two-minute warm-up
 * does not get half a page and a proof does not get three lines.
 */
function workLines(minutes: number): number {
  return Math.max(3, Math.min(10, Math.round(minutes * 0.9)));
}

function MathSpan({ html, className }: { html: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Prose + math body: each blank-line-separated paragraph becomes its own <p>. */
function Body({ text, className }: { text: string; className?: string }) {
  const paragraphs = renderMathParagraphs(text);
  return (
    <div className={className}>
      {paragraphs.map((html, i) => (
        <p key={i} className="ps-para" dangerouslySetInnerHTML={{ __html: html }} />
      ))}
    </div>
  );
}

function SheetHead({
  subjectLabel,
  set,
  totalMinutes,
  kicker,
  nameLine = false,
}: {
  subjectLabel: string;
  set: ProblemSetFile;
  totalMinutes: number;
  kicker: string;
  /** Question sheet only — nobody signs a solutions sheet. */
  nameLine?: boolean;
}) {
  return (
    <div className="ps-head print-keep-together">
      <p className="ps-eyebrow">
        {subjectLabel} · {kicker}
      </p>
      <h1 className="ps-title">{set.title}</h1>
      <p className="ps-meta">
        {set.problems.length} questions · about {totalMinutes} minutes
      </p>
      <p className="ps-instructions">{set.instructions}</p>
      {/* Only on paper: a blank name line on screen is furniture, on paper it is
          the first thing a learner fills in. */}
      {nameLine && (
        <div className="hidden print-only ps-nameline" aria-hidden="true">
          <span>Name</span>
          <span>Date</span>
        </div>
      )}
    </div>
  );
}

export function ProblemSheet({
  subjectSlug,
  subjectLabel,
  topicId,
  set,
  totalMinutes,
}: {
  subjectSlug: string;
  subjectLabel: string;
  topicId: string;
  set: ProblemSetFile;
  totalMinutes: number;
}) {
  const answersHref = `/${subjectSlug}/test/${topicId}/answers`;

  return (
    <main className="ps-sheet">
      <nav className="ps-chrome" data-no-print>
        <Link href={`/${subjectSlug}/modules/${topicId}`} className="ps-chrome-link">
          ← {set.title}
        </Link>
        <span className="ps-chrome-spacer" />
        <Link href={answersHref} className="ps-chrome-link">
          All solutions →
        </Link>
      </nav>

      {/* Progress: the learner decides when a sheet counts as done; nothing on
          paper is graded here. Hidden in print with the rest of the chrome. */}
      <div className="ps-chrome" data-no-print>
        <MarkProblemSetDone subject={subjectSlug} topicId={topicId} />
      </div>

      <p className="ps-howto" data-no-print>
        Print this page and work through it on paper. Revealed answers are never
        printed, so you can check one question and still print a clean sheet.
      </p>

      <SheetHead
        subjectLabel={subjectLabel}
        set={set}
        totalMinutes={totalMinutes}
        kicker="Chapter test"
        nameLine
      />

      <ol className="ps-list">
        {set.problems.map((problem, index) => {
          const parts = problem.parts ?? [];
          const lines = workLines(problem.minutes);
          const partLines = parts.length
            ? Math.max(3, Math.round(lines / parts.length) + 1)
            : lines;

          return (
            <li key={problem.id} className="ps-item">
              <div className="ps-question print-keep-together">
                <div className="ps-item-head">
                  <span className="ps-num">{index + 1}.</span>
                  <span className="ps-tag">
                    {KIND_LABEL[problem.kind]} · {problem.minutes} min
                  </span>
                </div>
                <Body text={problem.prompt} className="ps-prompt" />
                {parts.length > 0 && (
                  <ol className="ps-parts">
                    {parts.map((part, pIndex) => (
                      <li key={pIndex} className="ps-part">
                        <span className="ps-part-label">
                          ({String.fromCharCode(97 + pIndex)})
                        </span>
                        <MathSpan html={renderMathHtml(part)} className="ps-part-body" />
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {parts.length > 0 ? (
                parts.map((_, pIndex) => (
                  <div
                    key={pIndex}
                    className="hidden print-only ps-work"
                    style={{ "--ps-work-lines": partLines } as React.CSSProperties}
                    aria-hidden="true"
                  />
                ))
              ) : (
                <div
                  className="hidden print-only ps-work"
                  style={{ "--ps-work-lines": lines } as React.CSSProperties}
                  aria-hidden="true"
                />
              )}

              {/*
                The per-question reveal. `.answer-reveal` is hidden by
                `@media print` with display:none — open or closed — so printing
                after peeking still yields an unspoiled sheet.
              */}
              <details className="answer-reveal">
                <summary className="answer-reveal-summary">
                  Show the solution to question {index + 1}
                </summary>
                <Body text={problem.solution} className="answer-reveal-body" />
              </details>
            </li>
          );
        })}
      </ol>

      <div className="ps-foot">
        <Link href={answersHref} className="ps-chrome-link" data-no-print>
          Full solutions sheet →
        </Link>
        <p className="hidden print-only ps-foot-print">
          Solutions: calc-path.com{answersHref}
        </p>
      </div>
    </main>
  );
}

export function AnswerSheet({
  subjectSlug,
  subjectLabel,
  topicId,
  set,
  totalMinutes,
}: {
  subjectSlug: string;
  subjectLabel: string;
  topicId: string;
  set: ProblemSetFile;
  totalMinutes: number;
}) {
  const questionsHref = `/${subjectSlug}/test/${topicId}`;

  return (
    <main className="ps-sheet">
      <nav className="ps-chrome" data-no-print>
        <Link href={questionsHref} className="ps-chrome-link">
          ← Question sheet
        </Link>
      </nav>

      <SheetHead
        subjectLabel={subjectLabel}
        set={set}
        totalMinutes={totalMinutes}
        kicker="Solutions"
      />

      <ol className="ps-list ps-list-answers">
        {set.problems.map((problem, index) => {
          const parts = problem.parts ?? [];
          return (
            <li key={problem.id} className="ps-item ps-item-answer print-keep-together">
              <div className="ps-item-head">
                <span className="ps-num">{index + 1}.</span>
                <span className="ps-tag">{KIND_LABEL[problem.kind]}</span>
              </div>
              <Body text={problem.prompt} className="ps-prompt ps-prompt-recap" />
              {parts.length > 0 && (
                <ol className="ps-parts">
                  {parts.map((part, pIndex) => (
                    <li key={pIndex} className="ps-part">
                      <span className="ps-part-label">
                        ({String.fromCharCode(97 + pIndex)})
                      </span>
                      <MathSpan html={renderMathHtml(part)} className="ps-part-body" />
                    </li>
                  ))}
                </ol>
              )}
              {/* Solutions here are the content of the page, not a reveal: they
                  carry no `.answer-reveal` class and therefore do print. */}
              <div className="ps-solution">
                <p className="ps-solution-label">Solution</p>
                <Body text={problem.solution} />
              </div>
            </li>
          );
        })}
      </ol>

      <div className="ps-foot">
        <Link href={questionsHref} className="ps-chrome-link" data-no-print>
          ← Back to the question sheet
        </Link>
      </div>
    </main>
  );
}
