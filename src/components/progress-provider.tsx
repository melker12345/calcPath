"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { readStorage, writeStorage } from "@/lib/storage";
import {
  Attempt,
  ProgressState,
  createEmptyProgress,
  recordAttempt,
} from "@/lib/progress";

type ProgressContextValue = {
  progress: ProgressState;
  addAttempt: (attempt: Attempt) => void;
  resetProgress: () => void;
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

  // Load from localStorage after mount (client-only) to avoid hydration mismatch
  useEffect(() => {
    const stored = readStorage<ProgressState>(PROGRESS_KEY, createEmptyProgress());
    setProgress(stored);
  }, []);

  const addAttempt = (attempt: Attempt) => {
    setProgress((prev) => {
      const next = recordAttempt(prev, attempt);
      writeStorage(PROGRESS_KEY, next);
      return next;
    });
  };

  const resetProgress = () => {
    const next = createEmptyProgress();
    setProgress(next);
    writeStorage(PROGRESS_KEY, next);
  };

  const value = useMemo(
    () => ({
      progress,
      addAttempt,
      resetProgress,
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
    throw new Error("useProgress must be used within ProgressProvider");
  }
  return context;
};
