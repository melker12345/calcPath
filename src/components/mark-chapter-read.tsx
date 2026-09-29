"use client";

/**
 * "Mark this chapter as read" control.
 *
 * CONTRACT: `<MarkChapterRead subject={slug} topicId={id} />`. The cb-progress
 * branch replaces the body with the real control wired to the progress store.
 */
export function MarkChapterRead({ subject, topicId }: { subject: string; topicId: string }) {
  void subject;
  void topicId;
  return null;
}
