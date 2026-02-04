"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { readStorage, writeStorage } from "@/lib/storage";
import { supabase } from "@/lib/supabase/client";
import {
  Attempt,
  ProgressState,
  createEmptyProgress,
  recordAttempt,
} from "@/lib/progress";
import { useAuth } from "@/components/auth-provider";

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
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressState>(createEmptyProgress());

  useEffect(() => {
    let cancelled = false;

    const loadAnonymous = () => {
      const stored = readStorage<ProgressState>(PROGRESS_KEY, createEmptyProgress());
      if (!cancelled) setProgress(stored);
    };

    const loadAuthed = async (userId: string) => {
      // Prefer Supabase state; if none exists, fall back to local and upload.
      const { data, error } = await supabase
        .from("user_progress")
        .select("state")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        // eslint-disable-next-line no-console
        console.warn("Failed to load user_progress:", error.message);
        loadAnonymous();
        return;
      }

      if (data?.state) {
        if (!cancelled) setProgress(data.state as ProgressState);
        return;
      }

      const local = readStorage<ProgressState>(PROGRESS_KEY, createEmptyProgress());
      if (!cancelled) setProgress(local);

      // Best-effort initial upload so progress follows the account.
      await supabase.from("user_progress").upsert(
        {
          user_id: userId,
          state: local,
        },
        { onConflict: "user_id" },
      );
    };

    if (!user?.id) {
      loadAnonymous();
      return () => {
        cancelled = true;
      };
    }

    loadAuthed(user.id);
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const addAttempt = (attempt: Attempt) => {
    setProgress((prev) => {
      const next = recordAttempt(prev, attempt);
      // Always keep a local cache; sync to Supabase if signed in.
      writeStorage(PROGRESS_KEY, next);
      if (user?.id) {
        supabase
          .from("user_progress")
          .upsert({ user_id: user.id, state: next }, { onConflict: "user_id" })
          .then(({ error }) => {
            if (error) {
              // eslint-disable-next-line no-console
              console.warn("Failed to save progress:", error.message);
            }
          });
      }
      return next;
    });
  };

  const resetProgress = () => {
    const next = createEmptyProgress();
    setProgress(next);
    writeStorage(PROGRESS_KEY, next);
    if (user?.id) {
      supabase
        .from("user_progress")
        .upsert({ user_id: user.id, state: next }, { onConflict: "user_id" })
        .then(({ error }) => {
          if (error) {
            // eslint-disable-next-line no-console
            console.warn("Failed to reset progress remotely:", error.message);
          }
        });
    }
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
