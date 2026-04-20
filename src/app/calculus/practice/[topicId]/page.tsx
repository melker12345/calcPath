"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MathText } from "@/components/math-text";
import { MathInput } from "@/components/math-input";
import { VoteFeedback } from "@/components/vote-feedback";
import { useProgress } from "@/components/progress-provider";
import { problems, topics, getModuleSectionUrl, getModuleSectionTitle } from "@/lib/calculus-content";
import { trackEvent } from "@/lib/analytics";
import { isAnswerCorrectAsync } from "@/lib/answer-check";
import { detectQuestionContext } from "@/lib/math-input-helpers";

type FeedbackState = 
  | null 
  | { type: "correct" }
  | { type: "incorrect"; attempts: number; hintUsed: boolean; showSolution: boolean };

export default function PracticeTopicPage() {
  const params = useParams<{ topicId: string }>();
  const topicId = params?.topicId ?? "";
  const { progress, addAttempt } = useProgress();
  const topic = topics.find((item) => item.id === topicId);
  const topicProblems = useMemo(
    () => problems.filter((problem) => problem.topicId === topicId),
    [topicId],
  );
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [overlayDismissed, setOverlayDismissed] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);
  const [shuffled, setShuffled] = useState(false);
  const [displayProblems, setDisplayProblems] = useState(topicProblems);
  const [resumeReady, setResumeReady] = useState(false);

  const current = displayProblems[index];
  const canonicalQuestionNumber =
    current ? topicProblems.findIndex((problem) => problem.id === current.id) + 1 : 0;

  // Get question context for MathInput suggestions
  const questionContext = useMemo(() => {
    if (!current) return undefined;
    return detectQuestionContext(current.prompt);
  }, [current]);

  useEffect(() => {
    if (!topicId) return;
    trackEvent("view_practice_topic", { topicId });
  }, [topicId]);

  useEffect(() => {
    // Calculate mastered count on client only to avoid hydration mismatch
    const count = progress.completedProblemIds.filter((id) =>
      topicProblems.some((problem) => problem.id === id)
    ).length;
    setSolvedCount(count);
  }, [progress.completedProblemIds, topicProblems]);

  // Resume from the first unsolved problem on initial load
  useEffect(() => {
    if (resumeReady) return;
    const completedSet = new Set(progress.completedProblemIds);
    const firstUnsolved = topicProblems.findIndex((p) => !completedSet.has(p.id));
    if (firstUnsolved > 0) {
      setIndex(firstUnsolved);
    }
    setResumeReady(true);
  }, [progress.completedProblemIds, topicProblems, resumeReady]);

  // Keep displayProblems in sync with topicProblems when not shuffled
  useEffect(() => {
    if (!shuffled) setDisplayProblems(topicProblems);
  }, [topicProblems, shuffled]);

  const shuffleAndRestart = () => {
    const shuffledProblems = [...topicProblems].sort(() => Math.random() - 0.5);
    setDisplayProblems(shuffledProblems);
    setShuffled(true);
    setIndex(0);
    setFeedback(null);
    setAnswer("");
  };

  // Reset feedback when changing questions
  useEffect(() => {
    setFeedback(null);
    setAnswer("");
    setOverlayDismissed(false);
  }, [index]);

  if (!topic) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-sm text-zinc-600">Topic not found.</p>
        <Link className="btn-secondary mt-4 inline-flex" href="/calculus/practice">
          Back to practice
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

  const goToNext = () => {
    setFeedback(null);
    setAnswer("");
    setIndex((prev) => Math.min(displayProblems.length - 1, prev + 1));
  };

  const goToPrev = () => {
    setFeedback(null);
    setAnswer("");
    setIndex((prev) => Math.max(0, prev - 1));
  };

  // Extract first hint from explanation (first step)
  const getHint = () => {
    const match = current.explanation.match(/Step 1:\s*([^.]+\.)/);
    return match?.[1] || "Think about the rules that apply to this type of problem.";
  };

  const progressPct = Math.round((solvedCount / displayProblems.length) * 100);

  return (
    <div className="mx-auto w-full max-w-3xl px-0 pb-0 sm:px-6 sm:py-10">
      {/* Desktop topic header */}
      <div className="mb-5 hidden sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{topic.title}</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{topic.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">{solvedCount}/{displayProblems.length}</span>
          <Link className="btn-secondary" href={`/calculus/test/${topic.id}`}>Take test</Link>
        </div>
      </div>

      {/* Main card — full-bleed on mobile, rounded card on desktop */}
      <div className="flex min-h-[calc(100dvh-56px)] flex-col justify-end bg-white px-4 pb-1 pt-2 sm:min-h-[min(80vh,700px)] sm:rounded-2xl sm:border sm:border-slate-200 sm:px-8 sm:pb-6 sm:pt-6 sm:shadow-lg">

        {/* Progress bar + counter */}
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-400">
            {index + 1} / {displayProblems.length}
          </span>
        </div>

        {/* Question — fills available space, pushes input to bottom */}
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-5">
          <h2 className="text-center text-lg font-semibold leading-relaxed text-zinc-900 sm:text-2xl">
            <MathText text={current.prompt} />
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
          const renderSolutionSteps = (color: "emerald" | "amber") => {
            const parts = current.explanation.split(/Step \d+:\s*/);
            const steps = parts.filter(Boolean).map((step) =>
              step.replace(/\s*Final answer:.*$/, "").trim()
            );
            return steps.map((step, stepIdx) => (
              <div
                key={stepIdx}
                className={`flex gap-2 sm:gap-3 ${color === "emerald" ? "animate-step-in" : ""}`}
                style={color === "emerald" ? { animationDelay: `${0.25 + stepIdx * 0.1}s` } : undefined}
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold sm:h-6 sm:w-6 sm:text-xs ${color === "emerald" ? "bg-emerald-200 text-emerald-800" : "bg-amber-200 text-amber-800"}`}>
                  {stepIdx + 1}
                </span>
                <p className="flex-1 text-sm leading-relaxed text-zinc-700 sm:text-base">
                  <MathText text={step} />
                </p>
              </div>
            ));
          };

          const isDismissable = feedback?.type === "incorrect" && !feedback.showSolution;

          const correctOverlay = feedback?.type === "correct" ? (
            <div className="animate-correct-pop flex h-full flex-col border-t border-emerald-200 bg-emerald-50 p-3 pt-4 sm:p-5">
              <div className="flex items-center gap-2.5">
                <div className="animate-check-bounce flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white sm:h-10 sm:w-10 sm:text-base">
                  ✓
                </div>
                <p className="text-base font-bold text-emerald-800 sm:text-xl">Correct!</p>
              </div>

              <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto sm:mt-4 sm:space-y-2">
                {renderSolutionSteps("emerald")}
              </div>

              <div className="mt-3 rounded-lg bg-emerald-100 px-3 py-2 sm:mt-4 sm:rounded-xl sm:px-4 sm:py-3">
                <p className="text-sm font-semibold text-emerald-900 sm:text-base">
                  Answer:{" "}
                  <span className="text-base sm:text-lg">
                    <MathText
                      text={
                        current.explanation.match(/Final answer:\s*(.+?)\.?$/)?.[1] ||
                        `$${current.answer}$`
                      }
                    />
                  </span>
                </p>
              </div>

              <div className="mt-2 flex justify-end sm:mt-3">
                <VoteFeedback targetType="problem" targetId={current.id} />
              </div>

              <button
                type="button"
                onClick={goToNext}
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] sm:mt-3 sm:py-3 sm:text-base"
              >
                Next Question →
              </button>
            </div>
          ) : null;

          const incorrectOverlay = (feedback?.type === "incorrect" && !overlayDismissed) ? (
            <div className={`flex h-full flex-col border-t p-3 pt-4 sm:p-5 ${
              feedback.showSolution || feedback.attempts > 0
                ? "border-amber-200 bg-amber-50"
                : "border-blue-200 bg-blue-50"
            }`}>
              {feedback.attempts > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-white sm:h-10 sm:w-10 sm:text-base">
                    ✗
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-800 sm:text-lg">Not quite</p>
                    <p className="text-[11px] text-amber-700 sm:text-sm">
                      {feedback.showSolution && "Here's the solution:"}
                      {!feedback.showSolution && feedback.attempts === 1 && !feedback.hintUsed && "Give it another try!"}
                      {!feedback.showSolution && feedback.attempts === 1 && feedback.hintUsed && "Use the hint and try again!"}
                      {!feedback.showSolution && feedback.attempts === 2 && !feedback.hintUsed && "Need a hint?"}
                      {!feedback.showSolution && feedback.attempts >= 3 && ""}
                      {!feedback.showSolution && feedback.attempts === 2 && feedback.hintUsed && "Use the hint and try again!"}
                    </p>
                  </div>
                </div>
              )}

              {feedback.hintUsed && !feedback.showSolution && (
                <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-2 sm:mt-4 sm:p-4">
                  <p className="text-[11px] font-semibold text-blue-700 sm:text-sm">Hint</p>
                  <p className="mt-0.5 text-xs text-blue-900 sm:mt-1 sm:text-base">
                    <MathText text={getHint()} />
                  </p>
                </div>
              )}

              {feedback.showSolution && (
                <>
                  <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto sm:mt-4 sm:space-y-2">
                    {renderSolutionSteps("amber")}
                  </div>

                  <div className="mt-3 rounded-lg bg-amber-100 px-3 py-2 sm:mt-4 sm:rounded-xl sm:px-4 sm:py-3">
                    <p className="text-sm font-semibold text-amber-900 sm:text-base">
                      Answer:{" "}
                      <span className="text-base sm:text-lg">
                        <MathText
                          text={
                            current.explanation.match(/Final answer:\s*(.+?)\.?$/)?.[1] ||
                            `$${current.answer}$`
                          }
                        />
                      </span>
                    </p>
                  </div>

                  <div className="mt-2 flex justify-end sm:mt-3">
                    <VoteFeedback targetType="problem" targetId={current.id} />
                  </div>
                </>
              )}

              <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
                {!feedback.showSolution && !feedback.hintUsed && (
                  <button
                    type="button"
                    onClick={useHint}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 active:scale-95 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
                  >
                    Hint
                  </button>
                )}
                {!feedback.showSolution && (
                  <button
                    type="button"
                    onClick={showFullSolution}
                    className="rounded-lg border border-amber-200 bg-white px-2.5 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 active:scale-95 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
                  >
                    Solution
                  </button>
                )}
                {feedback.showSolution ? (
                  <button
                    type="button"
                    onClick={goToNext}
                    className="mt-1 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] sm:mt-2 sm:py-3 sm:text-base"
                  >
                    Next Question →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goToNext}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 active:scale-95 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
                  >
                    Skip
                  </button>
                )}
              </div>
            </div>
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
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-base font-medium text-zinc-900 transition hover:border-blue-300 hover:bg-blue-50 active:scale-[0.98] disabled:opacity-50 sm:px-5 sm:py-3.5 sm:text-lg"
                >
                  <MathText text={choice} />
                </button>
              ))}
              {overlay && !overlayDismissed && (
                <div className="relative overflow-hidden rounded-xl border border-slate-200">
                  {isDismissable && (
                    <button
                      type="button"
                      onClick={() => setOverlayDismissed(true)}
                      className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-sm text-zinc-400 shadow-sm backdrop-blur transition hover:bg-white hover:text-zinc-600"
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

        {/* All mastered */}
        {solvedCount >= displayProblems.length && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center sm:mt-6 sm:rounded-2xl sm:p-5">
            <p className="text-lg font-bold text-emerald-800">
              All {displayProblems.length} problems mastered!
            </p>
            <p className="mt-1 text-sm text-emerald-600">
              Shuffle for a fresh run.
            </p>
            <button
              type="button"
              onClick={shuffleAndRestart}
              className="mt-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-95"
            >
              Shuffle &amp; restart
            </button>
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
                  setFeedback(null);
                  setAnswer("");
                }}
              >
                Skip to unsolved
              </button>
            )}
          </div>
          <div className="justify-self-center rounded-full px-2 py-0.5 text-[11px] font-medium text-zinc-400 ring-1 ring-zinc-200/80">
            Q{canonicalQuestionNumber}
          </div>
          <Link className="justify-self-end rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-400 transition hover:bg-zinc-100 sm:text-sm" href="/calculus/practice">
            All topics
          </Link>
        </div>
      </div>
    </div>
  );
}
