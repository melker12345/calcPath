"use client";

import { useProgress } from "@/components/progress-provider";
import { chapterKey } from "@/lib/progress";

/**
 * "Mark this chapter as read" control: `<MarkChapterRead subject topicId />`.
 * Works anywhere on the client; no provider needed (progress is a shared store).
 */
export function MarkChapterRead({ subject, topicId }: { subject: string; topicId: string }) {
  const { progress, toggleChapterRead } = useProgress();
  const key = chapterKey(subject, topicId);
  const read = progress.readChapters.includes(key);
  return (
    <button
      type="button"
      onClick={() => toggleChapterRead(key)}
      aria-pressed={read}
      data-no-print
      className={`border px-3 py-1.5 text-sm ${
        read ? "border-[var(--accent)] text-[var(--accent)]" : "theme-border theme-text"
      }`}
    >
      {read ? "Read ✓ · mark unread" : "Mark chapter as read"}
    </button>
  );
}
