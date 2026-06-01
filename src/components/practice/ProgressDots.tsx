"use client";

import type { QuestionStatus } from "./types";

interface ProgressDotsProps {
  statuses: QuestionStatus[];
  currentIndex: number;
  onSelect: (index: number) => void;
  className?: string;
}

/**
 * Reusable progress dots component for practice sessions.
 * Shows colored dots for each question (solved, wrong, hint-used, not-attempted)
 * and allows clicking to jump between questions.
 */
export function ProgressDots({
  statuses,
  currentIndex,
  onSelect,
  className = "",
}: ProgressDotsProps) {
  return (
    <div className={`flex w-full justify-center ${className}`}>
      <div className="flex items-center gap-2">
        <div className="flex flex-wrap justify-center gap-1.5 max-w-[380px] sm:max-w-[520px]">
          {statuses.map((status, i) => {
            let colorClass = "bg-zinc-300 dark:bg-zinc-600"; // not-attempted

            if (status === "solved") {
              colorClass = "bg-emerald-500";
            } else if (status === "hint-used") {
              colorClass = "bg-amber-500";
            } else if (status === "wrong") {
              colorClass = "bg-red-500";
            }

            const isActive = i === currentIndex;

            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelect(i)}
                className={`h-2.5 w-2.5 rounded-full transition-all ${colorClass} ${
                  isActive
                    ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[var(--surface)] ring-zinc-400"
                    : ""
                }`}
                aria-label={`Go to question ${i + 1}`}
                title={
                  status === "solved"
                    ? "Solved"
                    : status === "hint-used"
                    ? "Used hint"
                    : status === "wrong"
                    ? "Incorrect"
                    : "Not attempted"
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
