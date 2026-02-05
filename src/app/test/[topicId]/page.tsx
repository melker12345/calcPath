"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { MathText } from "@/components/math-text";
import { MathInput } from "@/components/math-input";
import { problems, topics } from "@/lib/content";
import { isAnswerCorrect } from "@/lib/answer-check";
import { useProgress } from "@/components/progress-provider";
import { trackEvent } from "@/lib/analytics";

type Result = {
  problemId: string;
  prompt: string;
  expected: string;
  answer: string;
  correct: boolean;
};

export default function TopicTestPage() {
  const params = useParams<{ topicId: string }>();
  const topicId = params?.topicId ?? "";
  const topic = topics.find((t) => t.id === topicId);
  const { addAttempt } = useProgress();

  const allTopicProblems = useMemo(
    () => problems.filter((p) => p.topicId === topicId),
    [topicId],
  );

  const [idx, setIdx] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [startedAt] = useState(() => new Date().toISOString());
  const [mode, setMode] = useState<"full" | "mistakes">("full");
  const [testProblemIds, setTestProblemIds] = useState<string[]>([]);

  const testProblems = useMemo(() => {
    if (testProblemIds.length === 0) return [];
    const map = new Map(allTopicProblems.map((p) => [p.id, p]));
    return testProblemIds.map((id) => map.get(id)).filter(Boolean) as typeof allTopicProblems;
  }, [allTopicProblems, testProblemIds]);

  const current = testProblems[idx];
  const done = results.length === testProblems.length && testProblems.length > 0;
  const score = results.filter((r) => r.correct).length;

  if (!topic) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <p className="text-sm text-zinc-500">Topic not found.</p>
        <Link className="btn-secondary mt-4 inline-flex" href="/modules">
          Back to modules
        </Link>
      </div>
    );
  }

  if (allTopicProblems.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <p className="text-sm text-zinc-500">No test questions available.</p>
        <Link className="btn-secondary mt-4 inline-flex" href={`/modules/${topic.id}`}>
          Back to module
        </Link>
      </div>
    );
  }

  // Initialize test ids once per topic.
  if (testProblemIds.length === 0) {
    const ids = allTopicProblems.map((p) => p.id);
    // Shuffle deterministically-ish per load using startedAt.
    let seed = 0;
    for (let i = 0; i < startedAt.length; i += 1) seed = (seed * 31 + startedAt.charCodeAt(i)) >>> 0;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 2 ** 32;
    };
    const shuffled = [...ids].sort(() => rand() - 0.5);
    setTestProblemIds(shuffled.slice(0, Math.min(20, shuffled.length)));
  }

  if (done) {
    const wrongIds = results.filter((r) => !r.correct).map((r) => r.problemId);
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">{topic.title} test</h1>
            <p className="text-sm text-zinc-500">
              You completed {testProblems.length} questions.
            </p>
          </div>
          <Link className="btn-secondary" href={`/modules/${topic.id}`}>
            Back to module
          </Link>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-zinc-500">Your score</p>
              <p className="text-4xl font-bold">
                {score}/{testProblems.length}
              </p>
            </div>
            <button
              className="btn-primary"
              type="button"
              onClick={() => {
                trackEvent("test_retake", { topicId, startedAt });
                setIdx(0);
                setResults([]);
                setCurrentAnswer("");
                setMode("full");
                // new shuffle for retake
                setTestProblemIds([]);
              }}
            >
              Retake test
            </button>
          </div>

          {wrongIds.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="btn-secondary"
                type="button"
                onClick={() => {
                  trackEvent("test_review_mistakes", { topicId, startedAt });
                  setIdx(0);
                  setResults([]);
                  setCurrentAnswer("");
                  setMode("mistakes");
                  setTestProblemIds(wrongIds);
                }}
              >
                Review mistakes ({wrongIds.length})
              </button>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {results.map((r, i) => (
              <div
                key={r.problemId}
                className={`rounded-xl border p-4 ${
                  r.correct
                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                    : "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20"
                }`}
              >
                <div className="text-xs font-semibold text-zinc-500">
                  Question {i + 1}
                </div>
                <div className="mt-2 text-lg font-semibold">
                  <MathText text={r.prompt} />
                </div>
                <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
                  <div>
                    <span className="font-semibold">Your answer:</span>{" "}
                    <span className="font-mono">{r.answer || "—"}</span>
                  </div>
                  <div className="mt-1">
                    <span className="font-semibold">Expected:</span>{" "}
                    <span className="font-mono">{r.expected}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const submit = (overrideAnswer?: string) => {
    if (!current) return;
    const answer = (overrideAnswer ?? currentAnswer).trim();
    const correct = isAnswerCorrect(answer, current.answer);
    const nextResult: Result = {
      problemId: current.id,
      prompt: current.prompt,
      expected: current.answer,
      answer,
      correct,
    };

    setResults((prev) => [...prev, nextResult]);

    addAttempt({
      problemId: current.id,
      topicId: current.topicId,
      correct,
      createdAt: new Date().toISOString(),
    });

    trackEvent("test_answered", { topicId, correct });

    setCurrentAnswer("");
    setIdx((prev) => Math.min(testProblems.length - 1, prev + 1));
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{topic.title} test</h1>
          <p className="text-sm text-zinc-500">
            {mode === "mistakes"
              ? "Mistake review: re-answer the ones you missed."
              : "One attempt per question. Your score is shown at the end."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <span>
            {results.length}/{testProblems.length} answered
          </span>
          <Link className="btn-secondary" href={`/practice/${topic.id}`}>
            Switch to practice
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="py-2 text-center">
          <div className="text-sm text-zinc-500">
            Question {idx + 1} of {testProblems.length}
          </div>
          <h2 className="mt-4 text-2xl font-semibold leading-snug">
            <MathText text={current.prompt} />
          </h2>
        </div>

        {current.type === "mcq" ? (
          <div className="mt-6 flex flex-col gap-3">
            {current.choices?.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => {
                  // For MCQ, submit immediately with the clicked choice.
                  submit(choice);
                }}
                className="rounded-lg bg-white px-6 py-4 text-left text-lg font-medium shadow-sm transition hover:bg-emerald-50 hover:shadow-md active:scale-95 dark:bg-zinc-800 dark:hover:bg-emerald-950"
              >
                {choice}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <MathInput
              value={currentAnswer}
              onChange={setCurrentAnswer}
              onSubmit={submit}
            />
            <button
              type="button"
              className="btn-primary w-full"
              onClick={() => submit()}
            >
              Submit answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

