"use client";

import { useId, useState } from "react";
import { CHAPTER_REASONS, MESSAGE_MAX, QUESTION_REASONS, type ReportInput } from "@/lib/reports";

/**
 * Report a problem with a chapter section or a practice question.
 *
 * CONTRACT (shared by the chapter page and the practice page): keep these
 * props stable.
 *
 * A plain text button; clicking it reveals an inline form (no modal): a reason,
 * an optional message, submit. The server snapshots the reported content from
 * disk, so the form only has to say *where* and *why*.
 */
export type ReportTarget =
  | { kind: "question"; subject: string; topicId: string; questionId: string; section?: string }
  | { kind: "chapter"; subject: string; topicId: string; section?: string };

type Status = "idle" | "sending" | "sent" | "error";

export function ReportIssue({
  target,
  context,
}: {
  target: ReportTarget;
  /** What the learner did (submitted answers, hint use…) — attached to the report. */
  context?: Record<string, unknown>;
}) {
  const reasons = target.kind === "question" ? QUESTION_REASONS : CHAPTER_REASONS;
  const max = MESSAGE_MAX[target.kind];
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(reasons[0]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const needsMessage = reason === "Other";
  const canSubmit = status !== "sending" && (!needsMessage || message.trim().length >= 3);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("sending");
    setError(null);
    const body: ReportInput = {
      kind: target.kind,
      subject: target.subject,
      topicId: target.topicId,
      section: target.section,
      questionId: target.kind === "question" ? target.questionId : undefined,
      reason,
      message: message.trim() || undefined,
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      learner: target.kind === "question" ? context : undefined,
    };
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || `Request failed (${res.status})`);
      }
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <p role="status" className="text-sm theme-text-secondary">
        Report sent, thank you.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm theme-text-secondary underline underline-offset-2 hover:underline"
      >
        Report a problem
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="border theme-border bg-[var(--surface)] p-4 text-sm">
      <fieldset>
        <legend className="mb-2 font-medium theme-text">
          {target.kind === "question" ? "What is wrong with this question?" : "What is wrong with this section?"}
        </legend>
        <div className="flex flex-col gap-1.5">
          {reasons.map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-2 theme-text-secondary">
              <input
                type="radio"
                name={`${uid}-reason`}
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
                className="accent-[var(--accent)]"
              />
              {r}
            </label>
          ))}
        </div>
      </fieldset>

      <label htmlFor={`${uid}-message`} className="mt-4 block font-medium theme-text">
        Details {needsMessage ? "(required)" : "(optional)"}
      </label>
      <textarea
        id={`${uid}-message`}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        maxLength={max}
        required={needsMessage}
        placeholder={
          target.kind === "question"
            ? "For a rejected answer, say exactly what you typed."
            : "Which sentence or formula, and what should it say?"
        }
        className="mt-1 w-full resize-y border theme-border bg-[var(--bg)] px-3 py-2 theme-text outline-none focus:border-[var(--accent)]"
      />
      <p className="mt-1 text-right text-xs theme-text-muted">
        {message.length}/{max}
      </p>

      {error && (
        <p role="alert" className="mt-2 text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className="border border-[var(--accent)] bg-[var(--accent)] px-4 py-1.5 font-medium text-[var(--accent-text)] disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send report"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setStatus("idle");
            setError(null);
          }}
          className="theme-text-secondary underline underline-offset-2 hover:underline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
