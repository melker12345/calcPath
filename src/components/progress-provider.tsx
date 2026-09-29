"use client";

import React, { useMemo, useSyncExternalStore } from "react";
import {
  type Attempt,
  type ProgressState,
  normalizeProgressState,
  createEmptyProgress,
  recordAttempt,
  toggleChapterRead as toggleChapterReadState,
  toggleProblemSetDone as toggleProblemSetDoneState,
} from "@/lib/progress";
import {
  getProgressServerSnapshot,
  getProgressSnapshot,
  subscribeProgress,
  updateProgress,
} from "@/lib/progress-store";

export { PROGRESS_KEY } from "@/lib/progress-store";

type ProgressContextValue = {
  progress: ProgressState;
  /** False on the server and during hydration, true once the stored state is in use. */
  hydrated: boolean;
  addAttempt: (attempt: Attempt) => void;
  toggleChapterRead: (key: string) => void;
  toggleProblemSetDone: (key: string) => void;
  resetProgress: () => void;
  /** Replace the stored progress with an imported blob (normalized first). */
  importProgress: (data: unknown) => void;
};

/**
 * Kept for callers that wrap a subtree in a provider (ProgressBoundary). The
 * state itself lives in the module-level store, so the provider is only a
 * marker: `useProgress()` works anywhere on the client.
 */
export const ProgressProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const subscribeHydrated = () => () => {};

export const useProgress = (): ProgressContextValue => {
  const progress = useSyncExternalStore(subscribeProgress, getProgressSnapshot, getProgressServerSnapshot);
  const hydrated = useSyncExternalStore(
    subscribeHydrated,
    () => true,
    () => false,
  );

  return useMemo<ProgressContextValue>(
    () => ({
      progress,
      hydrated,
      addAttempt: (attempt) => updateProgress((prev) => recordAttempt(prev, attempt)),
      toggleChapterRead: (key) => updateProgress((prev) => toggleChapterReadState(prev, key)),
      toggleProblemSetDone: (key) => updateProgress((prev) => toggleProblemSetDoneState(prev, key)),
      resetProgress: () => updateProgress(() => createEmptyProgress()),
      importProgress: (data) => updateProgress(() => normalizeProgressState(data)),
    }),
    [progress, hydrated],
  );
};
