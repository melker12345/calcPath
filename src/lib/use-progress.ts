/**
 * `useProgress()` — the learner's progress for any client component.
 *
 * State lives in the module-level store (src/lib/progress-store.ts), backed by
 * localStorage and read through `useSyncExternalStore`, so there is no
 * provider to wrap: the hook works anywhere on the client and every component
 * on a page sees the same value.
 */

import { useMemo, useSyncExternalStore } from "react";
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
