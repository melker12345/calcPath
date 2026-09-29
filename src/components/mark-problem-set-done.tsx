"use client";

/**
 * "Mark this problem set as done" control for a printable sheet.
 *
 * CONTRACT: `<MarkProblemSetDone subject={slug} topicId={id} />`. The
 * cb-progress branch replaces the body with the real control.
 */
export function MarkProblemSetDone({ subject, topicId }: { subject: string; topicId: string }) {
  void subject;
  void topicId;
  return null;
}
