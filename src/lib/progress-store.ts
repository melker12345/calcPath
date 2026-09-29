/**
 * The progress store: one module-level copy of the learner's progress, backed
 * by localStorage and shared by every component on the page through
 * `useSyncExternalStore` (see use-progress.ts).
 *
 * Why a store rather than React state in a provider: progress is external
 * state (the browser's storage). Reading it through useSyncExternalStore gives
 * a hydration-safe empty snapshot on the server and during hydration, then the
 * stored state, with no setState-in-effect; and two components on one page —
 * the contents list and a "mark as read" button — always see the same value.
 */

import { readStorage, writeStorage } from "@/lib/storage";
import { type ProgressState, createEmptyProgress, normalizeProgressState } from "@/lib/progress";

export const PROGRESS_KEY = "calc_progress_v2";
/** Pre-September-2026 key. Read once for migration, never written again. */
const LEGACY_PROGRESS_KEY = "calc_progress_v1";

/** Stable empty state: the server snapshot must be referentially stable. */
const EMPTY: ProgressState = createEmptyProgress();

let cached: ProgressState | null = null;
const listeners = new Set<() => void>();

function loadStoredProgress(): ProgressState {
  const v2 = readStorage<unknown>(PROGRESS_KEY, null);
  if (v2) return normalizeProgressState(v2);
  const v1 = readStorage<unknown>(LEGACY_PROGRESS_KEY, null);
  if (v1) {
    const migrated = normalizeProgressState(v1);
    writeStorage(PROGRESS_KEY, migrated);
    return migrated;
  }
  return EMPTY;
}

function emit() {
  for (const listener of listeners) listener();
}

function onStorage(e: StorageEvent) {
  // Another tab wrote progress (or cleared storage): follow it.
  if (e.key === PROGRESS_KEY || e.key === LEGACY_PROGRESS_KEY || e.key === null) {
    cached = loadStoredProgress();
    emit();
  }
}

export function getProgressSnapshot(): ProgressState {
  if (cached === null) cached = loadStoredProgress();
  return cached;
}

export function getProgressServerSnapshot(): ProgressState {
  return EMPTY;
}

export function subscribeProgress(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1 && typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function updateProgress(fn: (prev: ProgressState) => ProgressState): void {
  cached = fn(getProgressSnapshot());
  writeStorage(PROGRESS_KEY, cached);
  emit();
}
