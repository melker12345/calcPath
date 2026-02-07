"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MathText } from "@/components/math-text";
import { MathInput } from "@/components/math-input";
import { useProgress } from "@/components/progress-provider";
import { problems, topics } from "@/lib/content";
import { trackEvent } from "@/lib/analytics";
import { isAnswerCorrectAsync } from "@/lib/answer-check";
import { PaywallGate } from "@/components/paywall-gate";

/** Detect variables and functions in a question prompt for suggested keys */
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

  // Check for common variables
  if (/\bx\b/.test(prompt)) context.hasVariable.push("x");
  if (/\by\b/.test(prompt)) context.hasVariable.push("y");
  if (/\bt\b/.test(prompt)) context.hasVariable.push("t");
  if (/\bn\b/.test(prompt)) context.hasVariable.push("n");

  // Check for trig functions
  if (/\\?(sin|cos|tan|sec|csc|cot)/i.test(prompt)) context.hasTrig = true;

  // Check for exponential
  if (/e\^|\\exp/i.test(prompt)) context.hasExp = true;

  // Check for natural log
  if (/\\ln|\\log/i.test(prompt)) context.hasLn = true;

  // Check for pi
  if (/\\pi|π/i.test(prompt)) context.hasPi = true;

  return context;
}

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
  const [solvedCount, setSolvedCount] = useState(0);

  const current = topicProblems[index];

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
    // Only count practice problems (not test questions)
    const count = progress.completedProblemIds.filter((id) =>
      topicProblems.some((problem) => problem.id === id)
    ).length;
    setSolvedCount(count);
  }, [progress.completedProblemIds, topicProblems]);

  // Reset feedback when changing questions
  useEffect(() => {
    setFeedback(null);
    setAnswer("");
  }, [index]);

  if (!topic) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <p className="text-sm text-zinc-600">Topic not found.</p>
        <Link className="btn-secondary mt-4 inline-flex" href="/practice">
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
    if (feedback?.type !== "incorrect") return;
    
    // Track hint usage as an incorrect attempt
    addAttempt({
      problemId: current.id,
      topicId: current.topicId,
      correct: false,
      createdAt: new Date().toISOString(),
    });

    trackEvent("hint_used", { topicId: current.topicId });

    setFeedback({
      ...feedback,
      hintUsed: true,
    });
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
    setIndex((prev) => Math.min(topicProblems.length - 1, prev + 1));
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

  return (
    <PaywallGate feature="Practice">
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">{topic.title}</h1>
          <p className="text-sm text-zinc-600">{topic.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-sm text-zinc-600">
            {solvedCount}/{topicProblems.length} mastered
          </div>
          <Link className="btn-secondary" href={`/test/${topic.id}`}>
            Take test
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border-2 border-orange-100 bg-white p-6 shadow-lg">
        <div className="py-2 text-center">
          <div className="text-sm text-zinc-600">
            Problem {index + 1} of {topicProblems.length}
          </div>
          <h2 className="mt-4 text-2xl font-semibold leading-snug text-zinc-900">
            <MathText text={current.prompt} />
          </h2>
        </div>

        {current.type === "mcq" ? (
          <div className="mt-4 flex flex-col gap-3">
            {current.choices?.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => submitAnswer(choice)}
                disabled={feedback?.type === "correct"}
                className="rounded-2xl border-2 border-orange-100 bg-white px-6 py-4 text-left text-lg font-medium text-zinc-900 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:shadow-md active:scale-95 disabled:opacity-50"
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

        {/* Correct answer feedback */}
        {feedback?.type === "correct" && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-200 text-xl">
                ✓
              </div>
              <p className="text-xl font-bold text-emerald-800">
                Correct! Great job.
              </p>
            </div>
            
            {/* Step-by-step explanation */}
            <div className="mt-4 space-y-2">
              {(() => {
                const parts = current.explanation.split(/Step \d+:\s*/);
                const steps = parts.filter(Boolean).map((step) => 
                  step.replace(/\s*Final answer:.*$/, "").trim()
                );
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

            {/* Final answer */}
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
              Next Question →
            </button>
          </div>
        )}

        {/* Incorrect answer feedback */}
        {feedback?.type === "incorrect" && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-200 text-xl">
                ✗
              </div>
              <div>
                <p className="text-lg font-bold text-amber-800">
                  Not quite right
                </p>
                <p className="text-sm text-amber-700">
                  {feedback.attempts === 1 && "Give it another try!"}
                  {feedback.attempts === 2 && !feedback.hintUsed && "Need a hint?"}
                  {feedback.attempts >= 3 && "Here's the solution:"}
                  {feedback.hintUsed && !feedback.showSolution && "Use the hint and try again!"}
                </p>
              </div>
            </div>

            {/* Hint display */}
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

            {/* Full solution (after 3 attempts or show solution clicked) */}
            {feedback.showSolution && (
              <>
                <div className="mt-4 space-y-2">
                  {(() => {
                    const parts = current.explanation.split(/Step \d+:\s*/);
                    const steps = parts.filter(Boolean).map((step) => 
                      step.replace(/\s*Final answer:.*$/, "").trim()
                    );
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
                  Next Question →
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
                <button
                  type="button"
                  onClick={goToNext}
                  className="rounded-xl border-2 border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 active:scale-95"
                >
                  Skip →
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={goToPrev}
            disabled={index === 0}
          >
            ← Previous
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={goToNext}
            disabled={index === topicProblems.length - 1}
          >
            Next →
          </button>
          <Link className="btn-secondary" href="/practice">
            Back to topics
          </Link>
        </div>
      </div>
    </div>
    </PaywallGate>
  );
}
