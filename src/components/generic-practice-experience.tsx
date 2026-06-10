"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { MathText } from "@/components/math-text";
import { MathInput } from "@/components/math-input";
import { useProgress } from "@/components/progress-provider";
import { isAnswerCorrectAsync } from "@/lib/answer-check";
import { detectQuestionContext } from "@/lib/math-input-helpers";
import { getSectionHref } from "@/lib/subject-urls";
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
              className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 active:scale-[0.985]"
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
    hasManuallyNavigated,
    solvedCount,
    goToNext,
    goToPrev,

    answer,
    setAnswer,
    feedback,
    setFeedback,
    overlayDismissed,
    setOverlayDismissed,
  } = usePracticeSession({
    problems: topicProblems,
    completedProblemIds: progress.completedProblemIds,
    focusId,
  });

  const current = hookCurrent || displayProblems[index];
  // For "back to explanation" after mastering (or in empty states), prefer a section anchor if we have one
  // (e.g. when practicing a filtered ?section= or when all questions share a section). Falls back to topic root.
  const backToExplanationHref = getSectionHref(
    subjectSlug,
    topic.id,
    current?.section || displayProblems[0]?.section
  );

  if (displayProblems.length === 0) {
    // Extra guard: show clean intentional "no questions yet" instead of falling to bad-data fallback,
    // broken nav (length-1=-1), "All 0 mastered", or hitting PracticeErrorBoundary.
    // Matches the polished card look and feel of the main data-driven routes exactly.
    return (
      <div className="mx-auto w-full max-w-3xl px-0 pb-0 sm:px-6 sm:py-10">
        <div className="flex min-h-[calc(100dvh-56px)] flex-col justify-center bg-[var(--surface)] px-4 pb-1 pt-2 sm:min-h-[min(80vh,700px)] sm:rounded-2xl sm:px-8 sm:pb-6 sm:pt-6 sm:shadow-lg">
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
                className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 active:scale-[0.985]"
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

  const questionContext = useMemo(
    () => (current && typeof current.prompt === "string" ? detectQuestionContext(current.prompt) : undefined),
    [current]
  );

  if (!topic) {
    return <div className="p-8 text-sm theme-text-secondary">Topic not found in data.</div>;
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
          className="mt-4 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm text-white"
        >
          Skip to next question →
        </button>
        <Link href={`/${subjectSlug}`} className="mt-3 block underline text-[var(--accent)]">Back to {subjectLabel}</Link>
      </div>
    );
  }

  const submitAnswer = async (val: string) => {
    const isCorrect = await isAnswerCorrectAsync(val, current.answer);
    const currentAttempts = feedback?.type === "incorrect" ? feedback.attempts : 0;
    const hintWasUsed = feedback?.type === "incorrect" ? feedback.hintUsed : false;

    addAttempt({
      problemId: current.id,
      topicId: current.topicId,
      correct: isCorrect,
      createdAt: new Date().toISOString(),
    });
    setOverlayDismissed(false);

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
    setOverlayDismissed(false);
    if (feedback?.type === "incorrect") {
      setFeedback({ ...feedback, hintUsed: true });
    } else {
      setFeedback({ type: "incorrect", attempts: 0, hintUsed: true, showSolution: false });
    }
  };

  const getHint = () => getDefaultHint(current?.explanation || "");
  const finalAnswer = extractFinalAnswer(current?.explanation || "", current?.answer || "");

  const isDismissable = feedback?.type === "incorrect" && !feedback.showSolution;

  // Use the *shared improved* PracticeFeedback for the entire overlay (correct + incorrect).
  // Only create the element when there is actual feedback to display. This prevents the
  // keypad from being unconditionally hidden (via the `feedbackOverlay ? "invisible" : ""`
  // logic inside MathInput) on the very first question before any answer is submitted.
  const feedbackOverlay = feedback ? (
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
      overlayDismissed={overlayDismissed}
      setOverlayDismissed={setOverlayDismissed}
      finalAnswer={finalAnswer}
      isLastQuestion={index === displayProblems.length - 1}
    />
  ) : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-0 pb-0 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="mb-5 hidden sm:flex sm:items-center sm:justify-between px-1">
        <div>
          <h1 className="text-2xl font-bold theme-text">{topic.title}</h1>
          <p className="mt-0.5 text-sm theme-text-muted">{topic.description}</p>
        </div>
        <span className="text-sm theme-text-muted">{solvedCount}/{displayProblems.length} mastered</span>
      </div>

      {/* Main practice card (uses the established visual language) */}
      <div className="flex min-h-[calc(100dvh-56px)] flex-col justify-end bg-[var(--surface)] px-4 pb-1 pt-2 sm:min-h-[min(80vh,700px)] sm:rounded-2xl sm:px-8 sm:pb-6 sm:pt-6 sm:shadow-lg">
        {/* Progress dots + "1 / N" counter (counter positioned on right of dots; uses theme-text-muted) */}
        <div className="flex w-full justify-center">
          <div className="flex items-center gap-2">
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
          {/* Question prompt area: centered + py-6 (increased vs 5 for more vertical breathing room/legibility around prompt) */}
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center">
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
            {subjectSlug === "calculus" && (
              <Link
                href={`/${subjectSlug}/test/${current.topicId}`}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-50 dark:text-amber-400"
              >
                Take topic test →
              </Link>
            )}
          </div>

          {/* Answer input area */}
          {current.type === "mcq" ? (
            <div className="flex flex-col gap-2 sm:gap-3">
              {(!feedbackOverlay || overlayDismissed) &&
                current.choices?.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => {
                      setAnswer(choice);
                      submitAnswer(choice);
                    }}
                    disabled={feedback?.type === "correct"}
                    className="rounded-xl border theme-border bg-[var(--surface)] px-4 py-3 text-left text-base font-medium theme-text transition hover:border-[var(--accent)] hover:bg-[var(--surface-2)] active:scale-[0.98] disabled:opacity-50 sm:px-5 sm:py-3.5 sm:text-lg"
                  >
                    <MathText text={choice} />
                  </button>
                ))}

              {feedbackOverlay && !overlayDismissed && (
                <div className="relative overflow-hidden rounded-xl border theme-border">
                  {isDismissable && (
                    <button
                      type="button"
                      onClick={() => setOverlayDismissed(true)}
                      className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface)]/80 text-sm theme-text-muted shadow-sm backdrop-blur transition hover:bg-[var(--surface)] hover:text-[var(--text-secondary)]"
                    >
                      ×
                    </button>
                  )}
                  {feedbackOverlay}
                </div>
              )}
            </div>
          ) : (
            <MathInput
              value={answer}
              onChange={setAnswer}
              onSubmit={() => submitAnswer(answer)}
              onHint={useHint}
              subject="generic" /* for primary data-driven routes — uses neutral theme + heuristics */
              hintDisabled={feedback?.type === "correct" || (feedback?.type === "incorrect" && (feedback.hintUsed || feedback.showSolution))}
              questionContext={questionContext}
              answerHint={current.answer}
              feedbackOverlay={feedbackOverlay && !overlayDismissed ? feedbackOverlay : undefined}
              onDismissOverlay={isDismissable ? () => setOverlayDismissed(true) : undefined}
              questionPrompt={current.prompt}
            />
          )}
        </QuestionErrorBoundary>

        {/* All mastered */}
        {solvedCount >= displayProblems.length && (
          <div className="mt-4 rounded-xl border theme-border bg-[var(--surface-2)] p-4 text-center sm:mt-6 sm:rounded-2xl sm:p-5">
            <p className="text-lg font-bold theme-text">Congrats! All {displayProblems.length} mastered.</p>
            <p className="mt-1 text-sm theme-text-secondary">You've completed the practice for this section.</p>
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
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] disabled:opacity-25 sm:h-9 sm:w-9"
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
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] disabled:opacity-25 sm:h-9 sm:w-9"
              aria-label="Next"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            {solvedCount > 0 && solvedCount < displayProblems.length && (
              <button
                type="button"
                className="ml-1 rounded-lg px-2.5 py-1 text-xs font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] sm:text-sm"
                onClick={() => {
                  const done = new Set(progress.completedProblemIds);
                  const next = displayProblems.findIndex((p, i) => i > index && !done.has(p.id));
                  setIndex(next >= 0 ? next : (displayProblems.findIndex((p) => !done.has(p.id)) || 0));
                }}
              >
                Skip to unsolved
              </button>
            )}
          </div>

          <div className="justify-self-center rounded-full px-2 py-0.5 text-[11px] font-medium text-[var(--text-muted)] ring-1 ring-[var(--border)]/80">
            Q{topicProblems.findIndex((p) => p.id === current.id) + 1}
          </div>

          <Link
            className="justify-self-end rounded-lg px-2.5 py-1 text-xs font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] sm:text-sm"
            href={`/${subjectSlug}`}
          >
            All {subjectLabel} topics
          </Link>
        </div>
      </div>
    </div>
  );
}
