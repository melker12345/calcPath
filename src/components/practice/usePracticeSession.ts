"use client";

import { useState, useMemo } from "react";
import type { Problem } from "@/lib/shared-types";
import type { FeedbackState, QuestionStatus } from "./types";

interface UsePracticeSessionOptions {
  problems: Problem[];
  completedProblemIds: string[];
  onManualNavigate?: () => void;
  sectionFilter?: string | null;
  /** Optional: deep-link to a specific question by id */
  focusId?: string | null;
}

interface UsePracticeSessionReturn {
  displayProblems: Problem[];
  index: number;
  setIndex: (index: number) => void;
  current: Problem | undefined;
  questionStatuses: QuestionStatus[];
  hasManuallyNavigated: boolean;
  solvedCount: number;
  goToNext: () => void;
  goToPrev: () => void;
  shuffleAndRestart: () => void;
  setHasManuallyNavigated: (value: boolean) => void;
  // Transient per-question UI state (answer input, feedback overlay, dismissed state).
  // Centralized here so navigation *always* clears it — prevents stale "Correct!" etc.
  // when advancing questions. This makes the behavior automatic for any subject using the hook.
  answer: string;
  setAnswer: (next: string | ((prev: string) => string)) => void;
  feedback: FeedbackState;
  setFeedback: (next: FeedbackState | ((prev: FeedbackState) => FeedbackState)) => void;
  overlayDismissed: boolean;
  setOverlayDismissed: (next: boolean | ((prev: boolean) => boolean)) => void;
}

type TransientState = {
  answer: string;
  feedback: FeedbackState;
  overlayDismissed: boolean;
};

const EMPTY_TRANSIENT: TransientState = {
  answer: "",
  feedback: null,
  overlayDismissed: false,
};

/**
 * Custom hook that encapsulates the core state and logic for a practice session.
 * This is the foundation for making the practice experience reusable across subjects.
 */
export function usePracticeSession({
  problems: allProblems,
  completedProblemIds,
  onManualNavigate,
  sectionFilter,
  focusId,
}: UsePracticeSessionOptions): UsePracticeSessionReturn {
  const [manualIndex, setManualIndex] = useState<number | null>(null);
  const [shuffledProblems, setShuffledProblems] = useState<Problem[] | null>(null);
  const [hasManuallyNavigated, setHasManuallyNavigated] = useState(false);
  const [transientByProblem, setTransientByProblem] = useState<Record<string, TransientState>>({});

  // Apply section filter if provided (memoized for stable object ref to avoid effect re-runs / update loops)
  const filteredProblems = useMemo(
    () => (sectionFilter ? allProblems.filter((p) => p.section === sectionFilter) : allProblems),
    [allProblems, sectionFilter]
  );

  const displayProblems = useMemo(
    () => shuffledProblems ?? filteredProblems,
    [shuffledProblems, filteredProblems]
  );

  const autoIndex = useMemo(() => {
    if (focusId) {
      const focusIdx = displayProblems.findIndex((p) => p.id === focusId);
      if (focusIdx >= 0) return focusIdx;
    }

    const completedSet = new Set(completedProblemIds);
    const firstUnsolved = displayProblems.findIndex((p) => !completedSet.has(p.id));
    return firstUnsolved >= 0 ? firstUnsolved : 0;
  }, [completedProblemIds, displayProblems, focusId]);

  const index = hasManuallyNavigated && manualIndex !== null ? manualIndex : autoIndex;
  const current = displayProblems[index];

  const solvedCount = useMemo(() => {
    const baseProblems = sectionFilter
      ? allProblems.filter((p) => p.section === sectionFilter)
      : allProblems;
    return completedProblemIds.filter((id) =>
      baseProblems.some((p) => p.id === id)
    ).length;
  }, [completedProblemIds, allProblems, sectionFilter]);

  // Derive statuses from global progress (useMemo instead of useEffect+setState to prevent "setState inside useEffect" + max update depth loops
  // when displayProblems or completed refs change identity on renders).
  const questionStatuses = useMemo<QuestionStatus[]>(() => {
    return displayProblems.map((problem) => {
      if (completedProblemIds.includes(problem.id)) {
        return "solved" as QuestionStatus;
      }
      return "not-attempted" as QuestionStatus;
    });
  }, [displayProblems, completedProblemIds]);

  const currentId = current?.id ?? "";
  const transient = transientByProblem[currentId] ?? EMPTY_TRANSIENT;
  const { answer, feedback, overlayDismissed } = transient;

  const updateTransient = (
    updater: (prev: TransientState) => TransientState,
    problemId: string = currentId
  ) => {
    if (!problemId) return;
    setTransientByProblem((prev) => ({
      ...prev,
      [problemId]: updater(prev[problemId] ?? EMPTY_TRANSIENT),
    }));
  };

  const setAnswer = (next: string | ((prev: string) => string)) => {
    updateTransient((prev) => ({
      ...prev,
      answer: typeof next === "function" ? next(prev.answer) : next,
    }));
  };

  const setFeedback = (next: FeedbackState | ((prev: FeedbackState) => FeedbackState)) => {
    updateTransient((prev) => ({
      ...prev,
      feedback: typeof next === "function" ? next(prev.feedback) : next,
    }));
  };

  const setOverlayDismissed = (next: boolean | ((prev: boolean) => boolean)) => {
    updateTransient((prev) => ({
      ...prev,
      overlayDismissed: typeof next === "function" ? next(prev.overlayDismissed) : next,
    }));
  };

  const clearTransientState = (problemId: string = currentId) => {
    if (!problemId) return;
    setTransientByProblem((prev) => {
      if (!(problemId in prev)) return prev;
      const next = { ...prev };
      delete next[problemId];
      return next;
    });
  };

  const setIndex = (newIndex: number) => {
    clearTransientState();
    setHasManuallyNavigated(true);
    onManualNavigate?.();
    setManualIndex(newIndex);
  };

  const goToNext = () => {
    clearTransientState();
    setHasManuallyNavigated(true);
    onManualNavigate?.();
    setManualIndex(Math.min(displayProblems.length - 1, index + 1));
  };

  const goToPrev = () => {
    clearTransientState();
    setHasManuallyNavigated(true);
    onManualNavigate?.();
    setManualIndex(Math.max(0, index - 1));
  };

  const shuffleAndRestart = () => {
    const base = sectionFilter
      ? allProblems.filter((p) => p.section === sectionFilter)
      : allProblems;
    const shuffled = [...base].sort(() => Math.random() - 0.5);
    setShuffledProblems(shuffled);
    setManualIndex(0);
    setHasManuallyNavigated(false);
    setTransientByProblem({});
  };

  return {
    displayProblems,
    index,
    setIndex,
    current,
    questionStatuses,
    hasManuallyNavigated,
    solvedCount,
    goToNext,
    goToPrev,
    shuffleAndRestart,
    setHasManuallyNavigated,
    answer,
    setAnswer,
    feedback,
    setFeedback,
    overlayDismissed,
    setOverlayDismissed,
  };
}