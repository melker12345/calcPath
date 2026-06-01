"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { MathText } from "@/components/math-text";
import { BlockMath, InlineMath } from "react-katex";
import { MathInput } from "@/components/math-input";
import { useProgress } from "@/components/progress-provider";
import { isAnswerCorrectAsync } from "@/lib/answer-check";
import { detectQuestionContext } from "@/lib/math-input-helpers";
import { ProgressDots } from "@/components/practice/ProgressDots";
import { PracticeFeedback } from "@/components/practice/PracticeFeedback";
import { usePracticeSession } from "@/components/practice/usePracticeSession";
import type { Problem, Topic } from "@/lib/shared-types";

/**
 * GenericPracticeExperience
 *
 * Fully data-driven practice UI for the experimental /x/ area.
 * Consumes Problem[] + Topic directly from FileSystemContentBundle (via server props).
 * Reuses ALL the shared practice primitives (usePracticeSession, ProgressDots, PracticeFeedback).
 *
 * This is the integration point proving "generic components + new content data = working practice".
 *
 * Differences / simplifications vs legacy per-subject pages (for experimental slice):
 * - Uses the improved PracticeFeedback for *both* correct + incorrect states (less duplication).
 * - Minimal custom RichMath (delegates heavily to MathText + katex where needed).
 * - Subject context for MathInput defaults to generic heuristics (can be enhanced).
 * - No per-subject getModuleSectionUrl deep links yet (future: derive from MDX headings or keep legacy maps).
 * - Progress + answer checking use the global shared systems (stable ids preserved from content).
 *
 * Limitations noted in NOTES.md.
 */
export function GenericPracticeExperience({
  topic,
  problems: allTopicProblems,
  subjectSlug,
  subjectLabel,
}: {
  topic: Topic;
  problems: Problem[];
  subjectSlug: string;
  subjectLabel: string;
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
    shuffleAndRestart,
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

  const questionContext = useMemo(
    () => (current ? detectQuestionContext(current.prompt) : undefined),
    [current]
  );

  if (!topic) {
    return <div className="p-8 text-sm theme-text-muted">Topic not found in data.</div>;
  }
  if (!current) {
    return (
      <div className="mx-auto max-w-3xl p-8 theme-text">
        <p className="theme-text-secondary">No practice questions available for this topic in the loaded content data yet.</p>
        <Link href={`/x/${subjectSlug}`} className="mt-4 inline-block underline theme-text">Back to {subjectLabel}</Link>
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

  const getHint = () => {
    const m = current.explanation.match(/Step 1:\s*([^.]+\.)/);
    return m?.[1] || "Think about the rules that apply to this type of problem.";
  };

  const finalAnswer = current.explanation.match(/Final answer:\s*(.+?)\.?$/)?.[1] || `$${current.answer}$`;

  const isDismissable = feedback?.type === "incorrect" && !feedback.showSolution;

  // Use the *shared improved* PracticeFeedback for the entire overlay (correct + incorrect)
  const feedbackOverlay = (
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
    />
  );

  // Very small local rich text for prompts (MathText covers most; katex for complex)
  function RichPrompt({ value }: { value: string }) {
    // Fallback splitter only for block math in prompts if needed
    if (value.includes("\\begin{") || value.includes("$$")) {
      return <MathText text={value} />;
    }
    return <MathText text={value} />;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-0 pb-0 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="mb-5 hidden sm:flex sm:items-center sm:justify-between px-1">
        <div>
          <h1 className="text-2xl font-bold theme-text">{topic.title}</h1>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-[var(--text-muted)]">{topic.description}</p>
        </div>
        <span className="text-sm theme-text-muted">{solvedCount}/{displayProblems.length} mastered</span>
      </div>

      {/* Main practice card (matches legacy visual language) */}
      <div className="flex min-h-[calc(100dvh-56px)] flex-col justify-end bg-white px-4 pb-1 pt-2 dark:bg-[var(--surface)] sm:min-h-[min(80vh,700px)] sm:rounded-2xl sm:px-8 sm:pb-6 sm:pt-6 sm:shadow-lg">
        {/* Progress dots */}
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

        {/* Question prompt */}
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-5 text-center">
          <div role="heading" aria-level={2} className="text-lg font-semibold leading-relaxed sm:text-2xl">
            <RichPrompt value={current.prompt} />
          </div>

          {/* Optional link back to explanation (generic, points to our /x/ module route) */}
          <Link
            href={`/x/${subjectSlug}/modules/${current.topicId}`}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30"
          >
            Review the explanation for this topic →
          </Link>
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
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-base font-medium theme-text transition hover:border-blue-300 hover:bg-blue-50 active:scale-[0.98] disabled:opacity-50 sm:px-5 sm:py-3.5 sm:text-lg dark:border-[var(--border)] dark:bg-[var(--surface)] dark:hover:border-[var(--accent)] dark:hover:bg-[var(--surface-2)]"
                >
                  <MathText text={choice} />
                </button>
              ))}

            {feedbackOverlay && !overlayDismissed && (
              <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-[var(--border)]">
                {isDismissable && (
                  <button
                    type="button"
                    onClick={() => setOverlayDismissed(true)}
                    className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-sm text-zinc-400 shadow-sm backdrop-blur transition hover:bg-white hover:text-zinc-600 dark:bg-[var(--surface-2)]/80 dark:text-[var(--text-muted)] dark:hover:bg-[var(--surface-2)] dark:hover:text-[var(--text-secondary)]"
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
            subject="generic" /* experimental - uses broad heuristics */
            hintDisabled={feedback?.type === "correct" || (feedback?.type === "incorrect" && (feedback.hintUsed || feedback.showSolution))}
            questionContext={questionContext}
            answerHint={current.answer}
            feedbackOverlay={feedbackOverlay && !overlayDismissed ? feedbackOverlay : undefined}
            onDismissOverlay={isDismissable ? () => setOverlayDismissed(true) : undefined}
            questionPrompt={current.prompt}
          />
        )}

        {/* All mastered */}
        {solvedCount >= displayProblems.length && (
          <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-900/20 p-4 text-center sm:mt-6 sm:rounded-2xl sm:p-5 dark:border-emerald-800/50 dark:bg-emerald-950/30">
            <p className="text-lg font-bold text-emerald-300 dark:text-emerald-200">All {displayProblems.length} problems mastered!</p>
            <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">Shuffle for a fresh run.</p>
            <button
              type="button"
              onClick={shuffleAndRestart}
              className="mt-3 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-95 dark:bg-white dark:text-[var(--bg)] dark:hover:bg-zinc-200"
            >
              Shuffle &amp; restart
            </button>
          </div>
        )}

        {/* Bottom nav */}
        <div className="mt-1 grid grid-cols-[1fr_auto_1fr] items-center py-1 sm:mt-3 sm:py-0">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goToPrev}
              disabled={index === 0}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 disabled:opacity-25 sm:h-9 sm:w-9 dark:text-[var(--text-muted)] dark:hover:bg-[var(--surface-2)]"
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
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 disabled:opacity-25 sm:h-9 sm:w-9 dark:text-[var(--text-muted)] dark:hover:bg-[var(--surface-2)]"
              aria-label="Next"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            {solvedCount > 0 && solvedCount < displayProblems.length && (
              <button
                type="button"
                className="ml-1 rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-400 transition hover:bg-zinc-100 sm:text-sm dark:text-[var(--text-muted)] dark:hover:bg-[var(--surface-2)]"
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

          <div className="justify-self-center rounded-full px-2 py-0.5 text-[11px] font-medium text-zinc-400 ring-1 ring-zinc-200/80 dark:text-[var(--text-muted)] dark:ring-[var(--border)]">
            Q{topicProblems.findIndex((p) => p.id === current.id) + 1}
          </div>

          <Link
            className="justify-self-end rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-400 transition hover:bg-zinc-100 sm:text-sm dark:text-[var(--text-muted)] dark:hover:bg-[var(--surface-2)]"
            href={`/x/${subjectSlug}`}
          >
            All {subjectLabel} topics
          </Link>
        </div>
      </div>
    </div>
  );
}
