"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MathText } from "@/components/math-text";
import { MathInput } from "@/components/math-input";
import { useProgress } from "@/components/progress-provider";
import { problems, topics } from "@/lib/content";
import { trackEvent } from "@/lib/analytics";

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
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solvedCount, setSolvedCount] = useState(0);

  useEffect(() => {
    if (!topicId) return;
    trackEvent("view_practice_topic", { topicId });
  }, [topicId]);

  useEffect(() => {
    // Calculate solved count on client only to avoid hydration mismatch
    const count = progress.completedProblemIds.filter((id) =>
      topicProblems.some((problem) => problem.id === id),
    ).length;
    setSolvedCount(count);
  }, [progress.completedProblemIds, topicProblems]);

  if (!topic) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <p className="text-sm text-zinc-500">Topic not found.</p>
        <Link className="btn-secondary mt-4 inline-flex" href="/practice">
          Back to practice
        </Link>
      </div>
    );
  }

  const current = topicProblems[index];

  const submitAnswer = (value: string) => {
    if (!current) return;
    const normalized = value.trim().toLowerCase().replace(/\s/g, "");
    const expected = current.answer.toLowerCase().replace(/\s/g, "");
    const isCorrect = normalized === expected;

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
    setFeedback(isCorrect ? "Correct! Keep going." : "Not quite, try again.");
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{topic.title}</h1>
          <p className="text-sm text-zinc-500">{topic.description}</p>
        </div>
        <div className="text-sm text-zinc-500">
          {solvedCount}/{topicProblems.length} solved
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-sm text-zinc-500">
          Problem {index + 1} of {topicProblems.length}
        </div>
        <h2 className="mt-3 text-xl font-semibold">
          <MathText text={current.prompt} />
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          <MathText text={current.hint} />
        </p>

        {current.type === "mcq" ? (
          <div className="mt-4 flex flex-col gap-3">
            {current.choices?.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => submitAnswer(choice)}
                className="rounded-lg bg-white px-6 py-4 text-left text-lg font-medium shadow-sm transition hover:bg-emerald-50 hover:shadow-md active:scale-95 dark:bg-zinc-800 dark:hover:bg-emerald-950"
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
            />
          </div>
        )}

        {feedback && (
          <div className="mt-4 rounded-lg bg-blue-50 p-4 shadow-sm dark:bg-blue-950/30">
            <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">{feedback}</p>
            <p className="mt-2 text-xl leading-relaxed text-blue-800 dark:text-blue-200">
              <MathText text={current.explanation} />
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setFeedback(null);
              setAnswer("");
              setIndex((prev) => Math.max(0, prev - 1));
            }}
          >
            Previous
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setFeedback(null);
              setAnswer("");
              setIndex((prev) => Math.min(topicProblems.length - 1, prev + 1));
            }}
          >
            Next
          </button>
          <Link className="btn-secondary" href="/practice">
            Back to topics
          </Link>
        </div>
      </div>
    </div>
  );
}
