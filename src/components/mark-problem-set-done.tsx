"use client";

import { useProgress } from "@/lib/use-progress";
import { chapterKey } from "@/lib/progress";

/**
 * "Mark this problem set as done" control: `<MarkProblemSetDone subject topicId />`.
 * Works anywhere on the client; no provider needed (progress is a shared store).
 */
export function MarkProblemSetDone({ subject, topicId }: { subject: string; topicId: string }) {
  const { progress, toggleProblemSetDone } = useProgress();
  const key = chapterKey(subject, topicId);
  const done = progress.completedProblemSets.includes(key);
  return (
    <button
      type="button"
      onClick={() => toggleProblemSetDone(key)}
      aria-pressed={done}
      data-no-print
      className={`border px-3 py-1.5 text-sm ${
        done ? "border-[var(--accent)] text-[var(--accent)]" : "theme-border theme-text"
      }`}
    >
      {done ? "Done ✓ · mark not done" : "Mark problem set as done"}
    </button>
  );
}
