"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { MathText } from "@/components/math-text";
import { MathInput } from "@/components/math-input";
import { useProgress } from "@/components/progress-provider";
import { isAnswerCorrectAsync, isMcqAnswerCorrect } from "@/lib/answer-check";
import { detectQuestionContext } from "@/lib/math-input-helpers";
import { getSectionHref } from "@/lib/subject-urls";
import { getQuestionIndex } from "@/lib/question-registry";
import { getThemeForSubject } from "@/lib/themes";
import {
  ProgressDots,
  PracticeFeedback,
  usePracticeSession,
  getDefaultHint,
  extractFinalAnswer,
} from "@/components/practice";
import type { Problem, Topic } from "@/lib/shared-types";

/**
 * GenericPracticeExperience
 *
 * Fully data-driven practice UI for the main dynamic routes (primary implementation for /[subject] pages via generics + FileSystemContentBundle).
 * Consumes Problem[] + Topic directly from FileSystemContentBundle (via server props).
 * Reuses ALL the shared practice primitives (usePracticeSession, ProgressDots, PracticeFeedback).
 *
 * This is the integration point proving "generic components + new content data = working practice".
 *
 * Resilience:
 * - Loader already does tolerant per-question recovery on schema errors ("better to load broken than none").
 * - Existing data guard + always-<MathText> (with its per-fragment MathRenderBoundary).
 * - Local QuestionErrorBoundary (below) for any runtime render errors (e.g. edge-case LaTeX, handler bugs, partial data) on a *single* question.
 *   One bad question never destroys the session; clear "rendering issue" UI + skip affordance keeps progress usable.
 *
 * Current design notes / simplifications (vs older per-subject page implementations):
 * - Uses the improved PracticeFeedback for *both* correct + incorrect states (less duplication).
 * - All prompt / choice / step / explanation text *always* goes through the project's <MathText>
 *   (robust $ / $$ splitter + Safe* fallbacks for bad katex). No local RichPrompt/RichMath.
 * - Subject context for MathInput uses "generic" (neutral dark-friendly theme,
 *   reliable MQ style injection, improved deriveSuggestionLabels via prompt ctx; full keypad/scratchpad/submit
 *   experience works end-to-end for statistics + linear-algebra topics in the primary dynamic routes' practice).
 * - Progress + answer checking use the global shared systems (stable ids preserved from content).
 *
 * Limitations noted in NOTES.md.
 */

/**
 * Local per-question error boundary (defined here to avoid new files / scope creep).
 * Catches runtime render errors for *one* question's subtree (prompt MathText edges beyond its own,
 * choice rendering, MathInput internals, PracticeFeedback expl rendering, event-time sync bugs etc).
 * Shows clear "rendering issue" UI per spec; onSkip advances via parent's goToNext (preserves
 * session progress context, dots, nav). Keyed by question id so skip remounts clean.
 * Complements the page-level PracticeErrorBoundary (last-resort) and MathText's fragment boundaries.
 */
class QuestionErrorBoundary extends React.Component<
  { children: React.ReactNode; onSkip: () => void; questionId: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onSkip: () => void; questionId: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn(`[QuestionErrorBoundary] Render error for question ${this.props.questionId}:`, error, errorInfo);
  }

  private handleSkip = () => {
    this.setState({ hasError: false, error: null });
    this.props.onSkip();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800 dark:bg-amber-950/40">
          <div className="mx-auto mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" aria-hidden="true">
            !
          </div>
          <p className="text-base font-semibold theme-text">This question had a rendering issue — skipped.</p>
          <p className="mt-1 text-sm theme-text-secondary">
            A malformed LaTeX fragment or edge-case data prevented display. The rest of your session (including progress) is unaffected.
          </p>
          {this.state.error && (
            <p className="mt-2 text-[10px] theme-text-muted font-mono break-all opacity-70">{this.state.error.message}</p>
          )}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={this.handleSkip}
              className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-text)] transition hover:opacity-90 active:scale-[0.985]"
            >
              Skip to next question →
            </button>
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center justify-center rounded-lg border theme-border px-4 py-2 text-sm font-medium theme-text-muted transition hover:bg-[var(--surface-2)]"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function GenericPracticeExperience({
  topic,
  problems: allTopicProblems,
  subjectSlug,
  subjectLabel,
  nextTopic,
}: {
  topic: Topic;
  problems: Problem[];
  subjectSlug: string;
  subjectLabel: string;
  nextTopic?: { id: string; title: string };
}) {
  const params = useParams<{ topicId: string }>();
  const topicId = params?.topicId ?? topic.id;
  const searchParams = useSearchParams();
  const focusId = searchParams.get("focus");

  const { progress, addAttempt } = useProgress();

  // Filter + memo (in case parent passes broader list)
  const topicProblems = useMemo(
    () => allTopicProblems.filter((p) => p.topicId === topicId),
    [allTopicProblems, topicId]
  );

  const {
    displayProblems,
    index,
    setIndex,
    current: hookCurrent,
    questionStatuses,
    solvedCount,
    goToNext,
    goToPrev,
    pinIndex,

    answer,
    setAnswer,
    feedback,
    setFeedback,
  } = usePracticeSession({
    problems: topicProblems,
    completedProblemIds: progress.completedProblemIds,
    focusId,
  });

  const current = hookCurrent || displayProblems[index];

  // Practice is an app-like screen: everything fits the viewport, the page
  // itself never scrolls (long question prompts scroll inside their own area).
  useEffect(() => {
    document.documentElement.classList.add("practice-no-scroll");
    return () => document.documentElement.classList.remove("practice-no-scroll");
  }, []);

  // Every graded submission for the current question, in order. Attached to bug
  // reports so "Answer seems wrong" arrives with exactly what the user typed
  // and how the grader judged it. Reset when the question changes.
  const [submissionLog, setSubmissionLog] = useState<
    { input: string; gradedCorrect: boolean; at: string }[]
  >([]);
  const [loggedQuestionId, setLoggedQuestionId] = useState(current?.id);
  if (current?.id !== loggedQuestionId) {
    setLoggedQuestionId(current?.id);
    setSubmissionLog([]);
  }
  // For "back to explanation" after mastering (or in empty states), prefer a section anchor if we have one
  // (e.g. when practicing a filtered ?section= or when all questions share a section). Falls back to topic root.
  const backToExplanationHref = getSectionHref(
    subjectSlug,
    topic.id,
    current?.section || displayProblems[0]?.section
  );

  const questionContext = useMemo(
    () => (current && typeof current.prompt === "string" ? detectQuestionContext(current.prompt) : undefined),
    [current]
  );

  // Subject-accent alignment: subject pages render inside a
  // `.subject-theme-<id>` subtree (see CourseLayout + lib/themes) which defines
  // --subject-accent / --subject-accent-text. Re-pointing --accent at those for
  // the whole practice card makes the Check button, keypad operator keys and
  // links follow the subject's identity color (calculus red, stats green, …).
  // Unthemed subjects get no override — the global blue accent stays the
  // fallback. The theme palettes pair each accent with a ≥4.5:1 accent-text.
  const subjectAccentVars = useMemo(
    () =>
      getThemeForSubject(subjectSlug)
        ? ({
            "--accent": "var(--subject-accent)",
            "--accent-text": "var(--subject-accent-text)",
          } as React.CSSProperties)
        : undefined,
    [subjectSlug]
  );

  if (displayProblems.length === 0) {
    // Extra guard: show clean intentional "no questions yet" instead of falling to bad-data fallback,
    // broken nav (length-1=-1), "All 0 mastered", or hitting PracticeErrorBoundary.
    // Matches the polished card look and feel of the main data-driven routes exactly.
    return (
      <div className="mx-auto w-full max-w-3xl px-0 pb-0 sm:px-6 sm:py-10" style={subjectAccentVars}>
        <div className="flex min-h-[calc(100dvh-56px)] flex-col justify-center bg-[var(--surface-solid)] px-4 pb-1 pt-2 sm:min-h-[min(80vh,700px)] sm:rounded-2xl sm:px-8 sm:pb-6 sm:pt-6 sm:shadow-lg">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-2)] text-2xl" aria-hidden="true">
              📝
            </div>
            <h2 className="text-xl font-semibold theme-text">No practice questions yet</h2>
            <p className="mt-2 text-sm theme-text-secondary">
              This topic’s questions have not been added yet.
              This is an intentional “not yet” state while we expand practice for this topic.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href={backToExplanationHref}
                className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-medium text-[var(--accent-text)] transition hover:opacity-90 active:scale-[0.985]"
              >
                View the explanation →
              </Link>
              <Link
                href={`/${subjectSlug}`}
                className="inline-flex items-center justify-center rounded-lg border theme-border px-5 py-2 text-sm font-medium theme-text-muted transition hover:bg-[var(--surface-2)] hover:text-[var(--accent)]"
              >
                ← Back to {subjectLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!current || typeof current.prompt !== "string" || !current.explanation) {
    // Graceful per-question fallback for bad/malformed data (post-loader tolerant recovery).
    // Uses clear "rendering issue" language per resilience spec. Skip keeps session usable (progress context preserved in hook).
    // Note: full runtime render errors (e.g. in MathText edges or handlers) handled by QuestionErrorBoundary below.
    return (
      <div className="mx-auto max-w-3xl p-8">
        <p className="theme-text-secondary">This question had a rendering issue — skipped.</p>
        <button
          type="button"
          onClick={goToNext}
          className="mt-4 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm text-[var(--accent-text)]"
        >
          Skip to next question →
        </button>
        <Link href={`/${subjectSlug}`} className="mt-3 block underline text-[var(--accent)]">Back to {subjectLabel}</Link>
      </div>
    );
  }

  const submitAnswer = async (val: string) => {
    // Freeze the session on this question so a correct grade (which updates
    // progress and would move the auto-index to the next unsolved question)
    // can't tear down the feedback the user is about to read.
    pinIndex();
    // Multiple choice is graded by identity against the offered choices; only
    // typed answers go through expression equivalence.
    const mcqVerdict =
      current.type === "mcq"
        ? isMcqAnswerCorrect(val, current.answer, current.choices)
        : null;
    const isCorrect =
      mcqVerdict ?? (await isAnswerCorrectAsync(val, current.answer));
    const currentAttempts = feedback?.type === "incorrect" ? feedback.attempts : 0;
    const hintWasUsed = feedback?.type === "incorrect" ? feedback.hintUsed : false;

    setSubmissionLog((log) => [
      ...log,
      { input: val, gradedCorrect: isCorrect, at: new Date().toISOString() },
    ]);

    addAttempt({
      problemId: current.id,
      topicId: current.topicId,
      correct: isCorrect,
      createdAt: new Date().toISOString(),
    });

    if (isCorrect) {
      setFeedback({ type: "correct" });
    } else {
      const newAttempts = currentAttempts + 1;
      setFeedback({
        type: "incorrect",
        attempts: newAttempts,
        hintUsed: hintWasUsed,
        showSolution: newAttempts >= 3 || (hintWasUsed && newAttempts >= 2),
      });
    }
  };

  const useHint = () => {
    if (feedback?.type === "correct") return;
    if (feedback?.type === "incorrect" && feedback.hintUsed) return;
    if (feedback?.type === "incorrect") {
      setFeedback({ ...feedback, hintUsed: true });
    } else {
      setFeedback({ type: "incorrect", attempts: 0, hintUsed: true, showSolution: false });
    }
  };

  // Pass the stored answer so the hint extractor only strips a trailing $math$
  // fragment when it actually reveals the answer (a formula like the power rule
  // is kept and rendered via MathText).
  const getHint = () => getDefaultHint(current?.explanation || "", current?.answer);
  const finalAnswer = extractFinalAnswer(current?.explanation || "", current?.answer || "");

  // Stable global question number from the registry (same regardless of arrival
  // route / ?section= filtering). Undefined only for problems not yet registered.
  const globalIndex = getQuestionIndex(current.id);
  const globalQuestionNumber = globalIndex !== undefined ? globalIndex + 1 : null;

  // Everything an admin needs to reproduce a report without asking the user:
  // which question, what the grader expected, every graded submission, and the
  // hint/solution state at report time. Sent only with "Report issue".
  const reportContext: Record<string, unknown> = {
    questionId: current.id,
    globalQuestionNumber,
    questionType: current.type,
    section: current.section ?? null,
    expectedAnswer: current.answer,
    submissions: submissionLog,
    hintUsed: feedback?.type === "incorrect" ? feedback.hintUsed : false,
    solutionShown: feedback?.type === "incorrect" ? feedback.showSolution : false,
  };

  // Shared PracticeFeedback element for all three feedback states.
  //
  // Only the FULL states (correct celebration, full solution) are handed to
  // MathInput as a covering overlay — those genuinely replace the input, and
  // MathInput's inert/invisible treatment of the field + keypad only applies
  // while such an overlay actually covers them. A plain incorrect verdict
  // renders as a compact banner NEXT TO the input instead, keeping the math
  // field visible and editable (with the user's attempt still in it) for a
  // retry.
  const feedbackEl = feedback ? (
    <PracticeFeedback
      feedback={feedback}
      current={{ id: current.id, explanation: current.explanation, answer: current.answer }}
      onNext={goToNext}
      onUseHint={useHint}
      onShowSolution={() =>
        setFeedback((prev) =>
          prev && prev.type === "incorrect" ? { ...prev, showSolution: true } : prev
        )
      }
      getHint={getHint}
      finalAnswer={finalAnswer}
      isLastQuestion={index === displayProblems.length - 1}
      reportContext={reportContext}
    />
  ) : null;
  const isFullFeedback =
    feedback?.type === "correct" ||
    (feedback?.type === "incorrect" && feedback.showSolution);
  // MCQ: a choice has been graded (hint-only feedback doesn't count).
  const mcqAnswered =
    feedback?.type === "correct" ||
    (feedback?.type === "incorrect" && feedback.attempts > 0);

  return (
    <div className="mx-auto flex h-[calc(100dvh-56px)] w-full max-w-3xl flex-col px-0 sm:px-6 sm:py-4" style={subjectAccentVars}>
      {/* Compact header row — practice fits the viewport, so it stays slim */}
      <div className="mb-2 hidden min-w-0 shrink-0 sm:flex sm:items-baseline sm:gap-3 px-1">
        <h1 className="shrink-0 text-lg font-bold theme-text">{topic.title}</h1>
        <span className="min-w-0 flex-1 truncate text-sm theme-text-muted">{topic.description}</span>
        <span className="shrink-0 text-sm theme-text-muted">{solvedCount}/{displayProblems.length} mastered</span>
      </div>

      {/* Main practice card: fills the remaining viewport exactly; the page
          never scrolls (html.practice-no-scroll). Long prompts scroll inside
          their own area instead. Opaque surface, borderless — depth via shadow. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--surface-solid)] px-4 pb-1 pt-2 sm:rounded-2xl sm:px-8 sm:pb-5 sm:pt-5 sm:shadow-lg">
        {/* Progress dots + "1 / N" counter (counter positioned on right of dots; uses theme-text-muted).
            min-w-0 lets the dots scroller shrink on narrow viewports so the counter never clips. */}
        <div className="flex w-full min-w-0 justify-center">
          <div className="flex min-w-0 max-w-full items-center gap-2">
            <ProgressDots
              statuses={questionStatuses}
              currentIndex={index}
              onSelect={(i) => setIndex(i)}
            />
            <span className="shrink-0 text-xs font-semibold tabular-nums theme-text-muted">
              {index + 1} / {displayProblems.length}
            </span>
          </div>
        </div>

        {/* Per-question error boundary: keeps header/progress/nav always visible.
            Only the question+input subtree is isolated. Key ensures clean state per q. */}
        <QuestionErrorBoundary key={current.id} onSkip={goToNext} questionId={current.id}>
          {/* Question prompt area: content-sized (NOT flex-1) so a short
              question sits right above the answer area instead of reserving a
              tall empty band; leftover space collapses into the spacer below
              the answer area. Still scrolls internally if a prompt is very
              tall so the page itself never scrolls. */}
          <div className="flex min-h-0 shrink flex-col items-center gap-2 overflow-y-auto py-4 text-center sm:py-6">
            <div role="heading" aria-level={2} className="text-lg font-semibold leading-relaxed sm:text-2xl">
              {/* Always delegate to project's MathText (robust splitter + katex error fallback) */}
              <MathText text={current.prompt} />
            </div>

            {/* Optional link back to explanation (generic, points to main data-driven module route + specific #section for the question) */}
            <Link
              href={getSectionHref(subjectSlug, current.topicId, current.section)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-[var(--accent)] transition-colors hover:bg-[var(--surface-2)]"
            >
              Review the explanation for this topic →
            </Link>
          </div>

          {/* Answer input area */}
          {current.type === "mcq" ? (
            /* MCQ: the choice list NEVER disappears after answering — the
               selected choice and the correct one stay visibly (and
               accessibly) marked, with the feedback card/banner rendered
               below so users can compare against the distractors. */
            <div className="flex min-h-0 flex-col gap-2 overflow-y-auto sm:gap-3">
              <div role="radiogroup" aria-label="Answer choices" className="flex shrink-0 flex-col gap-2 sm:gap-3">
                {current.choices?.map((choice) => {
                  const isSelected = answer === choice;
                  const isCorrectChoice = isMcqAnswerCorrect(choice, current.answer, current.choices);
                  let stateClass = isSelected
                    ? "border-[var(--accent)] bg-[var(--surface-2)] ring-1 ring-[var(--accent)]"
                    : "theme-border bg-[var(--surface)]";
                  if (mcqAnswered) {
                    stateClass = isCorrectChoice
                      ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500 dark:bg-emerald-500/10"
                      : isSelected
                      ? "border-red-400 bg-red-50 ring-1 ring-red-400 dark:bg-red-500/10"
                      : "theme-border bg-[var(--surface)] opacity-60";
                  }
                  return (
                    <button
                      key={choice}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => {
                        setAnswer(choice);
                        submitAnswer(choice);
                      }}
                      disabled={mcqAnswered}
                      className={`rounded-xl border px-4 py-3 text-left text-base font-medium theme-text transition active:scale-[0.98] disabled:pointer-events-none sm:px-5 sm:py-3.5 sm:text-lg ${
                        mcqAnswered ? "" : "hover:border-[var(--accent)] hover:bg-[var(--surface-2)]"
                      } ${stateClass}`}
                    >
                      <MathText text={choice} />
                      {mcqAnswered && isCorrectChoice && (
                        <span className="sr-only"> (correct answer)</span>
                      )}
                      {mcqAnswered && isSelected && !isCorrectChoice && (
                        <span className="sr-only"> (your answer — incorrect)</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {feedbackEl && (
                <div className={isFullFeedback ? "min-h-0 shrink-0 overflow-y-auto rounded-xl" : "shrink-0"}>
                  {feedbackEl}
                </div>
              )}
            </div>
          ) : (
            /* Typed answers: on a plain incorrect verdict the compact banner
               sits ABOVE the input, which stays visible and editable with the
               user's attempt still in it. Only correct / full-solution
               feedback covers the input as an overlay. */
            /* overflow-y-auto: when the incorrect banner + inline hint expand,
               the keypad must stay reachable by scrolling within the card
               (the page itself never scrolls in practice). */
            <div className="flex min-h-0 flex-col gap-2 overflow-y-auto">
              {feedbackEl && !isFullFeedback && <div className="shrink-0">{feedbackEl}</div>}
              <MathInput
                value={answer}
                onChange={setAnswer}
                onSubmit={() => {
                  // Ignore empty/whitespace-only submissions — a blank MathQuill
                  // submit must not record an attempt (or trigger grading at all).
                  if (!answer.trim()) return;
                  submitAnswer(answer);
                }}
                onHint={useHint}
                subject="generic" /* for primary data-driven routes — uses neutral theme + heuristics */
                hintDisabled={feedback?.type === "correct" || (feedback?.type === "incorrect" && (feedback.hintUsed || feedback.showSolution))}
                questionContext={questionContext}
                answerHint={current.answer}
                feedbackOverlay={isFullFeedback ? feedbackEl : undefined}
                questionPrompt={current.prompt}
              />
            </div>
          )}
        </QuestionErrorBoundary>

        {/* Spacer: absorbs leftover height on short questions so the answer
            area follows the prompt instead of being pushed toward the fold. */}
        <div aria-hidden="true" className="min-h-0 flex-1" />

        {/* All mastered */}
        {solvedCount >= displayProblems.length && (
          <div className="mt-4 rounded-xl border theme-border bg-[var(--surface-2)] p-4 text-center sm:mt-6 sm:rounded-2xl sm:p-5">
            <p className="text-lg font-bold theme-text">Congrats! All {displayProblems.length} mastered.</p>
            <p className="mt-1 text-sm theme-text-secondary">You&apos;ve completed the practice for this section.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-3 sm:justify-center">
              <Link
                href={backToExplanationHref}
                className="btn-primary inline-flex items-center justify-center"
              >
                Back to explanation →
              </Link>
              {nextTopic && (
                <Link
                  href={`/${subjectSlug}/practice/${nextTopic.id}`}
                  className="btn-secondary inline-flex items-center justify-center"
                >
                  Go to next topic’s practice →
                </Link>
              )}
              <button
                type="button"
                onClick={() => setIndex(0)}
                className="btn-secondary"
              >
                Restart
              </button>
            </div>
          </div>
        )}

        {/* Bottom nav */}
        <div className="mt-1 grid grid-cols-[1fr_auto_1fr] items-center py-1 sm:mt-3 sm:py-0">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goToPrev}
              disabled={index === 0}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-[var(--text-secondary)] sm:h-9 sm:w-9"
              aria-label="Previous"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goToNext}
              disabled={index === displayProblems.length - 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-[var(--text-secondary)] sm:h-9 sm:w-9"
              aria-label="Next"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            {solvedCount > 0 && solvedCount < displayProblems.length && (
              <button
                type="button"
                className="ml-1 whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] sm:px-2.5 sm:text-sm"
                onClick={() => {
                  const done = new Set(progress.completedProblemIds);
                  const next = displayProblems.findIndex((p, i) => i > index && !done.has(p.id));
                  if (next >= 0) {
                    setIndex(next);
                    return;
                  }
                  // Wrap around to the first unsolved question; if everything is
                  // solved (findIndex → -1), stay put instead of setIndex(-1).
                  const wrapped = displayProblems.findIndex((p) => !done.has(p.id));
                  if (wrapped >= 0) setIndex(wrapped);
                }}
              >
                {/* Shorter label on narrow viewports so the bottom row never wraps */}
                <span className="sm:hidden">Unsolved</span>
                <span className="hidden sm:inline">Skip to unsolved</span>
              </button>
            )}
          </div>

          <div className="justify-self-center rounded-full px-2 py-0.5 text-[11px] font-medium text-[var(--text-muted)] ring-1 ring-[var(--border)]/80">
            {/* Stable global question number (registry index) — independent of
                arrival route / section filtering. Falls back to the per-topic
                ordinal only for problems missing from the registry. */}
            {globalQuestionNumber !== null
              ? `#${globalQuestionNumber}`
              : `Q${topicProblems.findIndex((p) => p.id === current.id) + 1}`}
          </div>

          {/* On narrow viewports the labels shorten (instead of wrapping into
              multiple lines each) and never wrap internally. */}
          <div className="flex min-w-0 items-center justify-self-end">
            {subjectSlug === "calculus" && (
              <Link
                className="whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] sm:px-2.5 sm:text-sm"
                href={`/${subjectSlug}/test/${current.topicId}`}
              >
                <span className="sm:hidden">Topic test</span>
                <span className="hidden sm:inline">Take topic test</span>
              </Link>
            )}
            <Link
              className="whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] sm:px-2.5 sm:text-sm"
              href={`/${subjectSlug}`}
            >
              <span className="sm:hidden">All topics</span>
              <span className="hidden sm:inline">All {subjectLabel} topics</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
