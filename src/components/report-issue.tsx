"use client";

/**
 * Report a problem with a chapter section or a practice question.
 *
 * CONTRACT (shared by the chapter page, the practice page and the feedback
 * work): keep these props stable. The cb-feedback branch replaces the body of
 * this file with the real form; other branches only import it.
 */
export type ReportTarget =
  | { kind: "question"; subject: string; topicId: string; questionId: string; section?: string }
  | { kind: "chapter"; subject: string; topicId: string; section?: string };

export function ReportIssue({
  target,
  context,
}: {
  target: ReportTarget;
  /** What the learner did (submitted answers, hint use…) — attached to the report. */
  context?: Record<string, unknown>;
}) {
  void target;
  void context;
  return null;
}
