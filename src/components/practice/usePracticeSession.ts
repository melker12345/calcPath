"use client";

import { useState, useEffect, useMemo } from "react";
import type { Problem } from "@/lib/shared-types";
import type { QuestionStatus } from "./types";

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
  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus[]>([]);

  // Apply section filter if provided
  const filteredProblems = sectionFilter
    ? allProblems.filter((p) => p.section === sectionFilter)
    : allProblems;

  const displayProblems = shuffledProblems ?? filteredProblems;

  const current = displayProblems[index];

  const solvedCount = useMemo(() => {
    const baseProblems = sectionFilter
      ? allProblems.filter((p) => p.section === sectionFilter)
      : allProblems;
    return completedProblemIds.filter((id) =>
      baseProblems.some((p) => p.id === id)
    ).length;
  }, [completedProblemIds, allProblems, sectionFilter]);

  // Sync statuses from global progress
  useEffect(() => {
    const statuses = displayProblems.map((problem) => {
      if (completedProblemIds.includes(problem.id)) {
        return "solved" as QuestionStatus;
      }
      return "not-attempted" as QuestionStatus;
    });
    setQuestionStatuses(statuses);
  }, [displayProblems, completedProblemIds]);

  // Auto-resume to first unsolved question on mount / when progress updates,
  // unless the user has manually navigated or a focusId is provided.
  useEffect(() => {
    if (hasManuallyNavigated) return;

    // Deep link support
    if (focusId) {
      const focusIdx = displayProblems.findIndex((p) => p.id === focusId);
      if (focusIdx >= 0) {
        setIndexState(focusIdx);
        return;
      }
    }

    const completedSet = new Set(completedProblemIds);
    const firstUnsolved = displayProblems.findIndex((p) => !completedSet.has(p.id));

    if (firstUnsolved >= 0 && firstUnsolved !== index) {
      setIndexState(firstUnsolved);
    }
  }, [completedProblemIds, displayProblems, focusId, hasManuallyNavigated]);

  const setIndex = (newIndex: number) => {
    setHasManuallyNavigated(true);
    onManualNavigate?.();
    setIndexState(newIndex);
  };

  const goToNext = () => {
    setHasManuallyNavigated(true);
    onManualNavigate?.();
    setIndexState((prev) => Math.min(displayProblems.length - 1, prev + 1));
  };

  const goToPrev = () => {
    setHasManuallyNavigated(true);
    onManualNavigate?.();
    setIndexState((prev) => Math.max(0, prev - 1));
  };

  const shuffleAndRestart = () => {
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
  };
}
