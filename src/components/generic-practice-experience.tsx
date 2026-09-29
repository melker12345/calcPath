"use client";

import React, { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MathText } from "@/components/math-text";
import { MathInput } from "@/components/math-input";
import { ReportIssue } from "@/components/report-issue";
import { useProgress } from "@/components/progress-provider";
import { isAnswerCorrectAsync, isMcqAnswerCorrect } from "@/lib/answer-check";
import { detectQuestionContext } from "@/lib/math-input-helpers";
import { getSectionHref } from "@/lib/subject-urls";
import {
  ProgressDots,
  PracticeFeedback,
  usePracticeSession,
  getDefaultHint,
  extractFinalAnswer,
  orderedChoices,
} from "@/components/practice";
import type { Problem, Topic } from "@/lib/shared-types";

/**
 * GenericPracticeExperience — the practice page for one chapter.
 *
 * The page receives every question of the chapter from the server (the route
 * is static, and the first question is in the prerendered HTML). The optional
 * `?section=` and `?focus=` query parameters are read from window.location
 * once hydrated (useSyncExternalStore with an empty server snapshot) — not via
 * useSearchParams, which would bail the whole page out to client-side
 * rendering and ship an empty <main>.
 *
 * Structure, top to bottom: title and score, progress dots, the prompt, the
 * answer area (a radiogroup for multiple choice; the MathQuill field and keypad
 * for typed answers), the feedback, then the navigation row with the question
 * id and the report form.
 *
 * Resilience: a per-question error boundary keeps one malformed question from
 * taking the session down; every piece of text is rendered through MathText,
 * which has its own per-fragment fallback.
 */

class QuestionErrorBoundary extends React.Component<
  { children: React.ReactNode; onSkip: () => void; questionId: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onSkip: () => void; questionId: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn(`[QuestionErrorBoundary] Render error for question ${this.props.questionId}:`, error, errorInfo);
  }

  private handleSkip = () => {
    this.setState({ hasError: false, error: null });
    this.props.onSkip();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="border theme-border p-6 text-center">
          <p className="text-base font-semibold theme-text">This question could not be displayed.</p>
          <p className="mt-1 text-sm theme-text-secondary">
            A malformed formula or a data problem prevented rendering. Your progress is unaffected.
          </p>
          {this.state.error && (
            <p className="mt-2 break-all font-mono text-xs theme-text-muted">{this.state.error.message}</p>
          )}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button type="button" onClick={this.handleSkip} className="btn-primary">
              Skip to next question
            </button>
            <button type="button" onClick={this.handleReset} className="btn-secondary">
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function subscribeToLocation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

function readLocationSearch() {
  return window.location.search;
}

export function GenericPracticeExperience({
  topic,
  problems: allTopicProblems,
  subjectSlug,
  subjectLabel,
  nextTopic,
  hasProblemSet = false,
}: {
  topic: Topic;
  problems: Problem[];
  subjectSlug: string;
  subjectLabel: string;
  nextTopic?: { id: string; title: string };
  /** Whether content/{subject}/topics/{topic}/problemset.json exists, i.e. whether /[subject]/test/[topicId] exists. */
  hasProblemSet?: boolean;
}) {
  const params = useParams<{ topicId: string }>();
  const topicId = params?.topicId ?? topic.id;
  // "" on the server and during hydration, the real query string afterwards.
  const search = useSyncExternalStore(subscribeToLocation, readLocationSearch, () => "");
  const { focusId, sectionFilter } = useMemo(() => {
    const sp = new URLSearchParams(search);
    return { focusId: sp.get("focus"), sectionFilter: sp.get("section") };
  }, [search]);

  const { progress, addAttempt } = useProgress();

  const topicProblems = useMemo(
    () => allTopicProblems.filter((p) => p.topicId === topicId),
    [allTopicProblems, topicId]
  );

  // A `?section=` that matches nothing falls back to the whole chapter rather
  // than an empty session.
  const effectiveSectionFilter = useMemo(() => {
    if (!sectionFilter) return null;
    return topicProblems.some((p) => p.section === sectionFilter) ? sectionFilter : null;
  }, [sectionFilter, topicProblems]);

  const {
    displayProblems,
    index,
    setIndex,
    current: hookCurrent,
    questionStatuses,
    solvedCount,
    goToNext,
    goToPrev,
    pinIndex,
    answer,
    setAnswer,
    feedback,
    setFeedback,
  } = usePracticeSession({
    problems: topicProblems,
    completedProblemIds: progress.completedProblemIds,
    sectionFilter: effectiveSectionFilter,
    focusId,
  });

  const current = hookCurrent || displayProblems[index];

  // Every graded submission for the current question, in order. Attached to
  // reports so "answer seems wrong" arrives with exactly what was typed and how
  // the grader judged it. Reset when the question changes.
  const [submissionLog, setSubmissionLog] = useState<
    { input: string; gradedCorrect: boolean; at: string }[]
  >([]);
  const [loggedQuestionId, setLoggedQuestionId] = useState(current?.id);
  if (current?.id !== loggedQuestionId) {
    setLoggedQuestionId(current?.id);
    setSubmissionLog([]);
  }

  const backToExplanationHref = getSectionHref(
    subjectSlug,
    topic.id,
    current?.section || displayProblems[0]?.section
  );

  const questionContext = useMemo(
    () => (current && typeof current.prompt === "string" ? detectQuestionContext(current.prompt) : undefined),
    [current]
  );

  // Display order of the choices: seeded on the question id, the same before
  // and after grading (see practice/shuffleChoices.ts).
  const choices = useMemo(
    () => (current?.type === "mcq" ? orderedChoices(current.id, current.choices) : []),
    [current]
  );

  if (displayProblems.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-semibold theme-text">{topic.title}</h1>
        <p className="mt-3 text-base theme-text-secondary">No practice questions are available for this chapter yet.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={backToExplanationHref} className="btn-primary">
            Read the chapter
          </Link>
          <Link href={`/${subjectSlug}`} className="btn-secondary">
            All {subjectLabel} chapters
          </Link>
        </div>
      </div>
    );
  }

  if (!current || typeof current.prompt !== "string" || !current.explanation) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="theme-text-secondary">This question could not be displayed.</p>
        <button type="button" onClick={goToNext} className="btn-primary mt-4">
          Skip to next question
        </button>
        <Link href={`/${subjectSlug}`} className="mt-3 block text-[var(--accent)] underline">
          All {subjectLabel} chapters
        </Link>
      </div>
    );
  }

  const submitAnswer = async (val: string) => {
    // Freeze the session on this question so a correct grade (which updates
    // progress and would move the auto-index to the next unsolved question)
    // cannot tear down the feedback the learner is about to read.
    pinIndex();
    const mcqVerdict =
      current.type === "mcq" ? isMcqAnswerCorrect(val, current.answer, current.choices) : null;
    const isCorrect = mcqVerdict ?? (await isAnswerCorrectAsync(val, current.answer));
    const currentAttempts = feedback?.type === "incorrect" ? feedback.attempts : 0;
    const hintWasUsed = feedback?.type === "incorrect" ? feedback.hintUsed : false;

    setSubmissionLog((log) => [...log, { input: val, gradedCorrect: isCorrect, at: new Date().toISOString() }]);

    addAttempt({
      problemId: current.id,
      topicId: current.topicId,
      correct: isCorrect,
      createdAt: new Date().toISOString(),
    });

    if (isCorrect) {
      setFeedback({ type: "correct" });
    } else {
      const newAttempts = currentAttempts + 1;
      setFeedback({
        type: "incorrect",
        attempts: newAttempts,
        hintUsed: hintWasUsed,
        showSolution: newAttempts >= 3 || (hintWasUsed && newAttempts >= 2),
      });
    }
  };

  const useHint = () => {
    if (feedback?.type === "correct") return;
    if (feedback?.type === "incorrect" && feedback.hintUsed) return;
    if (feedback?.type === "incorrect") {
      setFeedback({ ...feedback, hintUsed: true });
    } else {
      setFeedback({ type: "incorrect", attempts: 0, hintUsed: true, showSolution: false });
    }
  };

  const getHint = () => getDefaultHint(current?.explanation || "", current?.answer);
  const finalAnswer = extractFinalAnswer(current?.explanation || "", current?.answer || "");

  // Everything a report needs to be reproducible without asking the learner:
  // which question, what the grader expected, every graded submission, and the
  // hint/solution state at report time.
  const reportContext: Record<string, unknown> = {
    questionId: current.id,
    questionType: current.type,
    section: current.section ?? null,
    expectedAnswer: current.answer,
    submissions: submissionLog,
    hintUsed: feedback?.type === "incorrect" ? feedback.hintUsed : false,
    solutionShown: feedback?.type === "incorrect" ? feedback.showSolution : false,
  };

  const feedbackEl = feedback ? (
    <PracticeFeedback
      feedback={feedback}
      current={{ id: current.id, explanation: current.explanation, answer: current.answer }}
      onNext={goToNext}
      onUseHint={useHint}
      onShowSolution={() =>
        setFeedback((prev) => (prev && prev.type === "incorrect" ? { ...prev, showSolution: true } : prev))
      }
      getHint={getHint}
      finalAnswer={finalAnswer}
      isLastQuestion={index === displayProblems.length - 1}
    />
  ) : null;
  // Correct, or the full solution: the card replaces the input.
  const isFullFeedback =
    feedback?.type === "correct" || (feedback?.type === "incorrect" && feedback.showSolution);
  // MCQ: a choice has been graded (hint-only feedback does not count).
  const mcqAnswered = feedback?.type === "correct" || (feedback?.type === "incorrect" && feedback.attempts > 0);
  const allSolved = solvedCount >= displayProblems.length;

  const navButton =
    "flex h-9 min-w-9 items-center justify-center border theme-border px-2 text-sm theme-text disabled:opacity-40";
  const quietLink = "text-sm theme-text-muted hover:underline";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Title row */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b theme-border pb-3">
        <h1 className="text-xl font-semibold theme-text sm:text-2xl">{topic.title}</h1>
        <span className="text-sm tabular-nums theme-text-muted">
          {solvedCount}/{displayProblems.length} solved
          {effectiveSectionFilter ? " in this section" : ""}
        </span>
      </div>

      {/* Progress dots + "1 / N" */}
      <div className="mt-4 flex w-full min-w-0 items-center justify-center gap-2">
        <ProgressDots statuses={questionStatuses} currentIndex={index} onSelect={(i) => setIndex(i)} />
        <span className="shrink-0 text-xs tabular-nums theme-text-muted">
          {index + 1} / {displayProblems.length}
        </span>
      </div>

      {/* Said once, on arrival at a fresh set. */}
      {solvedCount === 0 && index === 0 && !feedback && (
        <p className="mx-auto mt-3 max-w-lg text-center text-xs leading-relaxed theme-text-muted">
          Each question is graded on a single answer: a check that this chapter&apos;s methods work,
          not a test of the reasoning behind them.
        </p>
      )}

      <QuestionErrorBoundary key={current.id} onSkip={goToNext} questionId={current.id}>
        {/* Prompt */}
        <div className="py-6 text-center sm:py-8">
          <div role="heading" aria-level={2} className="text-lg leading-relaxed theme-text sm:text-xl">
            <MathText text={current.prompt} />
          </div>
          <p className="mt-3">
            <Link href={getSectionHref(subjectSlug, current.topicId, current.section)} className="text-sm text-[var(--accent)] hover:underline">
              Read the section this question comes from
            </Link>
          </p>
        </div>

        {/* Answer area */}
        {current.type === "mcq" ? (
          /* The choice list never disappears after answering: the correct
             choice and the selected one stay marked, in words as well as by
             border, so the learner can compare against the distractors. */
          <div className="flex flex-col gap-3">
            <div role="radiogroup" aria-label="Answer choices" className="flex flex-col gap-2">
              {choices.map((choice) => {
                const isSelected = answer === choice;
                const isCorrectChoice = isMcqAnswerCorrect(choice, current.answer, current.choices);
                let boxClass = isSelected ? "border-[var(--accent)]" : "theme-border";
                let label: string | null = null;
                if (mcqAnswered) {
                  if (isCorrectChoice) {
                    boxClass = "border-[var(--accent)] border-2";
                    label = "Correct answer";
                  } else if (isSelected) {
                    boxClass = "theme-border border-dashed";
                    label = "Your answer";
                  } else {
                    boxClass = "theme-border opacity-60";
                  }
                }
                return (
                  <button
                    key={choice}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => {
                      setAnswer(choice);
                      submitAnswer(choice);
                    }}
                    disabled={mcqAnswered}
                    className={`flex items-baseline justify-between gap-3 border bg-[var(--surface)] px-4 py-3 text-left text-base theme-text disabled:pointer-events-none sm:text-lg ${
                      mcqAnswered ? "" : "hover:border-[var(--accent)]"
                    } ${boxClass}`}
                  >
                    <span>
                      <MathText text={choice} />
                    </span>
                    {label && (
                      <span className="shrink-0 text-xs font-medium theme-text-muted">{label}</span>
                    )}
                  </button>
                );
              })}
            </div>
            {feedbackEl}
          </div>
        ) : (
          /* Typed answers: a plain incorrect verdict shows as a banner above
             the input, which stays editable with the attempt still in it. A
             correct grade or the full solution replaces the input. */
          <div className="flex flex-col gap-3">
            {feedbackEl && !isFullFeedback && feedbackEl}
            {isFullFeedback ? (
              feedbackEl
            ) : (
              <MathInput
                value={answer}
                onChange={setAnswer}
                onSubmit={() => {
                  // A blank submission must not record an attempt.
                  if (!answer.trim()) return;
                  submitAnswer(answer);
                }}
                onHint={useHint}
                hintDisabled={feedback?.type === "incorrect" && feedback.hintUsed}
                questionContext={questionContext}
                answerHint={current.answer}
                questionPrompt={current.prompt}
              />
            )}
          </div>
        )}
      </QuestionErrorBoundary>

      {/* Whole set solved */}
      {allSolved && (
        <div className="mt-6 border theme-border bg-[var(--surface-2)] p-4 sm:p-5">
          <p className="text-lg font-semibold theme-text">All {displayProblems.length} solved.</p>
          <p className="mt-2 text-sm leading-relaxed theme-text-secondary">
            These questions check that you can carry out this chapter&apos;s computations correctly.
            A full score means the mechanics are solid; it does not show that you could prove the
            results yourself. Re-read the chapter&apos;s statements and proofs for that, and work the
            printable problem set if the chapter has one.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link href={backToExplanationHref} className="btn-primary">
              Back to the chapter
            </Link>
            {hasProblemSet && (
              <Link href={`/${subjectSlug}/test/${topicId}`} className="btn-secondary">
                Printable problem set
              </Link>
            )}
            {nextTopic && (
              <Link href={`/${subjectSlug}/practice/${nextTopic.id}`} className="btn-secondary">
                Next chapter&apos;s practice
              </Link>
            )}
            <button type="button" onClick={() => setIndex(0)} className="btn-secondary">
              Restart
            </button>
          </div>
        </div>
      )}

      {/* Navigation row */}
      <div className="mt-6 flex flex-col gap-3 border-t theme-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button type="button" onClick={goToPrev} disabled={index === 0} className={navButton} aria-label="Previous question">
            ‹ Prev
          </button>
          <button
            type="button"
            onClick={goToNext}
            disabled={index === displayProblems.length - 1}
            className={navButton}
            aria-label="Next question"
          >
            Next ›
          </button>
          {solvedCount > 0 && !allSolved && (
            <button
              type="button"
              className={`${navButton} whitespace-nowrap`}
              onClick={() => {
                const done = new Set(progress.completedProblemIds);
                const next = displayProblems.findIndex((p, i) => i > index && !done.has(p.id));
                if (next >= 0) {
                  setIndex(next);
                  return;
                }
                const wrapped = displayProblems.findIndex((p) => !done.has(p.id));
                if (wrapped >= 0) setIndex(wrapped);
              }}
            >
              Skip to unsolved
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {/* The stable id, as stored in questions.json: what a report points at. */}
          <code className="text-xs theme-text-muted">{current.id}</code>
          <ReportIssue
            target={{
              kind: "question",
              subject: subjectSlug,
              topicId,
              questionId: current.id,
              section: current.section,
            }}
            context={reportContext}
          />
          {hasProblemSet && (
            <Link className={quietLink} href={`/${subjectSlug}/test/${topicId}`}>
              Problem set
            </Link>
          )}
          <Link className={quietLink} href={`/${subjectSlug}`}>
            All {subjectLabel} chapters
          </Link>
        </div>
      </div>
    </div>
  );
}
