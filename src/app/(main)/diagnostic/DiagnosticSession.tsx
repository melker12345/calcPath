"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MathInput } from "@/components/math-input";
import { MathText } from "@/components/math-text";
import { useProgress } from "@/components/progress-provider";
import { isAnswerCorrectAsync } from "@/lib/answer-check";
import type { DiagnosticPrerequisite, DiagnosticQuestionFile } from "@/lib/content/schema";
import {
  getRecommendedPrerequisiteAction,
  summarizeDiagnosticPrerequisites,
  type DiagnosticQuestionResult,
} from "@/lib/diagnostics";
import { formatAnswerForDisplay, ProgressDots, type QuestionStatus } from "@/components/practice";
import { detectQuestionContext } from "@/lib/math-input-helpers";
import { getModulesPath } from "@/lib/subject-urls";
import { DiagnosticStatusPill } from "./DiagnosticStatusPill";

type Stage = "intro" | "questions" | "results";
type FeedbackState = null | { correct: boolean };

export type DiagnosticSessionProps = {
  targetSubject: string;
  subjectLabel: string;
  prerequisites: DiagnosticPrerequisite[];
  questions: DiagnosticQuestionFile[];
};

export function DiagnosticSession({
  targetSubject,
  subjectLabel,
  prerequisites,
  questions,
}: DiagnosticSessionProps) {
  const { progress, addDiagnosticResult } = useProgress();
  const [stage, setStage] = useState<Stage>("intro");
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState<DiagnosticQuestionResult[] | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [checking, setChecking] = useState(false);

  const prerequisiteById = useMemo(
    () => new Map(prerequisites.map((prerequisite) => [prerequisite.id, prerequisite])),
    [prerequisites],
  );

  const question = questions[index];
  const currentResults = results ?? [];

  const priorResults = useMemo(
    () =>
      progress.diagnostics.filter(
        (result) => result.mode === "prerequisite" && result.targetSubject === targetSubject,
      ),
    [progress.diagnostics, targetSubject],
  );

  const summaries = useMemo(
    () =>
      summarizeDiagnosticPrerequisites(
        results
          ? [{
              mode: "prerequisite",
              targetSubject,
              completedAt: new Date().toISOString(),
              questionResults: results,
            }]
          : priorResults,
        prerequisites,
      ),
    [priorResults, prerequisites, results, targetSubject],
  );

  const action = getRecommendedPrerequisiteAction(summaries, prerequisites, targetSubject);
  const questionContext = useMemo(
    () => (question ? detectQuestionContext(question.prompt) : undefined),
    [question],
  );

  const questionStatuses = useMemo<QuestionStatus[]>(
    () =>
      questions.map((_, i) => {
        const result = currentResults[i];
        if (!result) return "not-attempted";
        return result.correct ? "solved" : "wrong";
      }),
    [questions, currentResults],
  );

  const selectQuestion = (i: number) => {
    if (i >= currentResults.length) return;
    setIndex(i);
    setAnswer("");
    setFeedback({ correct: currentResults[i].correct });
  };

  const start = () => {
    setIndex(0);
    setAnswer("");
    setResults([]);
    setFeedback(null);
    setStage("questions");
  };

  const submitAnswer = async (value: string) => {
    if (!question || checking || feedback) return;
    setChecking(true);

    const correct = question.type === "mcq"
      ? value === question.answer
      : await isAnswerCorrectAsync(value, question.answer);

    const nextResults = [
      ...currentResults,
      { questionId: question.id, prerequisiteId: question.prerequisiteId, correct },
    ];

    setResults(nextResults);
    setFeedback({ correct });
    setChecking(false);
  };

  const goNext = () => {
    if (!results) return;

    if (index < questions.length - 1) {
      setIndex((current) => current + 1);
      setAnswer("");
      setFeedback(null);
      return;
    }

    const score = results.filter((result) => result.correct).length;
    const prerequisiteSummaries = summarizeDiagnosticPrerequisites(
      [{
        mode: "prerequisite",
        targetSubject,
        completedAt: new Date().toISOString(),
        questionResults: results,
      }],
      prerequisites,
    );

    addDiagnosticResult({
      mode: "prerequisite",
      targetSubject,
      completedAt: new Date().toISOString(),
      score,
      total: results.length,
      questionResults: results,
      prerequisiteSummaries,
    });
    setStage("results");
  };

  if (stage === "intro") {
    return (
      <div className="mx-auto w-full max-w-3xl px-0 pb-0 sm:px-6 sm:py-10">
        <div className="flex min-h-[calc(100dvh-56px)] flex-col justify-center bg-white px-5 py-8 dark:bg-[var(--bg)] sm:min-h-[min(80vh,700px)] sm:rounded-2xl sm:border sm:border-slate-200 dark:sm:border-[var(--border)] sm:px-8 sm:py-10 sm:shadow-lg dark:sm:shadow-none">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-500 dark:text-[var(--accent)]">
            Prerequisite diagnostic
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-[var(--text-primary)] sm:text-4xl">
            Are you ready for {subjectLabel}?
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-[var(--text-muted)]">
            This session samples {questions.length} questions across prerequisite skills. It uses the same answer tools as practice and does not count against your module progress.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[var(--border)] dark:bg-[var(--surface)]">
            <p className="text-sm font-semibold text-zinc-900 dark:text-[var(--text-primary)]">What it checks</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {prerequisites.map((prerequisite) => (
                <div key={prerequisite.id} className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-zinc-700 ring-1 ring-slate-200 dark:bg-[var(--surface-2)] dark:text-[var(--text-secondary)] dark:ring-[var(--border)]">
                  {prerequisite.label}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={start}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98] dark:bg-white dark:text-[var(--bg)] dark:hover:bg-zinc-200"
            >
              Start diagnostic
            </button>
            <Link
              href="/diagnostic"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-zinc-600 transition hover:bg-slate-50 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-[var(--text-secondary)] dark:hover:bg-[var(--surface-2)]"
            >
              Choose another subject
            </Link>
            <Link
              href={getModulesPath(targetSubject)}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-zinc-600 transition hover:bg-slate-50 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-[var(--text-secondary)] dark:hover:bg-[var(--surface-2)]"
            >
              Skip to modules
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "results") {
    return (
      <div className="mx-auto w-full max-w-3xl px-0 pb-0 sm:px-6 sm:py-10">
        <div className="flex min-h-[calc(100dvh-56px)] flex-col bg-white px-5 py-8 dark:bg-[var(--bg)] sm:min-h-[min(80vh,700px)] sm:rounded-2xl sm:border sm:border-slate-200 dark:sm:border-[var(--border)] sm:px-8 sm:py-10 sm:shadow-lg dark:sm:shadow-none">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-500 dark:text-[var(--accent)]">
            Results
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-[var(--text-primary)] sm:text-4xl">
            Your {subjectLabel} readiness map
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-[var(--text-muted)]">
            Use this as a starting signal, not a grade. Retake it whenever you want.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {summaries.map((summary) => (
              <div key={summary.prerequisite.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[var(--border)] dark:bg-[var(--surface)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-zinc-900 dark:text-[var(--text-primary)]">{summary.prerequisite.label}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-[var(--text-muted)]">
                      {summary.prerequisite.description}
                    </p>
                  </div>
                  <DiagnosticStatusPill status={summary.status} />
                </div>
                <p className="mt-3 text-xs font-medium text-zinc-500 dark:text-[var(--text-muted)]">
                  {summary.total === 0 ? "Not tested" : `${summary.correct}/${summary.total} correct`}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] dark:bg-[var(--surface)]">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-[var(--accent)]">
              Suggested next step
            </p>
            <h2 className="mt-1 text-xl font-bold text-zinc-900 dark:text-[var(--text-primary)]">{action.label}</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-[var(--text-secondary)]">{action.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-[var(--bg)] dark:hover:bg-zinc-200" href={action.href}>
                Continue
              </Link>
              <button
                type="button"
                onClick={start}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-zinc-600 dark:border-[var(--border)] dark:bg-[var(--surface-2)] dark:text-[var(--text-secondary)]"
              >
                Retake diagnostic
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) return null;

  const prerequisite = prerequisiteById.get(question.prerequisiteId);
  const answerText = formatAnswerForDisplay(question.answer);
  const overlay = feedback ? (
    <div className={`flex flex-col border-t p-4 sm:p-5 ${
      feedback.correct
        ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-[#0a2e1f]"
        : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-[#2a1f0a]"
    }`}>
      <div className="flex items-center gap-2.5">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white sm:h-10 sm:w-10 sm:text-base ${
          feedback.correct ? "bg-emerald-500" : "bg-amber-400"
        }`}>
          {feedback.correct ? "✓" : "✗"}
        </div>
        <div>
          <p className={`text-base font-bold sm:text-xl ${
            feedback.correct ? "text-emerald-800 dark:text-emerald-400" : "text-amber-800 dark:text-amber-400"
          }`}>
            {feedback.correct ? "Correct!" : "Not quite"}
          </p>
          <p className={`text-xs sm:text-sm ${
            feedback.correct ? "text-emerald-700 dark:text-emerald-400/90" : "text-amber-700 dark:text-amber-400/90"
          }`}>
            <MathText text={question.explanation} />
          </p>
        </div>
      </div>

      <div className={`mt-3 rounded-lg px-3 py-2 sm:rounded-xl sm:px-4 sm:py-3 ${
        feedback.correct ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-amber-100 dark:bg-amber-900/30"
      }`}>
        <p className={`text-sm font-semibold sm:text-base ${
          feedback.correct ? "text-emerald-900 dark:text-emerald-300" : "text-amber-900 dark:text-amber-300"
        }`}>
          Answer: <MathText text={answerText} />
        </p>
      </div>

      <button
        type="button"
        onClick={goNext}
        className={`mt-3 w-full rounded-xl py-2.5 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] sm:py-3 sm:text-base ${
          feedback.correct
            ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            : "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
        }`}
      >
        {index === questions.length - 1 ? "View readiness map" : "Next Question →"}
      </button>
    </div>
  ) : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-0 pb-0 sm:px-6 sm:py-10">
      <div className="flex min-h-[calc(100dvh-56px)] flex-col justify-end bg-white px-4 pb-1 pt-2 dark:bg-[var(--bg)] sm:min-h-[min(80vh,700px)] sm:rounded-2xl sm:px-8 sm:pb-6 sm:pt-6 sm:shadow-lg dark:sm:shadow-none">
        <div className="flex w-full justify-center">
          <div className="flex items-center gap-2">
            <ProgressDots
              statuses={questionStatuses}
              currentIndex={index}
              onSelect={selectQuestion}
            />
            <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-400 dark:text-[var(--text-muted)]">
              {index + 1} / {questions.length}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-5">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-[var(--surface-2)] dark:text-[var(--text-muted)]">
            {prerequisite?.label ?? "Prerequisite"}
          </span>
          <h2 className="text-center text-lg font-semibold leading-relaxed text-zinc-900 dark:text-[var(--text-primary)] sm:text-2xl">
            <MathText text={question.prompt} />
          </h2>
        </div>

        {question.type === "mcq" ? (
          <div className="flex flex-col gap-2 sm:gap-3">
            {!overlay && question.choices?.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => {
                  setAnswer(choice);
                  void submitAnswer(choice);
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-base font-medium text-zinc-900 transition hover:border-blue-300 hover:bg-blue-50 active:scale-[0.98] sm:px-5 sm:py-3.5 sm:text-lg dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-[var(--text-primary)] dark:hover:border-[var(--accent)] dark:hover:bg-[var(--surface-2)]"
              >
                <MathText text={choice} />
              </button>
            ))}
            {overlay && (
              <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-[var(--border)]">
                {overlay}
              </div>
            )}
          </div>
        ) : (
          <MathInput
            value={answer}
            onChange={setAnswer}
            onSubmit={() => void submitAnswer(answer)}
            onHint={undefined}
            hintDisabled
            questionContext={questionContext}
            answerHint={question.answer}
            feedbackOverlay={overlay}
            questionPrompt={question.prompt}
          />
        )}

        <div className="mt-1 grid grid-cols-[1fr_auto_1fr] items-center py-1 sm:mt-3 sm:py-0">
          <button
            type="button"
            onClick={() => setStage("intro")}
            className="justify-self-start rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-400 transition hover:bg-zinc-100 dark:hover:bg-[var(--surface-2)] sm:text-sm dark:text-[var(--text-muted)]"
          >
            Exit
          </button>
          <div className="justify-self-center rounded-full px-2 py-0.5 text-[11px] font-medium text-zinc-400 ring-1 ring-zinc-200/80 dark:text-[var(--text-muted)] dark:ring-[var(--border)]">
            {subjectLabel}
          </div>
          <div />
        </div>
      </div>
    </div>
  );
}