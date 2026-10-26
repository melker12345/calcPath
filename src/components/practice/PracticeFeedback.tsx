"use client";

import type { FeedbackState } from "./types";

// The explanation parsers live in src/lib/practice-text.ts (pure, shared
// with the server, which pre-renders their output); re-exported for callers.
export {
  extractSteps,
  extractFinalAnswer,
  extractHintFromExplanation,
  formatAnswerForDisplay,
  getDefaultHint,
} from "@/lib/practice-text";

interface PracticeFeedbackProps {
  feedback: FeedbackState;
  /** Worked steps, the answer line and the hint, already typeset on the server. */
  stepsHtml: string[];
  finalAnswerHtml: string;
  hintHtml: string;
  onNext: () => void;
  onUseHint: () => void;
  onShowSolution?: () => void;
  /** On a correct answer to the final question the button reads "Finish". */
  isLastQuestion?: boolean;
  /** Rendered inside the answer panel as its header row (no outer border). */
  embedded?: boolean;
}

/**
 * Feedback for a graded practice question. Three states:
 *
 * - correct       → a card with the worked steps, the answer and Next. It
 *                   takes the place of the input.
 * - showSolution  → the same card, headed "Not quite", after the learner gave
 *                   up or ran out of attempts. It also replaces the input.
 * - incorrect     → a compact banner with Hint / Solution / Skip, kept small
 *                   so the input stays visible and editable for a retry.
 *
 * All mathematics arrives pre-rendered from the server (render-practice.ts).
 */
export function PracticeFeedback({
  feedback,
  stepsHtml,
  finalAnswerHtml,
  hintHtml,
  onNext,
  onUseHint,
  onShowSolution,
  isLastQuestion = false,
  embedded = false,
}: PracticeFeedbackProps) {
  if (!feedback) return null;

  const isCorrect = feedback.type === "correct";

  // Numbered steps only for real multi-step explanations; a single paragraph
  // gets no stray "1".
  const renderSteps = () => {
    const numbered = stepsHtml.length >= 2;
    return (
      <ol className={numbered ? "list-decimal space-y-2 pl-6" : "list-none space-y-2 pl-0"}>
        {stepsHtml.map((html, i) => (
          <li key={i} className="text-sm leading-relaxed theme-text sm:text-base" dangerouslySetInnerHTML={{ __html: html }} />
        ))}
      </ol>
    );
  };

  if (isCorrect || feedback.showSolution) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="flex h-full min-h-0 flex-col border theme-border bg-[var(--surface)]"
      >
        <p className="min-h-[41px] border-b theme-border px-3 py-2 text-sm font-semibold theme-text">
          {isCorrect
            ? feedback.afterSolution
              ? "Correct, but the solution was already shown, so this one is not marked solved."
              : "Correct"
            : "Not quite. Here is the solution."}
        </p>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-5">
          {renderSteps()}
          <p className="mt-4 border-t theme-border pt-3 text-sm theme-text sm:text-base">
            <span className="font-semibold">Answer: </span>
            <span dangerouslySetInnerHTML={{ __html: finalAnswerHtml }} />
          </p>
        </div>
        <div className="border-t theme-border px-3 py-3">
          <button type="button" onClick={onNext} className="btn-primary w-full sm:w-auto">
            {isCorrect && isLastQuestion ? "Finish" : "Next question"}
          </button>
        </div>
      </div>
    );
  }

  const showHint = feedback.hintUsed;
  const heading = feedback.attempts > 0 ? "Not quite" : "Stuck?";
  const message =
    feedback.attempts === 0
      ? null
      : feedback.hintUsed
      ? "Use the hint and try again."
      : feedback.attempts >= 2
      ? "Need a hint?"
      : "Try again.";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`flex min-h-[41px] flex-col justify-center gap-2 bg-[var(--surface-2)] px-3 py-2 sm:px-4 ${embedded ? "border-b theme-border" : "border theme-border"}`}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <span className="text-sm font-semibold theme-text">{heading}</span>
        {message && <span className="text-sm theme-text-secondary">{message}</span>}
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {!feedback.hintUsed && (
            <button type="button" onClick={onUseHint} className="border theme-border bg-[var(--surface)] px-2.5 py-1 text-xs font-medium theme-text">
              Hint
            </button>
          )}
          <button type="button" onClick={onShowSolution} className="border theme-border bg-[var(--surface)] px-2.5 py-1 text-xs font-medium theme-text">
            Solution
          </button>
          <button type="button" onClick={onNext} className="border theme-border bg-[var(--surface)] px-2.5 py-1 text-xs font-medium theme-text-muted">
            Skip
          </button>
        </div>
      </div>

      {showHint && (
        <div className="border-t theme-border pt-2">
          <p className="text-xs font-semibold theme-text-muted">Hint</p>
          <div className="mt-0.5 text-sm theme-text" dangerouslySetInnerHTML={{ __html: hintHtml }} />
        </div>
      )}
    </div>
  );
}
