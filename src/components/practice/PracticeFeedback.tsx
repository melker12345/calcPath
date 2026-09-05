"use client";

import { MathText } from "@/components/math-text";
import { VoteFeedback } from "@/components/vote-feedback";
import { normalizeAnswer } from "@/lib/answer-check";
import type { FeedbackState } from "./types";

/**
 * Shared pure utilities for parsing the conventional explanation format
 * ("Step 1: ... Step 2: ... Final answer: ...").
 * Used by PracticeFeedback internally and by GenericPracticeExperience, the calc PracticeTopicClient,
 * stats/la PracticeClients (and future generic pages) to avoid duplicating hint/solution/final-answer extraction logic across subjects.
 *
 * Clients must pass a getHint={() => ...} that extracts Step 1 (e.g. local fn or getDefaultHint(expl, answer)).
 * (Fixes prior calc regression where hardcoded generic msg was passed.)
 *
 * Resilience note (Migration Phase): When rendered inside GenericPracticeExperience's QuestionErrorBoundary,
 * even an edge-case failure in step parsing or a MathText fragment here is isolated per-question (clear skip UI).
 * All text still flows through MathText's own per-fragment boundaries.
 */
export function extractSteps(explanation: string): string[] {
  const parts = explanation.split(/Step \d+:\s*/).filter(Boolean);
  return parts.map((step) => step.replace(/\s*Final answer:.*$/, "").trim());
}

/**
 * Format a canonical answer for MathText. Plain English MCQ labels must not be
 * wrapped in $...$ — KaTeX math mode strips spaces and garbles prose.
 */
export function formatAnswerForDisplay(answer: string): string {
  if (!answer) return "";
  if (answer.includes("$")) return answer;

  const isProse =
    /[A-Za-z]\s+[A-Za-z]/.test(answer) ||
    (/^[A-Za-z][A-Za-z\s.,'();:-]+$/.test(answer) && !/^[0-9+\-*/=^x().\\]+$/.test(answer));

  return isProse ? answer : `$${answer}$`;
}

export function extractFinalAnswer(explanation: string, fallbackAnswer = ""): string {
  const match = explanation.match(/Final answer:\s*(.+?)\.?\s*$/);
  const extracted = match?.[1]?.trim();
  if (extracted) return formatAnswerForDisplay(extracted);
  return fallbackAnswer ? formatAnswerForDisplay(fallbackAnswer) : "";
}

/**
 * Loose canonical form for "does this math fragment spell the stored answer?".
 * Strips $-delimiters, LaTeX sizing, a leading "=" / "≈", whitespace, braces
 * and trailing punctuation, then lowercases — enough that "$15x^{2}$." and
 * "15x^2" collide, while a formula like "\frac{d}{dx}(x^n) = nx^{n-1}" stays
 * distinct from "15x^2".
 */
function simpleAnswerForm(fragment: string): string {
  return fragment
    .replace(/\$/g, "")
    .replace(/^\s*(?:=|\\approx|≈)\s*/, "")
    .replace(/\\left|\\right/g, "")
    .replace(/[\s{}]/g, "")
    .replace(/\.+$/, "")
    .toLowerCase();
}

/** Grader canonicalization, guarded — never let normalization throw in render. */
function tryNormalize(fragment: string): string | null {
  try {
    const normalized = normalizeAnswer(fragment.replace(/\$/g, "").replace(/^\s*(?:=|\\approx|≈)\s*/, ""));
    return normalized || null;
  } catch {
    return null;
  }
}

/**
 * Does a trailing `$math$` fragment of a hint reveal the question's answer?
 * Compared against every known spelling of the answer (stored answer + the
 * "Final answer:" tail of the explanation), via the answer-check
 * canonicalization when it applies and a simple formatting-stripped comparison
 * as backstop. With no known answer we conservatively say "yes" (strip), which
 * matches the old always-strip behavior.
 */
function revealsAnswer(mathContent: string, knownAnswers: (string | undefined)[]): boolean {
  const candidates = knownAnswers.filter((a): a is string => !!a && a.trim().length > 0);
  if (candidates.length === 0) return true;

  const simpleTarget = simpleAnswerForm(mathContent);
  const normTarget = tryNormalize(mathContent);
  return candidates.some((candidate) => {
    if (simpleTarget && simpleTarget === simpleAnswerForm(candidate)) return true;
    const normCandidate = tryNormalize(candidate);
    return !!normTarget && !!normCandidate && normTarget === normCandidate;
  });
}

const FALLBACK_HINT = "Think about which rules or definitions apply to this problem.";

function finishHint(hint: string): string {
  return hint.endsWith(".") || hint.endsWith("$") ? hint : `${hint}.`;
}

/**
 * Pull a useful hint from an explanation without giving away the final answer.
 * Supports both practice ("Step 1: ...") and diagnostic (short prose + math) formats.
 *
 * A trailing `$math$` fragment is only stripped when it actually spells the
 * answer (pass the question's stored `answer` for the most reliable check —
 * the "Final answer:" tail of the explanation is always used as well). A
 * trailing formula that is NOT the answer (e.g. the power rule) is kept, so
 * hints like "Power rule: $\frac{d}{dx}(x^n) = nx^{n-1}$." survive intact.
 * Callers must render the result with <MathText> so the LaTeX displays.
 */
export function extractHintFromExplanation(explanation: string, answer?: string): string {
  const finalFromExplanation = explanation.match(/Final answer:\s*(.+?)\.?\s*$/i)?.[1]?.trim();
  const knownAnswers = [answer, finalFromExplanation];

  const stepMatch = explanation.match(/Step 1:\s*([\s\S]+?)(?=Step \d+:|Final answer:|$)/i);
  if (stepMatch) {
    const step = stepMatch[1].replace(/\s*Final answer:.*$/i, "").trim();
    const trailingMath = step.match(/\s*\$([^$]+)\$\s*\.?\s*$/);
    if (trailingMath && revealsAnswer(trailingMath[1], knownAnswers)) {
      const withoutAnswer = step
        .slice(0, trailingMath.index)
        .replace(/[\s:,]+$/, "")
        .trim();
      // Step 1 that is nothing but the answer: fall through to the generic hint
      // rather than leak it (the old code returned the full step here).
      return withoutAnswer.length >= 8 ? finishHint(withoutAnswer) : FALLBACK_HINT;
    }
    if (step.length >= 8) return finishHint(step);
  }

  const trimmed = explanation.replace(/\s*Final answer:.*$/i, "").trim();
  const firstSentence = trimmed.match(/^([\s\S]+?\.)(?:\s|$)/)?.[1]?.trim();
  if (firstSentence) {
    const trailingMath = firstSentence.match(/:?\s*\$([^$]+)\$\s*\.?$/);
    let candidateHint = firstSentence;
    if (trailingMath && revealsAnswer(trailingMath[1], knownAnswers)) {
      const lead = firstSentence
        .slice(0, trailingMath.index)
        .replace(/[\s:,]+$/, "")
        .trim();
      candidateHint = lead ? `${lead}.` : "";
    }
    candidateHint = candidateHint.replace(/\.{2,}/g, ".").trim();
    if (candidateHint.length >= 8 && candidateHint !== ".") {
      return finishHint(candidateHint);
    }

    const colonLead = firstSentence.match(/^([^:$]+):/)?.[1]?.trim();
    if (colonLead && colonLead.length >= 8) {
      return finishHint(colonLead);
    }
  }

  return FALLBACK_HINT;
}

export function getDefaultHint(explanation: string, answer?: string): string {
  return extractHintFromExplanation(explanation, answer);
}

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
  /** Legacy overlay-dismissal flag; the compact incorrect banner ignores it. */
  overlayDismissed?: boolean;
  setOverlayDismissed?: (dismissed: boolean) => void;
  finalAnswer: string;
  /** When true on a correct feedback for the final question, shows "Congrats!" and "Finish" instead of "Correct!"/"Next Question" */
  isLastQuestion?: boolean;
  /** Attached to bug reports filed from this overlay (user's submissions, expected answer…). */
  reportContext?: Record<string, unknown>;
}

/**
 * Shared feedback UI for practice questions.
 *
 * Three states:
 * - correct        → full-area celebration card (steps + answer + Next), used as
 *                    an overlay by the input variant.
 * - incorrect      → COMPACT banner (icon + "Not quite" + Hint/Solution/Skip,
 *                    hint inline underneath when open). Deliberately small so the
 *                    caller can keep the math field / choices visible and editable
 *                    for a retry — never a full-area takeover.
 * - showSolution   → full-area amber solution card (steps + answer + Next).
 */
export function PracticeFeedback({
  feedback,
  current,
  onNext,
  onUseHint,
  onShowSolution,
  getHint,
  finalAnswer,
  isLastQuestion = false,
  reportContext,
}: PracticeFeedbackProps) {
  if (!feedback) return null;

  const isCorrect = feedback.type === "correct";

  // Internal step renderer (replaces the need for subjects to pass renderSteps).
  // Numbered chips only appear for real multi-step explanations — a single
  // unnumbered paragraph gets no stray "1" bullet.
  const renderInternalSteps = (color: "emerald" | "amber") => {
    const steps = extractSteps(current.explanation);
    const showChips = steps.length >= 2;

    return steps.map((step, stepIdx) => (
      <div
        key={stepIdx}
        className={`flex gap-2 sm:gap-3 ${color === "emerald" ? "animate-step-in" : ""}`}
      >
        {showChips && (
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold sm:h-6 sm:w-6 sm:text-xs ${
              color === "emerald"
                ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200"
                : "bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200"
            }`}
          >
            {stepIdx + 1}
          </span>
        )}
        <div className="flex-1 text-sm leading-relaxed text-zinc-700 sm:text-base dark:text-[var(--text-secondary)]">
          {/* All explanation step text routes through MathText for correct LaTeX (incl. $Q_1$, percentiles etc) + error resilience */}
          <MathText text={step} />
        </div>
      </div>
    ));
  };

  if (isCorrect) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="animate-correct-pop flex h-full flex-col border-t border-emerald-200 bg-emerald-50 p-3 pt-4 sm:p-5 dark:border-[var(--border)] dark:bg-[var(--surface-2)]"
      >
        <div className="flex items-center gap-2.5">
          <div className="animate-check-bounce flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white sm:h-10 sm:w-10 sm:text-base">✓</div>
          <p className="text-base font-bold text-emerald-800 sm:text-xl dark:text-emerald-300">{isLastQuestion ? "Congrats!" : "Correct!"}</p>
        </div>
        <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto sm:mt-4 sm:space-y-2">
          {renderInternalSteps("emerald")}
        </div>
        <div className="mt-3 rounded-lg bg-emerald-100 px-3 py-2 sm:mt-4 sm:rounded-xl sm:px-4 sm:py-3 dark:bg-emerald-400/10">
          <p className="text-sm font-semibold text-emerald-900 sm:text-base dark:text-emerald-200">
            Answer: <span className="text-base sm:text-lg">{/* final via MathText */}<MathText text={finalAnswer} /></span>
          </p>
        </div>
        <div className="mt-2 flex justify-end sm:mt-3">
          <VoteFeedback targetType="problem" targetId={current.id} reportContext={reportContext} />
        </div>
        <button
          type="button"
          onClick={onNext}
          className="mt-2 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] sm:mt-3 sm:py-3 sm:text-base"
        >
          {isLastQuestion ? "Finish" : "Next Question →"}
        </button>
      </div>
    );
  }

  // Full solution card (still a full-area takeover — it is dense with content
  // and the only remaining action is moving on).
  if (feedback.showSolution) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="flex h-full flex-col border-t border-amber-200 bg-amber-50 p-3 pt-4 sm:p-5 dark:border-[var(--border)] dark:bg-[var(--surface-2)]"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white sm:h-10 sm:w-10 sm:text-base dark:bg-amber-500">✗</div>
          <div>
            <p className="text-sm font-bold text-amber-800 sm:text-lg dark:text-amber-300">Not quite</p>
            <p className="text-[11px] text-amber-700 sm:text-sm dark:text-amber-400">Here&apos;s the solution:</p>
          </div>
        </div>

        <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto sm:mt-4 sm:space-y-2">
          {renderInternalSteps("amber")}
        </div>
        <div className="mt-3 rounded-lg bg-amber-100 px-3 py-2 sm:mt-4 sm:rounded-xl sm:px-4 sm:py-3 dark:bg-amber-400/10">
          <p className="text-sm font-semibold text-amber-900 sm:text-base dark:text-amber-200">
            Answer: <span className="text-base sm:text-lg">{/* final via MathText */}<MathText text={finalAnswer} /></span>
          </p>
        </div>
        <div className="mt-2 flex justify-end sm:mt-3">
          <VoteFeedback targetType="problem" targetId={current.id} reportContext={reportContext} />
        </div>
        <button
          type="button"
          onClick={onNext}
          className="mt-2 w-full rounded-xl bg-amber-600 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-700 active:scale-[0.98] sm:mt-3 sm:py-3 sm:text-base"
        >
          Next Question →
        </button>
      </div>
    );
  }

  // Compact incorrect banner: the input (with the learner's attempt) stays
  // visible and editable behind/below this, so they can compare and retry.
  const showHint = feedback.hintUsed;
  const message =
    feedback.attempts === 0
      ? null
      : feedback.hintUsed
      ? "Use the hint and try again!"
      : feedback.attempts >= 2
      ? "Need a hint?"
      : "Give it another try!";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-[var(--border)] dark:bg-[var(--surface-2)] sm:px-4 sm:py-2.5"
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        {feedback.attempts > 0 ? (
          <>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white" aria-hidden="true">
              ✗
            </span>
            <span className="text-sm font-bold text-amber-800 dark:text-amber-300">Not quite</span>
            {message && (
              <span className="hidden text-xs text-amber-700 md:inline dark:text-amber-400">{message}</span>
            )}
          </>
        ) : (
          <span className="text-sm font-bold text-amber-800 dark:text-amber-300">Stuck?</span>
        )}
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {!feedback.hintUsed && (
            <button
              type="button"
              onClick={onUseHint}
              className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 active:scale-95 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-blue-300 dark:hover:bg-blue-900/50"
            >
              Hint
            </button>
          )}
          <button
            type="button"
            onClick={onShowSolution}
            className="rounded-lg border border-amber-200 bg-white px-2.5 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 active:scale-95 dark:border-amber-800 dark:bg-[var(--surface)] dark:text-amber-300 dark:hover:bg-amber-900/50"
          >
            Solution
          </button>
          <button
            type="button"
            onClick={onNext}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 active:scale-95 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-[var(--text-muted)] dark:hover:bg-[var(--surface-2)]"
          >
            Skip
          </button>
        </div>
      </div>

      {showHint && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 sm:px-3 sm:py-2 dark:border-[var(--border)] dark:bg-[var(--surface)]">
          <p className="text-[11px] font-semibold text-blue-700 sm:text-xs dark:text-blue-300">Hint</p>
          <div className="mt-0.5 text-xs text-blue-900 sm:text-sm dark:text-blue-200">
            {/* Hint text (from expl) always via MathText so LaTeX renders */}
            <MathText text={getHint()} />
          </div>
        </div>
      )}
    </div>
  );
}
