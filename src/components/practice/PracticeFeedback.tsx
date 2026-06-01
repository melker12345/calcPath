"use client";

import { MathText } from "@/components/math-text";
import { VoteFeedback } from "@/components/vote-feedback";
import type { FeedbackState } from "./types";

interface PracticeFeedbackProps {
  feedback: FeedbackState;
  current: {
    id: string;
    explanation: string;
    answer: string;
  };
  onNext: () => void;
  onUseHint: () => void;
  onShowSolution?: () => void;
  getHint: () => string;
  overlayDismissed: boolean;
  setOverlayDismissed: (dismissed: boolean) => void;
  finalAnswer: string;
}

/**
 * Shared feedback overlay for practice questions.
 * Handles both "Correct!" and "Not quite / Solution" states.
 */
export function PracticeFeedback({
  feedback,
  current,
  onNext,
  onUseHint,
  onShowSolution,
  getHint,
  overlayDismissed,
  setOverlayDismissed,
  finalAnswer,
}: PracticeFeedbackProps) {
  if (!feedback) return null;

  const isCorrect = feedback.type === "correct";
  const isIncorrect = feedback.type === "incorrect" && !overlayDismissed;

  // Internal step renderer (replaces the need for subjects to pass renderSteps)
  const renderInternalSteps = (color: "emerald" | "amber") => {
    const parts = current.explanation.split(/Step \d+:\s*/).filter(Boolean);
    const steps = parts.map((step) =>
      step.replace(/\s*Final answer:.*$/, "").trim()
    );

    return steps.map((step, stepIdx) => (
      <div
        key={stepIdx}
        className={`flex gap-2 sm:gap-3 ${color === "emerald" ? "animate-step-in" : ""}`}
      >
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold sm:h-6 sm:w-6 sm:text-xs ${
            color === "emerald"
              ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200"
              : "bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200"
          }`}
        >
          {stepIdx + 1}
        </span>
        <div className="flex-1 text-sm leading-relaxed text-zinc-700 sm:text-base dark:text-zinc-300">
          <MathText text={step} />
        </div>
      </div>
    ));
  };

  if (isCorrect) {
    return (
      <div className="animate-correct-pop flex h-full flex-col border-t border-emerald-200 bg-emerald-50 p-3 pt-4 sm:p-5 dark:border-emerald-800 dark:bg-emerald-950/40">
        <div className="flex items-center gap-2.5">
          <div className="animate-check-bounce flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white sm:h-10 sm:w-10 sm:text-base">✓</div>
          <p className="text-base font-bold text-emerald-800 sm:text-xl dark:text-emerald-300">Correct!</p>
        </div>
        <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto sm:mt-4 sm:space-y-2">
          {renderInternalSteps("emerald")}
        </div>
        <div className="mt-3 rounded-lg bg-emerald-100 px-3 py-2 sm:mt-4 sm:rounded-xl sm:px-4 sm:py-3 dark:bg-emerald-900/50">
          <p className="text-sm font-semibold text-emerald-900 sm:text-base dark:text-emerald-200">
            Answer: <span className="text-base sm:text-lg"><MathText text={finalAnswer} /></span>
          </p>
        </div>
        <div className="mt-2 flex justify-end sm:mt-3">
          <VoteFeedback targetType="problem" targetId={current.id} />
        </div>
        <button
          type="button"
          onClick={onNext}
          className="mt-2 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] sm:mt-3 sm:py-3 sm:text-base"
        >
          Next Question →
        </button>
      </div>
    );
  }

  if (isIncorrect) {
    const showSolution = feedback.showSolution || feedback.attempts > 0;
    const showHint = feedback.hintUsed && !feedback.showSolution;

    return (
      <div className={`flex h-full flex-col border-t p-3 pt-4 sm:p-5 ${
        showSolution 
          ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40" 
          : "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40"
      }`}>
        {feedback.attempts > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-white sm:h-10 sm:w-10 sm:text-base">✗</div>
            <div>
              <p className="text-sm font-bold text-amber-800 sm:text-lg dark:text-amber-300">Not quite</p>
              <p className="text-[11px] text-amber-700 sm:text-sm dark:text-amber-400">
                {feedback.showSolution && "Here's the solution:"}
                {!feedback.showSolution && feedback.attempts === 1 && !feedback.hintUsed && "Give it another try!"}
                {!feedback.showSolution && feedback.attempts === 1 && feedback.hintUsed && "Use the hint and try again!"}
                {!feedback.showSolution && feedback.attempts === 2 && !feedback.hintUsed && "Need a hint?"}
                {!feedback.showSolution && feedback.attempts === 2 && feedback.hintUsed && "Use the hint and try again!"}
              </p>
            </div>
          </div>
        )}

        {showHint && (
          <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-2 sm:mt-4 sm:p-4 dark:border-blue-800 dark:bg-blue-950/40">
            <p className="text-[11px] font-semibold text-blue-700 sm:text-sm dark:text-blue-300">Hint</p>
            <div className="mt-0.5 text-xs text-blue-900 sm:mt-1 sm:text-base dark:text-blue-200">
              <MathText text={getHint()} />
            </div>
          </div>
        )}

        {feedback.showSolution && (
          <>
            <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto sm:mt-4 sm:space-y-2">
              {renderInternalSteps("amber")}
            </div>
            <div className="mt-3 rounded-lg bg-amber-100 px-3 py-2 sm:mt-4 sm:rounded-xl sm:px-4 sm:py-3 dark:bg-amber-900/50">
              <p className="text-sm font-semibold text-amber-900 sm:text-base dark:text-amber-200">
                Answer: <span className="text-base sm:text-lg"><MathText text={finalAnswer} /></span>
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
              onClick={onUseHint}
              className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 active:scale-95 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50"
            >
              Hint
            </button>
          )}
          {!feedback.showSolution && (
            <button
              type="button"
              onClick={onShowSolution}
              className="rounded-lg border border-amber-200 bg-white px-2.5 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 active:scale-95 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50"
            >
              Solution
            </button>
          )}
          {feedback.showSolution ? (
            <button
              type="button"
              onClick={onNext}
              className="mt-1 w-full rounded-xl bg-amber-600 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-700 active:scale-[0.98] sm:mt-2 sm:py-3 sm:text-base"
            >
              Next Question →
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 active:scale-95 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
