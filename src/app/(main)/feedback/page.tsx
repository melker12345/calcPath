"use client";

import { useState } from "react";
import { MESSAGE_MAX, SITE_REASONS, type ReportInput } from "@/lib/reports";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Site-level feedback. Content problems are better reported from the chapter
 * or question itself, where the report picks up the exact item automatically;
 * this page is for everything else.
 */
export default function FeedbackPage() {
  const [reason, setReason] = useState<string>(SITE_REASONS[0]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const max = MESSAGE_MAX.site;
  const canSubmit = status !== "sending" && message.trim().length >= 3;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("sending");
    setError(null);
    const body: ReportInput = {
      kind: "site",
      reason,
      message: message.trim(),
      pageUrl: window.location.href,
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
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-serif text-3xl font-semibold tracking-tight theme-text">Feedback</h1>
      <p className="mt-3 text-[15px] leading-relaxed theme-text-secondary">
        A mistake in a chapter or a question is best reported from that page with
        the <em>Report a problem</em> link, which records exactly which item you mean.
        Use this form for anything else about the site.
      </p>

      {status === "sent" ? (
        <div role="status" className="mt-8 border theme-border p-4 text-sm theme-text-secondary">
          Thank you. Every report is read.{" "}
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="underline underline-offset-2"
          >
            Send another
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 text-sm">
          <fieldset>
            <legend className="mb-2 font-medium theme-text">What is this about?</legend>
            <div className="flex flex-col gap-1.5">
              {SITE_REASONS.map((r) => (
                <label key={r} className="flex cursor-pointer items-center gap-2 theme-text-secondary">
                  <input
                    type="radio"
                    name="site-reason"
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

          <label htmlFor="feedback-message" className="mt-5 block font-medium theme-text">
            Message
          </label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            maxLength={max}
            required
            minLength={3}
            placeholder={
              reason === "Site bug"
                ? "What happened, on which page, and what you expected."
                : "What would make the site more useful?"
            }
            className="mt-1 w-full resize-y border theme-border bg-[var(--surface)] px-3 py-2 theme-text outline-none focus:border-[var(--accent)]"
          />
          <p className="mt-1 text-right text-xs theme-text-muted">
            {message.length}/{max}
          </p>

          {error && (
            <p role="alert" className="mt-3 text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-4 border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 font-medium text-[var(--accent-text)] disabled:opacity-50"
          >
            {status === "sending" ? "Sending…" : "Send"}
          </button>
        </form>
      )}
    </div>
  );
}
