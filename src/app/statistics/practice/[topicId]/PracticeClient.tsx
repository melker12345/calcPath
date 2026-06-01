"use client";

import { useMemo } from "react";
import Link from "next/link";
import { MathText } from "@/components/math-text";
import { MathInput } from "@/components/math-input";
import { VoteFeedback } from "@/components/vote-feedback";
import { ProgressProvider } from "@/components/progress-provider";
import { AuthProvider } from "@/components/auth-provider";
import { useProgress } from "@/components/progress-provider";
import { isAnswerCorrectAsync } from "@/lib/answer-check";
import { detectQuestionContext } from "@/lib/math-input-helpers";
import { ProgressDots } from "@/components/practice/ProgressDots";
import { PracticeFeedback } from "@/components/practice/PracticeFeedback";
import { usePracticeSession } from "@/components/practice/usePracticeSession";
import type { Topic, Problem } from "@/lib/shared-types";

/**
 * Local replacements for the helpers previously imported from the (now-inert)
 * "@/lib/statistics-content" shim.
 *
 * These are defined here (inside the client subtree) so the rich practice UI
 * continues to support the "Review this topic" deep-link affordance under the
 * question prompt without ever importing a legacy shim.
 *
 * For the new FileSystemContentBundle-backed statistics content, we construct
 * the canonical module URL using the stable topicId + section (which matches
 * MDX heading anchors in the per-topic module.mdx files under content/statistics/).
 * Title lookup is not required for the current UI (falls back to generic label).
 */
function getModuleSectionUrl(topicId: string, section: string): string | null {
  if (!topicId || !section) return null;
  return `/statistics/modules/${topicId}#${section}`;
}

function getModuleSectionTitle(topicId: string, section: string): string | null {
  // Per-section titles would require parsing the MDX or maintaining a map;
  // the original shim (and current main app) often fell back anyway. Returning
  // null preserves the exact conditional rendering + label logic from the
  // original high-quality Statistics practice experience.
  return null;
}

interface StatisticsPracticeClientProps {
  topic: Topic;
  problems: Problem[];
  focusId?: string | null;
}

/**
 * Client component containing the *full original* high-quality practice UI
 * for a Statistics topic.
 *
 * - Receives clean `topic` + pre-filtered `problems` (and focusId) as props
 *   from the Server Component (which loaded them via getFileSystemContentBundle).
 * - Owns all interactive state via usePracticeSession + local handlers.
 * - Uses MathInput, PracticeFeedback, ProgressDots, VoteFeedback, etc. exactly
 *   as the legacy implementation.
 * - Imports *zero* legacy shims (no @/lib/statistics-content, no @/lib/statistics-modules).
 * - Therefore this client module + its dependency graph no longer participates
 *   in the bad import chain that used to trigger "topics is not defined" in
 *   progress.ts at module evaluation time.
 */
/**
 * Local providers (Auth + Progress) are rendered here so that the rich practice UI
 * (which calls useProgress / addAttempt) has them in its ancestor tree without
 * any layout-level provider that would pull the progress graph into the initial
 * route chunk (the source of the "topics is not defined" error).
 */
export default function StatisticsPracticeClient(props: StatisticsPracticeClientProps) {
  return (
    <AuthProvider>
      <ProgressProvider>
        <StatisticsPracticeClientInner {...props} />
      </ProgressProvider>
    </AuthProvider>
  );
}

function StatisticsPracticeClientInner({
  topic,
  problems: topicProblems,
  focusId,
}: StatisticsPracticeClientProps) {
  const { progress, addAttempt } = useProgress();

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
    // Transient UI now comes from the hook (cleared automatically on any navigation)
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

  const current = displayProblems[index];
  const canonicalQuestionNumber =
    current ? topicProblems.findIndex((problem) => problem.id === current.id) + 1 : 0;
  const questionContext = useMemo(() => current ? detectQuestionContext(current.prompt) : undefined, [current]);

  if (!current) return null;

  const submitAnswer = async (val: string) => {
    const isCorrect = await isAnswerCorrectAsync(val, current.answer);
    const currentAttempts = feedback?.type === "incorrect" ? feedback.attempts : 0;
    const hintWasUsed = feedback?.type === "incorrect" ? feedback.hintUsed : false;
    addAttempt({ problemId: current.id, topicId: current.topicId, correct: isCorrect, createdAt: new Date().toISOString() });
    setOverlayDismissed(false);
    if (isCorrect) {
      setFeedback({ type: "correct" });
    } else {
      const newAttempts = currentAttempts + 1;
      setFeedback({ type: "incorrect", attempts: newAttempts, hintUsed: hintWasUsed, showSolution: newAttempts >= 3 || (hintWasUsed && newAttempts >= 2) });
    }
  };

  const useHint = () => {
    if (feedback?.type === "correct") return;
    if (feedback?.type === "incorrect" && feedback.hintUsed) return;
    setOverlayDismissed(false);
    if (feedback?.type === "incorrect") setFeedback({ ...feedback, hintUsed: true });
    else setFeedback({ type: "incorrect", attempts: 0, hintUsed: true, showSolution: false });
  };

  const getHint = () => {
    const m = current.explanation.match(/Step 1:\s*([^.]+\.)/);
    return m?.[1] || "Think about the rules that apply to this type of problem.";
  };

  const finalAnswer = current.explanation.match(/Final answer:\s*(.+?)\.?$/)?.[1] || `$${current.answer}$`;
  const isDismissable = feedback?.type === "incorrect" && !feedback.showSolution;

  const correctOverlay = feedback?.type === "correct" ? (
    <PracticeFeedback
      feedback={feedback}
      current={current}
      onNext={goToNext}
      onUseHint={useHint}
      onShowSolution={() => setFeedback((prev) => 
        prev && prev.type === "incorrect" ? { ...prev, showSolution: true } : prev
      )}
      getHint={getHint}
      overlayDismissed={overlayDismissed}
      setOverlayDismissed={setOverlayDismissed}
      finalAnswer={finalAnswer}
    />
  ) : null;

  const incorrectOverlay = (feedback?.type === "incorrect" && !overlayDismissed) ? (
    <PracticeFeedback
      feedback={feedback}
      current={current}
      onNext={goToNext}
      onUseHint={useHint}
      onShowSolution={() => setFeedback((prev) => 
        prev && prev.type === "incorrect" ? { ...prev, showSolution: true } : prev
      )}
      getHint={getHint}
      overlayDismissed={overlayDismissed}
      setOverlayDismissed={setOverlayDismissed}
      finalAnswer={finalAnswer}
    />
  ) : null;

  const overlay = correctOverlay || incorrectOverlay || undefined;

  return (
    <div className="mx-auto w-full max-w-3xl px-0 pb-0 sm:px-6 sm:py-10">
      {/* Desktop header */}
      <div className="mb-5 hidden sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold theme-text">{topic.title}</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{topic.description}</p>
        </div>
        <span className="text-sm text-zinc-500">{solvedCount}/{displayProblems.length} mastered</span>
      </div>

      {/* Main card */}
      <div className="flex min-h-[calc(100dvh-56px)] flex-col justify-end bg-white px-4 pb-1 pt-2 dark:bg-[var(--surface)] sm:min-h-[min(80vh,700px)] sm:rounded-2xl sm:px-8 sm:pb-6 sm:pt-6 sm:shadow-lg">

        {/* Question status dots */}
        <div className="flex w-full justify-center">
          <div className="flex items-center gap-2">
            <ProgressDots
              statuses={questionStatuses}
              currentIndex={index}
              onSelect={(i) => {
                // setIndex (from hook) now handles clearing transient UI + marking manual nav
                setIndex(i);
              }}
            />
            <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-400">
              {index + 1} / {displayProblems.length}
            </span>
          </div>
        </div>

        {/* Question */}
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-5">
          <h2 className="text-center text-lg font-semibold leading-relaxed theme-text sm:text-2xl">
            <MathText text={current.prompt} />
          </h2>
          {(() => {
            const moduleUrl = getModuleSectionUrl(current.topicId, current.section);
            const sectionTitle = getModuleSectionTitle(current.topicId, current.section);
            if (!moduleUrl) return null;
            return (
              <Link
                href={moduleUrl}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                title={sectionTitle ? `Read: ${sectionTitle}` : "Review this topic"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 sm:h-4 sm:w-4">
                  <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.34A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
                </svg>
                {sectionTitle ? sectionTitle : "Review this topic"}
              </Link>
            );
          })()}
        </div>

        {/* Answer area */}
        {current.type === "mcq" ? (
          <div className="flex flex-col gap-2 sm:gap-3">
            {(!overlay || overlayDismissed) && current.choices?.map((choice) => (
              <button key={choice} type="button" onClick={() => { setAnswer(choice); submitAnswer(choice); }}
                disabled={feedback?.type === "correct"}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-base font-medium theme-text transition hover:border-blue-300 hover:bg-blue-50 active:scale-[0.98] disabled:opacity-50 sm:px-5 sm:py-3.5 sm:text-lg"
              >
                <MathText text={choice} />
              </button>
            ))}
            {overlay && !overlayDismissed && (
              <div className="relative overflow-hidden rounded-xl border border-amber-200">
                {isDismissable && (
                  <button type="button" onClick={() => setOverlayDismissed(true)}
                    className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-sm text-zinc-400 shadow-sm backdrop-blur transition hover:bg-white hover:text-zinc-600">×</button>
                )}
                {overlay}
              </div>
            )}
          </div>
        ) : (
          <MathInput
            value={answer}
            onChange={setAnswer}
            onSubmit={() => submitAnswer(answer)}
            onHint={useHint}
            subject="stats"
            hintDisabled={feedback?.type === "correct" || (feedback?.type === "incorrect" && (feedback.hintUsed || feedback.showSolution))}
            questionContext={questionContext}
            answerHint={current.answer}
            feedbackOverlay={overlay}
            onDismissOverlay={isDismissable ? () => setOverlayDismissed(true) : undefined}
            questionPrompt={current.prompt}
          />
        )}

        {/* All mastered */}
        {solvedCount >= displayProblems.length && (
          <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-900/20 p-4 text-center sm:mt-6 sm:rounded-2xl sm:p-5">
            <p className="text-lg font-bold text-emerald-300">All {displayProblems.length} problems mastered!</p>
            <p className="mt-1 text-sm text-emerald-600">Shuffle for a fresh run.</p>
            <button type="button" onClick={shuffleAndRestart} className="mt-3 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-95">
              Shuffle &amp; restart
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-1 grid grid-cols-[1fr_auto_1fr] items-center py-1 sm:mt-3 sm:py-0">
          <div className="flex items-center gap-1">
            <button type="button" onClick={goToPrev} disabled={index === 0}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 disabled:opacity-25 sm:h-9 sm:w-9"
              aria-label="Previous">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button type="button" onClick={goToNext} disabled={index === displayProblems.length - 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 disabled:opacity-25 sm:h-9 sm:w-9"
              aria-label="Next">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
            {solvedCount > 0 && solvedCount < displayProblems.length && (
              <button type="button"
                className="ml-1 rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-400 transition hover:bg-zinc-100 sm:text-sm"
                onClick={() => {
                  const done = new Set(progress.completedProblemIds);
                  const next = displayProblems.findIndex((p, i) => i > index && !done.has(p.id));
                  // setIndex from hook clears transient UI (feedback/answer/overlay) automatically
                  setIndex(next >= 0 ? next : (displayProblems.findIndex((p) => !done.has(p.id)) || 0));
                }}>Skip to unsolved</button>
            )}
          </div>
          <div className="justify-self-center rounded-full px-2 py-0.5 text-[11px] font-medium text-zinc-400 ring-1 ring-zinc-200/80">
            Q{canonicalQuestionNumber}
          </div>
          <Link className="justify-self-end rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-400 transition hover:bg-zinc-100 sm:text-sm" href="/statistics">
            All chapters
          </Link>
        </div>
      </div>
    </div>
  );
}
