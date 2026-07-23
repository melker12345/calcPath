"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { readStorage, writeStorage } from "@/lib/storage";
import {
  Attempt,
  ProgressState,
  TestResult,
  createEmptyProgress,
  normalizeProgressState,
  recordAttempt,
  recordDiagnosticResult,
  recordTestResult,
} from "@/lib/progress";
import type { DiagnosticResult } from "@/lib/diagnostics";

type ProgressContextValue = {
  progress: ProgressState;
  addAttempt: (attempt: Attempt) => void;
  addTestResult: (result: TestResult) => void;
  addDiagnosticResult: (result: DiagnosticResult) => void;
  resetProgress: () => void;
  applySyncedProgress: (synced: ProgressState) => void;
};

const PROGRESS_KEY = "calc_progress_v1";

const ProgressContext = createContext<ProgressContextValue | undefined>(
  undefined,
);

export const ProgressProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [progress, setProgress] = useState<ProgressState>(createEmptyProgress());

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      const stored = readStorage<ProgressState | Partial<ProgressState>>(
        PROGRESS_KEY,
        createEmptyProgress(),
      );
      if (!cancelled) setProgress(normalizeProgressState(stored as Partial<ProgressState>));
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const addAttempt = (attempt: Attempt) => {
    setProgress((prev) => {
      const next = recordAttempt(prev, attempt);
      writeStorage(PROGRESS_KEY, next);
      return next;
    });
  };

  const addTestResult = (result: TestResult) => {
    setProgress((prev) => {
      const next = recordTestResult(prev, result);
      writeStorage(PROGRESS_KEY, next);
      return next;
    });
  };

  const addDiagnosticResult = (result: DiagnosticResult) => {
    setProgress((prev) => {
      const next = recordDiagnosticResult(prev, result);
      writeStorage(PROGRESS_KEY, next);
      return next;
    });
  };

  const resetProgress = () => {
    const next = createEmptyProgress();
    setProgress(next);
    writeStorage(PROGRESS_KEY, next);
  };

  const applySyncedProgress = (synced: ProgressState) => {
    const next = normalizeProgressState(synced as Partial<ProgressState>);
    setProgress(next);
    writeStorage(PROGRESS_KEY, next);
  };

  const value = useMemo(
    () => ({
      progress,
      addAttempt,
      addTestResult,
      addDiagnosticResult,
      resetProgress,
      applySyncedProgress,
    }),
    [progress],
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    // Safe default for read-only surfaces (e.g. home page mastery indicators in
    // CourseContentsPage when used outside a ProgressBoundary). Mutations will be no-ops
    // (no provider = no persistence for that tree). Practice/dashboard etc always provide.
    // This enables granular components like CourseContentsPage to be dropped into
    // server-driven home pages without forcing provider wrappers on every caller.
    const noopProgress = createEmptyProgress();
    const noop = () => {};
    return {
      progress: noopProgress,
      addAttempt: noop,
      addTestResult: noop,
      addDiagnosticResult: noop,
      resetProgress: noop,
      applySyncedProgress: noop,
    } satisfies ProgressContextValue;
  }
  return context;
};
