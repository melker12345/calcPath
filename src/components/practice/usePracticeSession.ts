"use client";

import { useState, useEffect, useMemo } from "react";
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
  const [index, setIndexState] = useState(0);
  const [shuffledProblems, setShuffledProblems] = useState<Problem[] | null>(null);
  const [hasManuallyNavigated, setHasManuallyNavigated] = useState(false);

  // Transient per-question UI state — owned by the hook so that *all* navigation
  // paths (Next, Prev, Shuffle, dots click, "Skip", feedback overlay buttons)
  // automatically clear previous question's feedback/answer/overlay.
  // This eliminates the per-page "clear before navigate" boilerplate and the
  // stale "Correct!" bug that reappears when the pattern isn't followed perfectly.
  const [answer, setAnswerState] = useState("");
  const [feedback, setFeedbackState] = useState<FeedbackState>(null);
  const [overlayDismissed, setOverlayDismissedState] = useState(false);

  // Support both direct value and functional updater (like real useState) so existing
  // call sites (e.g. onShowSolution that do setFeedback(prev => ...)) continue to work.
  const setAnswer = (next: string | ((prev: string) => string)) => {
    if (typeof next === "function") {
      setAnswerState((prev) => (next as (p: string) => string)(prev));
    } else {
      setAnswerState(next);
    }
  };

  const setFeedback = (next: FeedbackState | ((prev: FeedbackState) => FeedbackState)) => {
    if (typeof next === "function") {
      setFeedbackState((prev) => (next as (p: FeedbackState) => FeedbackState)(prev));
    } else {
      setFeedbackState(next);
    }
  };

  const setOverlayDismissed = (next: boolean | ((prev: boolean) => boolean)) => {
    if (typeof next === "function") {
      setOverlayDismissedState((prev) => (next as (p: boolean) => boolean)(prev));
    } else {
      setOverlayDismissedState(next);
    }
  };

  // Apply section filter if provided (memoized for stable object ref to avoid effect re-runs / update loops)
  const filteredProblems = useMemo(
    () => (sectionFilter ? allProblems.filter((p) => p.section === sectionFilter) : allProblems),
    [allProblems, sectionFilter]
  );

  const displayProblems = useMemo(
    () => shuffledProblems ?? filteredProblems,
    [shuffledProblems, filteredProblems]
  );

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

  // Helper to wipe per-question transient UI (answer, feedback overlay, etc.)
  // Called from every navigation entry point below.
  const clearTransientState = () => {
    setAnswer("");
    setFeedback(null);
    setOverlayDismissed(false);
  };

  // Auto-resume to first unsolved question on mount / when progress updates,
  // unless the user has manually navigated or a focusId is provided.
  useEffect(() => {
    if (hasManuallyNavigated) return;

    // Deep link support
    if (focusId) {
      const focusIdx = displayProblems.findIndex((p) => p.id === focusId);
      if (focusIdx >= 0) {
        clearTransientState();
        setIndexState(focusIdx);
        return;
      }
    }

    const completedSet = new Set(completedProblemIds);
    const firstUnsolved = displayProblems.findIndex((p) => !completedSet.has(p.id));

    if (firstUnsolved >= 0 && firstUnsolved !== index) {
      clearTransientState();
      setIndexState(firstUnsolved);
    }
  }, [completedProblemIds, displayProblems, focusId, hasManuallyNavigated]);

  const setIndex = (newIndex: number) => {
    clearTransientState();
    setHasManuallyNavigated(true);
    onManualNavigate?.();
    setIndexState(newIndex);
  };

  const goToNext = () => {
    clearTransientState();
    setHasManuallyNavigated(true);
    onManualNavigate?.();
    setIndexState((prev) => Math.min(displayProblems.length - 1, prev + 1));
  };

  const goToPrev = () => {
    clearTransientState();
    setHasManuallyNavigated(true);
    onManualNavigate?.();
    setIndexState((prev) => Math.max(0, prev - 1));
  };

  const shuffleAndRestart = () => {
    clearTransientState();
    const base = sectionFilter
      ? allProblems.filter((p) => p.section === sectionFilter)
      : allProblems;
    const shuffled = [...base].sort(() => Math.random() - 0.5);
    setShuffledProblems(shuffled);
    setIndexState(0);
    setHasManuallyNavigated(false);
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
