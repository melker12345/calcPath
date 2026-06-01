"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MathText } from "@/components/math-text";
import { MathInput } from "@/components/math-input";
import { VoteFeedback } from "@/components/vote-feedback";
import { ProgressProvider } from "@/components/progress-provider";
import { AuthProvider } from "@/components/auth-provider";
import { useProgress } from "@/components/progress-provider";
import { trackEvent } from "@/lib/analytics";
import { isAnswerCorrectAsync } from "@/lib/answer-check";
import { detectQuestionContext } from "@/lib/math-input-helpers";
import { ProgressDots } from "@/components/practice/ProgressDots";
import { PracticeFeedback } from "@/components/practice/PracticeFeedback";
import { usePracticeSession } from "@/components/practice/usePracticeSession";
import type { Problem, Topic } from "@/lib/shared-types";
import { modules as calculusModules } from "@/lib/modules";

interface PracticeTopicClientProps {
  topicId: string;
  topic: Topic;
  topicProblems: Problem[];
  sectionFilter?: string;
  focusId?: string;
}

/**
 * Safe, shim-free implementations of the section deep-link helpers.
 * Sourced from the split module data (already client-safe, used by search/footer/etc).
 * This keeps the full high-quality practice experience (including the "Continue reading this section"
 * back-link and pretty section title in the header) for ?section= URLs without ever pulling
 * the legacy *-content shims (the source of repeated "topics is not defined" eval errors
 * when combined with ProgressProvider in the same client chunk).
 */
function getModuleSectionTitle(topicId: string, section: string): string | null {
  const mod = (calculusModules as any[]).find((m) => m.topicId === topicId);
  if (!mod?.sections) return null;
  const sec = mod.sections.find((s: any) => s.section === section);
  return sec?.title ?? null;
}

function getModuleSectionUrl(topicId: string, section: string): string | null {
  if (!topicId || !section) return null;
  return `/calculus/modules/${topicId}#${section}`;
}

export default function PracticeTopicClient({
  topicId,
  topic,
  topicProblems,
  sectionFilter,
  focusId,
}: PracticeTopicClientProps) {
  // Local providers for this practice route only.
  // This prevents the global layout/provider graph from pulling the legacy shim landmine
  // into the client bundle for real practice pages.
  return (
    <AuthProvider>
      <ProgressProvider>
        <PracticeTopicClientInner
          topicId={topicId}
          topic={topic}
          topicProblems={topicProblems}
          sectionFilter={sectionFilter}
          focusId={focusId}
        />
      </ProgressProvider>
    </AuthProvider>
  );
}

function PracticeTopicClientInner({
  topicId,
  topic,
  topicProblems,
  sectionFilter,
  focusId,
}: PracticeTopicClientProps) {
  const { progress, addAttempt } = useProgress();
  const searchParams = useSearchParams();

  const {
    displayProblems,
    index,
    setIndex,
    current: hookCurrent,
    questionStatuses,
    hasManuallyNavigated,
    solvedCount,
    goToNext,
    goToPrev,
    shuffleAndRestart,
    answer,
    setAnswer,
    feedback,
    setFeedback,
    overlayDismissed,
    setOverlayDismissed,
  } = usePracticeSession({
    problems: topicProblems,
    completedProblemIds: progress.completedProblemIds,
    sectionFilter,
    focusId,
  });

  const current = displayProblems[index];
  const canonicalQuestionNumber =
    current ? topicProblems.findIndex((problem) => problem.id === current.id) + 1 : 0;

  const questionContext = useMemo(() => {
    if (!current) return undefined;
    return detectQuestionContext(current.prompt);
  }, [current]);

  const cleanedPrompt = useMemo(() => {
    if (!current) return "";
    let p = current.prompt.trim();
    if (p.endsWith("?") && p.includes("$")) {
      p = p.slice(0, -1).trim();
    }
    return p;
  }, [current]);

  useEffect(() => {
    if (!topicId) return;
    trackEvent("view_practice_topic", { topicId });
  }, [topicId]);

  if (!current) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-sm text-zinc-600">No questions available.</p>
        <Link className="btn-secondary mt-4 inline-flex" href="/calculus">
          Back to Calculus
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

  const getHint = () => {
    const match = current.explanation.match(/Step 1:\s*([^.]+\.)/);
    return match?.[1] || "Think about the rules that apply to this type of problem.";
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-0 pb-0 sm:px-6 sm:py-10">
      {/* Desktop topic header */}
      <div className="mb-5 hidden sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-[var(--text-primary)]">
            {topic.title}
            {sectionFilter && (
              <span className="ml-2 text-xl font-normal text-zinc-500 dark:text-[var(--text-muted)]">
                — {getModuleSectionTitle(topicId, sectionFilter) || sectionFilter}
              </span>
            )}
          </h1>
          {sectionFilter && (() => {
            const backUrl = getModuleSectionUrl(topicId, sectionFilter);
            return backUrl ? (
              <Link
                href={backUrl}
                className="mt-1 inline-flex items-center gap-1 text-sm text-[var(--accent)] hover:underline"
              >
                ← Continue reading this section
              </Link>
            ) : null;
          })()}
          {!sectionFilter && (
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-[var(--text-muted)]">
              {topic.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!sectionFilter && (
            <>
              <span className="text-sm text-zinc-500">{solvedCount}/{displayProblems.length}</span>
              <Link className="btn-secondary" href={`/calculus/test/${topic.id}`}>
                Take test
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Main practice card */}
      <div className="border theme-border bg-white dark:bg-zinc-950 rounded-none sm:rounded-2xl p-6 sm:p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-zinc-500">
              Question {canonicalQuestionNumber} of {topicProblems.length}
            </div>
            <ProgressDots
              total={displayProblems.length}
              current={index}
              statuses={questionStatuses}
              onJump={setIndex}
            />
          </div>

          <div className="text-xl leading-tight mb-6">
            <MathText text={cleanedPrompt} />
          </div>

          <MathInput
            value={answer}
            onChange={setAnswer}
            onSubmit={submitAnswer}
            onHint={useHint}
            disabled={feedback?.type === "correct"}
            questionContext={questionContext}
            subject="calculus"
          />

          <PracticeFeedback
            feedback={feedback}
            current={current}
            onShowSolution={showFullSolution}
            onTryAgain={() => {
              setFeedback(null);
              setAnswer("");
              setOverlayDismissed(false);
            }}
          />
        </div>

        {/* Bottom navigation */}
        <div className="flex items-center justify-between pt-4 border-t theme-border">
          <button
            onClick={goToPrev}
            disabled={index === 0}
            className="btn-secondary disabled:opacity-40"
          >
            Previous
          </button>

          <div className="flex gap-2">
            <button onClick={shuffleAndRestart} className="btn-secondary text-xs">
              Shuffle
            </button>
            <button onClick={goToNext} className="btn-primary">
              {index === displayProblems.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
