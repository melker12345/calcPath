"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MathText } from "@/components/math-text";
import { MathInput } from "@/components/math-input";
import { isAnswerCorrectAsync } from "@/lib/answer-check";
import { problems } from "@/lib/content";
import type { Problem } from "@/lib/content";

/** Hand-picked problems: 1 per topic, mix of MCQ & numeric, easy–medium */
const FREE_IDS = [
  "limits-4",   // easy numeric – factor & cancel limit (answer: 8)
  "limits-26",  // medium MCQ  – type of discontinuity
  "app-9",      // easy MCQ    – increasing / decreasing
  "series-1",   // easy MCQ    – geometric series convergence
  "de-14",      // easy MCQ    – verify a DE solution
];

const freeProblems: Problem[] = FREE_IDS.map(
  (id) => problems.find((p) => p.id === id)!,
);

const TOPIC_LABELS: Record<string, string> = {
  limits: "Limits",
  applications: "Applications",
  series: "Series",
  "differential-equations": "Diff. Equations",
};

/** Detect variables/functions in a question prompt for suggested keys */
function detectQuestionContext(prompt: string) {
  const context: {
    hasVariable: string[];
    hasTrig: boolean;
    hasExp: boolean;
    hasLn: boolean;
    hasPi: boolean;
  } = {
    hasVariable: [],
    hasTrig: false,
    hasExp: false,
    hasLn: false,
    hasPi: false,
  };
  if (/\bx\b/.test(prompt)) context.hasVariable.push("x");
  if (/\by\b/.test(prompt)) context.hasVariable.push("y");
  if (/\bt\b/.test(prompt)) context.hasVariable.push("t");
  if (/\bn\b/.test(prompt)) context.hasVariable.push("n");
  if (/\\?(sin|cos|tan|sec|csc|cot)/i.test(prompt)) context.hasTrig = true;
  if (/e\^|\\exp/i.test(prompt)) context.hasExp = true;
  if (/\\ln|\\log/i.test(prompt)) context.hasLn = true;
  if (/\\pi|π/i.test(prompt)) context.hasPi = true;
  return context;
}

type FeedbackState =
  | null
  | { type: "correct" }
  | { type: "incorrect"; attempts: number; hintUsed: boolean; showSolution: boolean };

export default function TryPage() {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = freeProblems[index];

  const questionContext = useMemo(() => {
    if (!current) return undefined;
    return detectQuestionContext(current.prompt);
  }, [current]);

  const getHint = () => {
    const match = current.explanation.match(/Step 1:\s*([^.]+\.)/);
    return match?.[1] || "Think about the rules that apply to this type of problem.";
  };

  const submitAnswer = async (value: string) => {
    if (!current) return;
    const isCorrect = await isAnswerCorrectAsync(value, current.answer);
    const currentAttempts = feedback?.type === "incorrect" ? feedback.attempts : 0;
    const hintWasUsed = feedback?.type === "incorrect" ? feedback.hintUsed : false;

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setFeedback({ type: "correct" });
    } else {
      const newAttempts = currentAttempts + 1;
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
    if (feedback?.type !== "incorrect") return;
    setFeedback({ ...feedback, hintUsed: true });
  };

  const showFullSolution = () => {
    if (feedback?.type !== "incorrect") return;
    setFeedback({ ...feedback, showSolution: true });
  };

  const goToNext = () => {
    if (index >= freeProblems.length - 1) {
      setFinished(true);
      return;
    }
    setFeedback(null);
    setAnswer("");
    setIndex((prev) => prev + 1);
  };

  /* ── Completion screen ── */
  if (finished) {
    const pct = Math.round((correctCount / freeProblems.length) * 100);
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
        <div className="rounded-3xl border-2 border-orange-100 bg-white p-6 text-center shadow-xl sm:p-10">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-rose-100 text-4xl">
            {pct >= 80 ? "🏆" : pct >= 50 ? "💪" : "📚"}
          </div>

          <h1 className="text-2xl font-extrabold text-orange-950 sm:text-3xl">
            {pct >= 80
              ? "Amazing work!"
              : pct >= 50
                ? "Nice effort!"
                : "Great start!"}
          </h1>

          <p className="mt-2 text-lg text-orange-800">
            You got <span className="font-bold">{correctCount}/{freeProblems.length}</span> correct
          </p>

          <div className="mx-auto mt-6 h-3 w-48 overflow-hidden rounded-full bg-orange-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="mt-8 rounded-2xl bg-gradient-to-br from-orange-50 to-rose-50 p-5 sm:p-6">
            <p className="text-base font-semibold text-orange-900 sm:text-lg">
              That was just 5 of <span className="font-extrabold">240+</span> problems
            </p>
            <p className="mt-1 text-sm text-orange-700">
              Unlock all practice problems, tests, flashcards, progress tracking, and more.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-orange-200 transition hover:scale-105 hover:shadow-2xl"
            >
              Sign up free
            </Link>
            <Link
              href="/calculus/modules"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-orange-800 shadow-lg transition hover:shadow-xl"
            >
              Explore modules
            </Link>
          </div>

          <p className="mt-6 text-xs text-orange-600">
            Free tier includes all modules + 5 preview problems per topic. Pro unlocks everything for $8/mo.
          </p>
        </div>
      </div>
    );
  }

  /* ── Main practice view ── */
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Hero header – first question only */}
      {index === 0 && !feedback && (
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-md">
            <span className="text-lg">🎯</span>
            <span className="text-xs font-semibold text-orange-800 sm:text-sm">
              No sign-up required
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-orange-950 sm:text-3xl md:text-4xl">
            Try 5 free calculus problems
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-orange-700 sm:text-base">
            Get instant feedback and step-by-step solutions. See what CalcPath is all about.
          </p>
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-zinc-600">
          <span>
            Question {index + 1} of {freeProblems.length}
          </span>
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
            {TOPIC_LABELS[current.topicId] || current.topicId}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-orange-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all duration-500"
            style={{ width: `${((index + (feedback?.type === "correct" ? 1 : 0)) / freeProblems.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Problem card */}
      <div className="rounded-2xl border-2 border-orange-100 bg-white p-4 shadow-lg sm:rounded-3xl sm:p-6">
        <div className="py-2 text-center">
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
            current.difficulty === "easy"
              ? "bg-emerald-100 text-emerald-800"
              : current.difficulty === "medium"
                ? "bg-amber-100 text-amber-800"
                : "bg-red-100 text-red-800"
          }`}>
            {current.difficulty}
          </span>
          <h2 className="mt-4 text-lg font-semibold leading-snug text-zinc-900 sm:text-2xl">
            <MathText text={current.prompt} />
          </h2>
        </div>

        {/* MCQ choices */}
        {current.type === "mcq" ? (
          <div className="mt-4 flex flex-col gap-3">
            {current.choices?.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => submitAnswer(choice)}
                disabled={feedback?.type === "correct"}
                className="rounded-xl border-2 border-orange-100 bg-white px-4 py-3 text-left text-base font-medium text-zinc-900 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:shadow-md active:scale-95 disabled:opacity-50 sm:rounded-2xl sm:px-6 sm:py-4 sm:text-lg"
              >
                {choice}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <MathInput
              value={answer}
              onChange={setAnswer}
              onSubmit={() => submitAnswer(answer)}
              questionContext={questionContext}
            />
          </div>
        )}

        {/* ── Correct feedback ── */}
        {feedback?.type === "correct" && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm sm:rounded-2xl sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-200 text-xl">
                ✓
              </div>
              <p className="text-xl font-bold text-emerald-800">Correct!</p>
            </div>

            <div className="mt-4 space-y-2">
              {(() => {
                const parts = current.explanation.split(/Step \d+:\s*/);
                const steps = parts
                  .filter(Boolean)
                  .map((step) => step.replace(/\s*Final answer:.*$/, "").trim());
                return steps.map((step, stepIdx) => (
                  <div key={stepIdx} className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-800">
                      {stepIdx + 1}
                    </span>
                    <p className="flex-1 text-base leading-relaxed text-zinc-700">
                      <MathText text={step} />
                    </p>
                  </div>
                ));
              })()}
            </div>

            <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-100 px-4 py-3">
              <p className="text-base font-semibold text-emerald-900">
                Final Answer:{" "}
                <span className="text-lg">
                  <MathText
                    text={
                      current.explanation.match(/Final answer:\s*(.+?)\.?$/)?.[1] ||
                      `$${current.answer}$`
                    }
                  />
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={goToNext}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-lg font-bold text-white shadow-md transition hover:shadow-lg active:scale-95"
            >
              {index < freeProblems.length - 1 ? "Next Question →" : "See Results →"}
            </button>
          </div>
        )}

        {/* ── Incorrect feedback ── */}
        {feedback?.type === "incorrect" && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm sm:rounded-2xl sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-200 text-xl">
                ✗
              </div>
              <div>
                <p className="text-lg font-bold text-amber-800">Not quite right</p>
                <p className="text-sm text-amber-700">
                  {feedback.attempts === 1 && "Give it another try!"}
                  {feedback.attempts === 2 && !feedback.hintUsed && "Need a hint?"}
                  {feedback.attempts >= 3 && "Here's the solution:"}
                  {feedback.hintUsed && !feedback.showSolution && "Use the hint and try again!"}
                </p>
              </div>
            </div>

            {/* Hint */}
            {feedback.hintUsed && !feedback.showSolution && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
                  <span>💡</span> Hint
                </div>
                <p className="mt-2 text-base text-blue-900">
                  <MathText text={getHint()} />
                </p>
              </div>
            )}

            {/* Full solution */}
            {feedback.showSolution && (
              <>
                <div className="mt-4 space-y-2">
                  {(() => {
                    const parts = current.explanation.split(/Step \d+:\s*/);
                    const steps = parts
                      .filter(Boolean)
                      .map((step) => step.replace(/\s*Final answer:.*$/, "").trim());
                    return steps.map((step, stepIdx) => (
                      <div key={stepIdx} className="flex gap-3">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-800">
                          {stepIdx + 1}
                        </span>
                        <p className="flex-1 text-base leading-relaxed text-zinc-700">
                          <MathText text={step} />
                        </p>
                      </div>
                    ));
                  })()}
                </div>

                <div className="mt-4 rounded-xl border border-amber-300 bg-amber-100 px-4 py-3">
                  <p className="text-base font-semibold text-amber-900">
                    Correct Answer:{" "}
                    <span className="text-lg">
                      <MathText
                        text={
                          current.explanation.match(/Final answer:\s*(.+?)\.?$/)?.[1] ||
                          `$${current.answer}$`
                        }
                      />
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={goToNext}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-lg font-bold text-white shadow-md transition hover:shadow-lg active:scale-95"
                >
                  {index < freeProblems.length - 1 ? "Next Question →" : "See Results →"}
                </button>
              </>
            )}

            {/* Action buttons when solution not shown */}
            {!feedback.showSolution && (
              <div className="mt-4 flex flex-wrap gap-2">
                {!feedback.hintUsed && (
                  <button
                    type="button"
                    onClick={useHint}
                    className="flex items-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 active:scale-95"
                  >
                    💡 Get Hint
                  </button>
                )}
                <button
                  type="button"
                  onClick={showFullSolution}
                  className="rounded-xl border-2 border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 active:scale-95"
                >
                  Show Solution
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Subtle upsell below the card */}
      <p className="mt-6 text-center text-xs text-orange-600">
        CalcPath has <span className="font-semibold">240+ problems</span> across 6 topics with step-by-step solutions.{" "}
        <Link href="/pricing" className="underline hover:text-orange-800">
          See plans →
        </Link>
      </p>
    </div>
  );
}
