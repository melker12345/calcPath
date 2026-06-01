"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { MathText } from "@/components/math-text";
import { MathInput } from "@/components/math-input";
import { VoteFeedback } from "@/components/vote-feedback";
import { useProgress } from "@/components/progress-provider";
import { problems, topics, getModuleSectionUrl, getModuleSectionTitle, getNextSection } from "@/lib/calculus-content";
import { trackEvent } from "@/lib/analytics";
import { isAnswerCorrectAsync } from "@/lib/answer-check";
import { detectQuestionContext } from "@/lib/math-input-helpers";
import { ProgressDots } from "@/components/practice/ProgressDots";
import { PracticeFeedback } from "@/components/practice/PracticeFeedback";
import { usePracticeSession } from "@/components/practice/usePracticeSession";



export default function PracticeTopicPage() {
  const params = useParams<{ topicId: string }>();
  const topicId = params?.topicId ?? "";
  const searchParams = useSearchParams();
  const sectionFilter = searchParams.get("section");
  const focusId = searchParams.get("focus");

  const { progress, addAttempt } = useProgress();
  const topic = topics.find((item) => item.id === topicId);

  const topicProblems = useMemo(() => {
    let filtered = problems.filter((problem) => problem.topicId === topicId);
    if (sectionFilter) {
      filtered = filtered.filter((p) => p.section === sectionFilter);
    }
    return filtered;
  }, [topicId, sectionFilter]);

  // Use shared practice session hook
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
    // Transient per-question UI (feedback, answer, overlay) now lives in the hook.
    // All navigation automatically clears it → no more stale "Correct!" on next question.
    answer,
    setAnswer,
    feedback,
    setFeedback,
    overlayDismissed,
    setOverlayDismissed,
  } = usePracticeSession({
    problems: topicProblems,
    completedProblemIds: progress.completedProblemIds,
    sectionFilter,
    focusId,
  });

  const current = displayProblems[index];
  const canonicalQuestionNumber =
    current ? topicProblems.findIndex((problem) => problem.id === current.id) + 1 : 0;

  // Get question context for MathInput suggestions
  const questionContext = useMemo(() => {
    if (!current) return undefined;
    return detectQuestionContext(current.prompt);
  }, [current]);

  // Clean prompt: remove trailing "?" if the prompt ends with a math equation (contains $)
  const cleanedPrompt = useMemo(() => {
    if (!current) return "";
    let p = current.prompt.trim();
    if (p.endsWith("?") && p.includes("$")) {
      p = p.slice(0, -1).trim();
    }
    return p;
  }, [current]);

  useEffect(() => {
    if (!topicId) return;
    trackEvent("view_practice_topic", { topicId });
  }, [topicId]);

  // Note: solvedCount now comes directly from the shared hook (no local state/effect needed).

  // Reset feedback when changing questions (safety net)
  if (!topic) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-sm text-zinc-600">Topic not found.</p>
        <Link className="btn-secondary mt-4 inline-flex" href="/calculus">
          Back to Calculus
        </Link>
      </div>
    );
  }

  if (sectionFilter && topicProblems.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-2xl font-semibold">No questions for this section yet</h1>
        <p className="mt-2 text-zinc-600">We're still adding practice questions for this specific part of the chapter.</p>
        <Link 
          href={`/calculus/modules/${topicId}`} 
          className="mt-4 inline-flex text-[var(--accent)] hover:underline"
        >
          Practice the full {topic.title} chapter instead →
        </Link>
      </div>
    );
  }

  const submitAnswer = async (value: string) => {
    if (!current) return;
    const isCorrect = await isAnswerCorrectAsync(value, current.answer);

    const currentAttempts = feedback?.type === "incorrect" ? feedback.attempts : 0;
    const hintWasUsed = feedback?.type === "incorrect" ? feedback.hintUsed : false;

    addAttempt({
      problemId: current.id,
      topicId: current.topicId,
      correct: isCorrect,
      createdAt: new Date().toISOString(),
    });

    trackEvent("problem_attempted", {
      topicId: current.topicId,
      correct: isCorrect,
    });

    setOverlayDismissed(false);

    // Statuses are managed by usePracticeSession (synced from global progress)


    if (isCorrect) {
      setFeedback({ type: "correct" });
    } else {
      const newAttempts = currentAttempts + 1;
      // Show solution after 3 attempts or if hint was used and they got it wrong again
      const showSolution = newAttempts >= 3 || (hintWasUsed && newAttempts >= 2);
      setFeedback({
        type: "incorrect",
        attempts: newAttempts,
        hintUsed: hintWasUsed,
        showSolution,
      });
    }
  };

  const useHint = () => {
    if (feedback?.type === "correct") return;
    if (feedback?.type === "incorrect" && feedback.hintUsed) return;

    trackEvent("hint_used", { topicId: current.topicId });
    setOverlayDismissed(false);

    // Status managed by hook


    if (feedback?.type === "incorrect") {
      setFeedback({ ...feedback, hintUsed: true });
    } else {
      setFeedback({ type: "incorrect", attempts: 0, hintUsed: true, showSolution: false });
    }
  };

  const showFullSolution = () => {
    if (feedback?.type !== "incorrect") return;
    setFeedback({
      ...feedback,
      showSolution: true,
    });
  };

  // Navigation now comes from usePracticeSession (goToNext / goToPrev)


  // Extract first hint from explanation (first step)
  const getHint = () => {
    const match = current.explanation.match(/Step 1:\s*([^.]+\.)/);
    return match?.[1] || "Think about the rules that apply to this type of problem.";
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-0 pb-0 sm:px-6 sm:py-10">
      {/* Desktop topic header */}
      <div className="mb-5 hidden sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-[var(--text-primary)]">
            {topic.title}
            {sectionFilter && (
              <span className="ml-2 text-xl font-normal text-zinc-500 dark:text-[var(--text-muted)]">
                — {getModuleSectionTitle(topicId, sectionFilter) || sectionFilter}
              </span>
            )}
          </h1>
          {sectionFilter && (() => {
            const backUrl = getModuleSectionUrl(topicId, sectionFilter);
            return backUrl ? (
              <Link 
                href={backUrl} 
                className="mt-1 inline-flex items-center gap-1 text-sm text-[var(--accent)] hover:underline"
              >
                ← Continue reading this section
              </Link>
            ) : null;
          })()}
          {!sectionFilter && (
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-[var(--text-muted)]">
              {topic.description}
            </p>
          )}
        </div>

        {/* Right side actions - simplified in section mode */}
        <div className="flex items-center gap-3">
          {!sectionFilter && (
            <>
              <span className="text-sm text-zinc-500">{solvedCount}/{displayProblems.length}</span>
              <Link className="btn-secondary" href={`/calculus/test/${topic.id}`}>Take test</Link>
            </>
          )}
        </div>
      </div>

      {/* Main card — full-bleed on mobile, rounded card on desktop */}
      <div className="flex min-h-[calc(100dvh-56px)] flex-col justify-end bg-white px-4 pb-1 pt-2 dark:bg-[var(--surface)] sm:min-h-[min(80vh,700px)] sm:rounded-2xl sm:px-8 sm:pb-6 sm:pt-6 sm:shadow-lg">

        {/* Question status circles + simple X/Y for the current section */}
        <div className="flex w-full justify-center">
          <div className="flex items-center gap-2">
            <ProgressDots
              statuses={questionStatuses}
              currentIndex={index}
              onSelect={(i) => {
                // setIndex from hook now clears transients + sets manual nav
                setIndex(i);
              }}
            />

            {/* Simple X/Y next to the dots — only for section practice */}
            {sectionFilter && (
              <span className="text-xs font-semibold tabular-nums text-slate-500 dark:text-[var(--text-muted)]">
                {questionStatuses.filter(s => s === 'solved').length} / {displayProblems.length}
              </span>
            )}
          </div>
        </div>

        {/* Mobile-friendly back to reading link when in section mode */}
        {sectionFilter && (() => {
          const backUrl = getModuleSectionUrl(topicId, sectionFilter);
          return backUrl ? (
            <div className="mt-2 sm:hidden">
              <Link 
                href={backUrl} 
                className="inline-flex items-center gap-1 text-sm text-[var(--accent)] hover:underline"
              >
                ← Continue reading this section
              </Link>
            </div>
          ) : null;
        })()}

        {/* Question — fills available space, pushes input to bottom */}
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-5">
          <h2 className="text-center text-lg font-semibold leading-relaxed text-zinc-900 dark:text-[var(--text-primary)] sm:text-2xl">
            <MathText text={cleanedPrompt} />
          </h2>
          {(() => {
            const moduleUrl = getModuleSectionUrl(current.topicId, current.section);
            const sectionTitle = getModuleSectionTitle(current.topicId, current.section);
            if (!moduleUrl) return null;
            return (
              <Link
                href={moduleUrl}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 sm:text-sm"
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
        {(() => {
          const isDismissable = feedback?.type === "incorrect" && !feedback.showSolution;

          const correctOverlay = feedback?.type === "correct" ? (
            <PracticeFeedback
              feedback={feedback}
              current={current}
              onNext={goToNext}
              onUseHint={useHint}
              onShowSolution={showFullSolution}
              getHint={getHint}
              overlayDismissed={overlayDismissed}
              setOverlayDismissed={setOverlayDismissed}
              finalAnswer={
                current.explanation.match(/Final answer:\s*(.+?)\.?$/)?.[1] ||
                `$${current.answer}$`
              }
            />
          ) : null;

          const incorrectOverlay = (feedback?.type === "incorrect" && !overlayDismissed) ? (
            <PracticeFeedback
              feedback={feedback}
              current={current}
              onNext={goToNext}
              onUseHint={useHint}
              onShowSolution={showFullSolution}
              getHint={getHint}
              overlayDismissed={overlayDismissed}
              setOverlayDismissed={setOverlayDismissed}
              finalAnswer={
                current.explanation.match(/Final answer:\s*(.+?)\.?$/)?.[1] ||
                `$${current.answer}$`
              }
            />
          ) : null;

          const overlay = correctOverlay || incorrectOverlay || undefined;

          return current.type === "mcq" ? (
            <div className="flex flex-col gap-2 sm:gap-3">
              {(!overlay || overlayDismissed) && current.choices?.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => {
                    setAnswer(choice);
                    submitAnswer(choice);
                  }}
                  disabled={feedback?.type === "correct"}
                  className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-left text-base font-medium theme-text transition hover:border-[var(--accent)] hover:bg-[var(--surface-2)] active:scale-[0.98] disabled:opacity-50 sm:px-5 sm:py-3.5 sm:text-lg dark:bg-[var(--surface)] dark:text-[var(--text-primary)] dark:hover:border-[var(--accent)] dark:hover:bg-[var(--surface-2)]"
                >
                  <MathText text={choice} />
                </button>
              ))}
              {overlay && !overlayDismissed && (
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
              hintDisabled={
                feedback?.type === "correct" ||
                (feedback?.type === "incorrect" && feedback.hintUsed) ||
                (feedback?.type === "incorrect" && feedback.showSolution)
              }
              questionContext={questionContext}
              answerHint={current.answer}
              feedbackOverlay={overlay}
              onDismissOverlay={isDismissable ? () => setOverlayDismissed(true) : undefined}
              questionPrompt={current.prompt}
            />
          );
        })()}

        {/* All mastered - different UI depending on whether we're in section mode */}
        {solvedCount >= displayProblems.length && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center sm:mt-6 sm:rounded-2xl sm:p-6 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <p className="text-xl font-bold text-emerald-800 dark:text-emerald-300">Great job!</p>
            
            {sectionFilter ? (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
                {/* Return to reading the section */}
                {(() => {
                  const backUrl = getModuleSectionUrl(topicId, sectionFilter);
                  return backUrl ? (
                    <Link
                      href={backUrl}
                      className="rounded-xl border border-emerald-300 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 dark:border-emerald-800 dark:bg-[var(--surface)] dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                    >
                      Return to reading
                    </Link>
                  ) : null;
                })()}

                {/* Practice next (section if possible, otherwise next chapter) */}
                {(() => {
                  if (sectionFilter) {
                    const nextSectionSlug = getNextSection(topicId, sectionFilter);
                    if (nextSectionSlug) {
                      const nextSectionTitle = getModuleSectionTitle(topicId, nextSectionSlug) || nextSectionSlug;
                      return (
                        <Link
                          href={`/calculus/practice/${topicId}?section=${nextSectionSlug}`}
                          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                        >
                          Practice next: {nextSectionTitle}
                        </Link>
                      );
                    }
                  }

                  // Fallback: next chapter
                  const currentIndex = topics.findIndex(t => t.id === topicId);
                  const nextTopic = currentIndex !== -1 && currentIndex < topics.length - 1 
                    ? topics[currentIndex + 1] 
                    : null;
                  return nextTopic ? (
                    <Link
                      href={`/calculus/modules/${nextTopic.id}`}
                      className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                    >
                      Practice next topic: {nextTopic.title}
                    </Link>
                  ) : (
                    <Link
                      href="/calculus"
                      className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Back to Calculus
                    </Link>
                  );
                })()}
              </div>
            ) : (
              // Full chapter mode - keep simple for now
              <div className="mt-4">
                <Link
                  href={`/calculus/modules/${topicId}`}
                  className="inline-flex rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Return to {topic.title}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Navigation toolbar */}
        <div className="mt-1 grid grid-cols-[1fr_auto_1fr] items-center py-1 sm:mt-3 sm:py-0">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 disabled:opacity-25 sm:h-9 sm:w-9"
              onClick={goToPrev}
              disabled={index === 0}
              aria-label="Previous"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 disabled:opacity-25 sm:h-9 sm:w-9"
              onClick={goToNext}
              disabled={index === displayProblems.length - 1}
              aria-label="Next"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
            {solvedCount > 0 && solvedCount < displayProblems.length && (
              <button
                type="button"
                className="ml-1 rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-400 transition hover:bg-zinc-100 sm:text-sm"
                onClick={() => {
                  const completedSet = new Set(progress.completedProblemIds);
                  const nextUnsolved = displayProblems.findIndex(
                    (p, i) => i > index && !completedSet.has(p.id)
                  );
                  if (nextUnsolved >= 0) {
                    setIndex(nextUnsolved);
                  } else {
                    const first = displayProblems.findIndex((p) => !completedSet.has(p.id));
                    if (first >= 0) setIndex(first);
                  }
                  // setIndex (hook) already cleared transient state
                }}
              >
                Skip to unsolved
              </button>
            )}
          </div>
          <div className="justify-self-center rounded-full px-2 py-0.5 text-[11px] font-medium text-zinc-400 ring-1 ring-zinc-200/80">
            Q{canonicalQuestionNumber}
          </div>
          <Link className="justify-self-end rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-400 transition hover:bg-zinc-100 sm:text-sm" href="/calculus">
            All chapters
          </Link>
        </div>
      </div>
    </div>
  );
}
