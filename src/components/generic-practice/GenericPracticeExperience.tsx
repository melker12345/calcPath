"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useProgress } from "@/components/progress-provider";
import { isAnswerCorrectAsync } from "@/lib/answer-check";
import { detectQuestionContext } from "@/lib/math-input-helpers";
import { MathInput } from "@/components/math-input";
import { MathText } from "@/components/math-text";
import {
  ProgressDots,
  PracticeFeedback,
  usePracticeSession,
  getDefaultHint,
  extractFinalAnswer,
} from "@/components/practice";
import type { FileSystemContentBundle } from "@/lib/content/schema";

type SubjectKey = "calculus" | "linalg" | "stats";

const SUBJECT_MAP: Record<string, SubjectKey> = {
  calculus: "calculus",
  "linear-algebra": "linalg",
  statistics: "stats",
};

interface GenericPracticeExperienceProps {
  /** Primary input: fully data-driven bundle from getFileSystemContentBundle() or load*FromContent() */
  bundle: FileSystemContentBundle;
  /** Topic to practice questions for. Must be present in bundle.topics (and have problems). */
  topicId: string;
  /** Optional deep-link to a specific question id (e.g. from ?focus= query) */
  focusId?: string | null;
  /** Render an in-component topic switcher (useful for demos or embedded "practice all" experiences). */
  allowTopicSwitch?: boolean;
  /** Callback when internal or user-driven topic switch occurs (enables gradual adoption path). */
  onTopicSwitch?: (newTopicId: string) => void;
  /** Optional override for building "review in module" links. Defaults to modern /slug/modules/tid#section convention (matches new MDX anchors). */
  getModuleUrl?: (topicId: string, section?: string) => string | null;
}

/**
 * Production-quality, fully generic & data-driven practice experience.
 *
 * Consumes a FileSystemContentBundle (from the content/ JSON+MDX loader) + topicId.
 * Internally uses the shared usePracticeSession + ProgressDots + PracticeFeedback primitives.
 * Supports:
 *  - All question types: numeric (MathInput) + mcq (button grid)
 *  - Hints, solutions, step-by-step via shared extractors (no more per-page parsing)
 *  - Global progress tracking + resume + shuffle + skip-to-unsolved + dots navigation
 *  - Topic switching within the subject (via prop or built-in selector)
 *  - Review links back to modules (using stable section anchors from content)
 *  - Subject-aware MathInput theming via bundle.config.slug
 *
 * ## Migration / Adapter Path (for the three existing subject practice pages)
 * The component is the target. Existing pages (which still import from *-content.ts + have
 * duplicated submit/getHint/overlay/renderSteps/RichMathText) can adopt GRADUALLY:
 *
 * 1. Experimental / behind flag: in a dev-only page or feature-flagged branch, import the bundle
 *    + render <GenericPracticeExperience bundle={fsBundle} topicId={...} /> instead of local logic.
 * 2. Add thin adapter helpers (e.g. legacyProblemsToBundleShape) in this generic-practice/ dir only.
 * 3. Once battle-tested per subject, the old page can be a 5-line wrapper and eventually deleted.
 *
 * Blockers for full switchover (documented also in src/lib/content/NOTES.md):
 * - MathInput still requires a "subject" key (we map it).
 * - Module deep-link helpers (getModuleSectionUrl) are per-legacy-content; we provide sensible default.
 * - Analytics/trackEvent calls and some subject polish (e.g. cleanedPrompt in calc) are page-specific today.
 * - Full dynamic routes ([subject]/practice/[topicId]) not yet (per open questions).
 * - Progress ID stability guaranteed (same ids in JSON as legacy).
 *
 * No changes were made to app/[star]/practice/[topicId]/page.tsx files.
 *
 * Usage example (experimental or playground):
 *   import { getFileSystemContentBundle } from "@/lib/content/loader";
 *   const bundle = await getFileSystemContentBundle("linear-algebra");
 *   <GenericPracticeExperience bundle={bundle} topicId="vectors" allowTopicSwitch />
 */
export function GenericPracticeExperience({
  bundle,
  topicId: controlledTopicId,
  focusId,
  allowTopicSwitch = false,
  onTopicSwitch,
  getModuleUrl,
}: GenericPracticeExperienceProps) {
  const { progress, addAttempt } = useProgress();

  // Support both fully controlled (parent manages topic) and internal switching for standalone use.
  const [internalTopicId, setInternalTopicId] = useState(controlledTopicId);
  const currentTopicId = controlledTopicId ?? internalTopicId;

  const topic = useMemo(
    () => bundle.topics.find((t) => t.id === currentTopicId),
    [bundle.topics, currentTopicId]
  );

  const topicProblems = useMemo(
    () => bundle.problems.filter((p) => p.topicId === currentTopicId),
    [bundle.problems, currentTopicId]
  );

  const subjectSlug = bundle.config.slug;
  const inputSubject: SubjectKey = SUBJECT_MAP[subjectSlug] ?? "calculus";

  // Default module link builder: works with the {#section} anchors in new module.mdx files.
  const defaultGetModuleUrl = (tid: string, sec?: string) =>
    sec ? `/${subjectSlug}/modules/${tid}#${sec}` : `/${subjectSlug}/modules/${tid}`;

  const resolveModuleUrl =
    getModuleUrl ?? ((tid: string, sec?: string) => defaultGetModuleUrl(tid, sec));

  const {
    displayProblems,
    index,
    setIndex,
    current: hookCurrent,
    questionStatuses,
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
    focusId,
  });

  const current = hookCurrent || displayProblems[index];
  const canonicalQuestionNumber =
    current ? topicProblems.findIndex((problem) => problem.id === current.id) + 1 : 0;

  const questionContext = useMemo(
    () => (current ? detectQuestionContext(current.prompt) : undefined),
    [current]
  );

  if (!topic) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 text-sm text-red-600 dark:text-red-400">
        Topic “{currentTopicId}” not found in the provided FileSystemContentBundle for “{subjectSlug}”.
        <div className="mt-2 text-xs theme-text-muted">
          Available: {bundle.topics.map((t) => t.id).join(", ")}
        </div>
      </div>
    );
  }

  if (topicProblems.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 text-center">
        <p className="text-lg font-semibold">No questions for this topic in the current bundle.</p>
        <p className="mt-2 text-sm theme-text-muted">
          Bundle contains {bundle.problems.length} total problems across {bundle.topics.length} topics.
          (Some topics may be metadata-only until their questions.json + module.mdx are present.)
        </p>
      </div>
    );
  }

  const submitAnswer = async (val: string) => {
    if (!current) return;
    const isCorrect = await isAnswerCorrectAsync(val, current.answer);

    const currentAttempts = feedback?.type === "incorrect" ? feedback.attempts : 0;
    const hintWasUsed = feedback?.type === "incorrect" ? feedback.hintUsed : false;

    addAttempt({
      problemId: current.id,
      topicId: current.topicId,
      correct: isCorrect,
      createdAt: new Date().toISOString(),
    });

    setOverlayDismissed(false);

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

    setOverlayDismissed(false);

    if (feedback?.type === "incorrect") {
      setFeedback({ ...feedback, hintUsed: true });
    } else {
      setFeedback({ type: "incorrect", attempts: 0, hintUsed: true, showSolution: false });
    }
  };

  const showSolution = () => {
    if (feedback?.type !== "incorrect") return;
    setFeedback((prev) =>
      prev && prev.type === "incorrect" ? { ...prev, showSolution: true } : prev
    );
  };

  const finalAnswer = extractFinalAnswer(current?.explanation || "", current?.answer || "");
  const isDismissable = feedback?.type === "incorrect" && !feedback.showSolution;

  const overlay = feedback ? (
    <PracticeFeedback
      feedback={feedback}
      current={current!}
      onNext={goToNext}
      onUseHint={useHint}
      onShowSolution={showSolution}
      getHint={() => getDefaultHint(current?.explanation || "")}
      overlayDismissed={overlayDismissed}
      setOverlayDismissed={setOverlayDismissed}
      finalAnswer={finalAnswer}
    />
  ) : null;

  const handleTopicSelect = (newTopicId: string) => {
    if (newTopicId === currentTopicId) return;
    setInternalTopicId(newTopicId);
    onTopicSwitch?.(newTopicId);
    // When parent controls via prop it will re-render with new topicId; internal state supports demo use.
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-0 pb-0 sm:px-6 sm:py-10">
      {/* Desktop / header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold theme-text dark:text-[var(--text-primary)]">
              {topic.title}
            </h1>

            {allowTopicSwitch && bundle.topics.length > 1 && (
              <select
                value={currentTopicId}
                onChange={(e) => handleTopicSelect(e.target.value)}
                className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-sm font-medium theme-text dark:bg-[var(--surface)] dark:border-zinc-700"
                aria-label="Switch practice topic within subject"
              >
                {bundle.topics
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
              </select>
            )}
          </div>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-[var(--text-muted)]">
            {topic.description}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3 text-sm theme-text-muted">
          <span className="tabular-nums">
            {solvedCount}/{displayProblems.length} mastered
          </span>
          <span className="hidden text-xs uppercase tracking-widest theme-text-muted sm:inline">
            {subjectSlug}
          </span>
        </div>
      </div>

      {/* Main practice card (consistent with existing polished UIs) */}
      <div className="flex min-h-[calc(100dvh-56px)] flex-col justify-end bg-white px-4 pb-1 pt-2 dark:bg-[var(--surface)] sm:min-h-[min(80vh,700px)] sm:rounded-2xl sm:px-8 sm:pb-6 sm:pt-6 sm:shadow-lg">
        {/* Progress dots (shared) */}
        <div className="flex w-full justify-center">
          <div className="flex items-center gap-2">
            <ProgressDots
              statuses={questionStatuses}
              currentIndex={index}
              onSelect={(i) => setIndex(i)}
            />
            <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-400">
              {index + 1} / {displayProblems.length}
            </span>
          </div>
        </div>

        {/* Question prompt area */}
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-5 text-center">
          <div role="heading" aria-level={2} className="text-lg font-semibold leading-relaxed sm:text-2xl">
            <MathText text={current?.prompt || ""} />
          </div>

          {/* Review / deep-link to module section (generic, works with new content/ MDX anchors) */}
          {(() => {
            const section = current?.section;
            const moduleUrl = section ? resolveModuleUrl(currentTopicId, section) : resolveModuleUrl(currentTopicId);
            if (!moduleUrl) return null;
            return (
              <Link
                href={moduleUrl}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30"
                title={section ? `Review “${section}” in the module` : "Review the full module"}
              >
                📖 Review this section
              </Link>
            );
          })()}
        </div>

        {/* Answer input: MCQ grid or freeform MathInput (subject-themed via map) */}
        {current?.type === "mcq" ? (
          <div className="flex flex-col gap-2 sm:gap-3">
            {(!overlay || overlayDismissed) &&
              current.choices?.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => {
                    setAnswer(choice);
                    submitAnswer(choice);
                  }}
                  disabled={feedback?.type === "correct"}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-base font-medium theme-text transition hover:border-blue-300 hover:bg-blue-50 active:scale-[0.98] disabled:opacity-50 sm:px-5 sm:py-3.5 sm:text-lg dark:border-[var(--border)] dark:bg-[var(--surface)] dark:hover:border-[var(--accent)] dark:hover:bg-[var(--surface-2)] dark:text-[var(--text-primary)]"
                >
                  <MathText text={choice} />
                </button>
              ))}

            {overlay && !overlayDismissed && (
              <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-[var(--border)]">
                {isDismissable && (
                  <button
                    type="button"
                    onClick={() => setOverlayDismissed(true)}
                    className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-sm text-zinc-400 shadow-sm backdrop-blur transition hover:bg-white hover:text-zinc-600 dark:bg-[var(--surface-2)]/80 dark:text-[var(--text-muted)] dark:hover:bg-[var(--surface-2)] dark:hover:text-[var(--text-secondary)]"
                  >
                    ×
                  </button>
                )}
                {overlay}
              </div>
            )}
          </div>
        ) : (
          <MathInput
            value={answer}
            onChange={setAnswer}
            onSubmit={() => submitAnswer(answer)}
            onHint={useHint}
            subject={inputSubject}
            hintDisabled={
              feedback?.type === "correct" ||
              (feedback?.type === "incorrect" && (feedback.hintUsed || feedback.showSolution))
            }
            questionContext={questionContext}
            answerHint={current?.answer}
            feedbackOverlay={overlay}
            onDismissOverlay={isDismissable ? () => setOverlayDismissed(true) : undefined}
            questionPrompt={current?.prompt}
          />
        )}

        {/* All mastered state (with shuffle) */}
        {solvedCount >= displayProblems.length && (
          <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-900/20 p-4 text-center sm:mt-6 sm:rounded-2xl sm:p-5 dark:border-emerald-800/50 dark:bg-emerald-950/30">
            <p className="text-lg font-bold text-emerald-300 dark:text-emerald-200">
              All {displayProblems.length} problems mastered!
            </p>
            <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
              Shuffle for a fresh run.
            </p>
            <button
              type="button"
              onClick={shuffleAndRestart}
              className="mt-3 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-95 dark:bg-white dark:text-[var(--bg)] dark:hover:bg-zinc-200"
            >
              Shuffle &amp; restart
            </button>
          </div>
        )}

        {/* Universal bottom nav (prev / next / skip / counter / exit) */}
        <div className="mt-1 grid grid-cols-[1fr_auto_1fr] items-center py-1 sm:mt-3 sm:py-0">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goToPrev}
              disabled={index === 0}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 disabled:opacity-25 sm:h-9 sm:w-9 dark:text-[var(--text-muted)] dark:hover:bg-[var(--surface-2)]"
              aria-label="Previous question"
            >
              ←
            </button>
            <button
              type="button"
              onClick={goToNext}
              disabled={index === displayProblems.length - 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 disabled:opacity-25 sm:h-9 sm:w-9 dark:text-[var(--text-muted)] dark:hover:bg-[var(--surface-2)]"
              aria-label="Next question"
            >
              →
            </button>
            {solvedCount > 0 && solvedCount < displayProblems.length && (
              <button
                type="button"
                className="ml-1 rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-400 transition hover:bg-zinc-100 sm:text-sm dark:text-[var(--text-muted)] dark:hover:bg-[var(--surface-2)]"
                onClick={() => {
                  const done = new Set(progress.completedProblemIds);
                  const nextUnsolved = displayProblems.findIndex((p, i) => i > index && !done.has(p.id));
                  setIndex(nextUnsolved >= 0 ? nextUnsolved : displayProblems.findIndex((p) => !done.has(p.id)) || 0);
                }}
              >
                Skip to unsolved
              </button>
            )}
          </div>

          <div className="justify-self-center rounded-full px-2 py-0.5 text-[11px] font-medium text-zinc-400 ring-1 ring-zinc-200/80 dark:ring-zinc-700 dark:text-[var(--text-muted)]">
            Q{canonicalQuestionNumber}
          </div>

          <Link
            className="justify-self-end rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-400 transition hover:bg-zinc-100 sm:text-sm dark:text-[var(--text-muted)] dark:hover:bg-[var(--surface-2)]"
            href={`/${subjectSlug}`}
          >
            All chapters
          </Link>
        </div>
      </div>
    </div>
  );
}
