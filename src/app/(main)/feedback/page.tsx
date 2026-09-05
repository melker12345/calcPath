"use client";

import { useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { supabase } from "@/lib/supabase/client";

const FEEDBACK_KINDS = [
  { id: "bug", label: "Bug" },
  { id: "feature", label: "Feature idea" },
  { id: "general", label: "General" },
] as const;

type FeedbackKind = (typeof FEEDBACK_KINDS)[number]["id"];

export default function FeedbackPage() {
  const [kind, setKind] = useState<FeedbackKind>("general");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const radioRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const canSubmit = status !== "sending" && message.trim().length >= 3;

  const handleRadioKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      next = (idx + 1) % FEEDBACK_KINDS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      next = (idx - 1 + FEEDBACK_KINDS.length) % FEEDBACK_KINDS.length;
    }
    if (next !== null) {
      e.preventDefault();
      setKind(FEEDBACK_KINDS[next].id);
      radioRefs.current[next]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || trimmed.length < 3) return;

    setStatus("sending");
    try {
      // Attribute the feedback when signed in; anonymous submissions still work.
      let accessToken: string | undefined;
      try {
        const { data } = await supabase.auth.getSession();
        accessToken = data.session?.access_token ?? undefined;
      } catch {
        // No session available — submit anonymously.
      }

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          kind,
          message: trimmed,
          page_url: window.location.href,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      trackEvent("feedback_submitted", { kind });
      setStatus("sent");
      setMessage("");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-16 sm:px-6 sm:py-24">
        <div role="status" className="text-center">
          <h1 className="font-serif text-3xl font-semibold tracking-tight theme-text">
            Thanks for your feedback
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed theme-text-secondary">
            We read every submission. Your input helps make CalcPath better for everyone.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-8 inline-flex items-center justify-center rounded-xl border theme-border px-5 py-2.5 text-sm font-medium theme-text-secondary transition hover:border-[var(--accent)]/35 hover:bg-[var(--surface-2)] hover:theme-text active:scale-[0.98]"
          >
            Send more feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6 sm:py-20">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-semibold tracking-tight theme-text sm:text-4xl">
          Feedback
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed theme-text-secondary">
          Found a bug, have an idea, or just want to share a thought? Let us know — every
          message helps shape CalcPath.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10">
        {/* Kind selector */}
        <fieldset>
          <legend className="mb-3 text-sm font-medium theme-text">
            What kind of feedback is this?
          </legend>
          <div
            role="radiogroup"
            aria-label="Kind of feedback"
            className="flex flex-wrap gap-2.5"
          >
            {FEEDBACK_KINDS.map((k, idx) => {
              const active = kind === k.id;
              return (
                <button
                  key={k.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  tabIndex={active ? 0 : -1}
                  ref={(el) => {
                    radioRefs.current[idx] = el;
                  }}
                  onClick={() => setKind(k.id)}
                  onKeyDown={(e) => handleRadioKeyDown(e, idx)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition active:scale-95 ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 font-semibold text-[var(--accent)]"
                      : "theme-border bg-[var(--surface)] theme-text-secondary hover:border-[var(--accent)]/40"
                  }`}
                >
                  {active && <span aria-hidden>✓</span>}
                  {k.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Message */}
        <div className="mt-7">
          <label htmlFor="feedback-message" className="mb-2 block text-sm font-medium theme-text">
            Your message
          </label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            maxLength={5000}
            required
            minLength={3}
            placeholder={
              kind === "bug"
                ? "Describe what happened and what you expected…"
                : kind === "feature"
                  ? "What would you like to see added or changed?"
                  : "Share your thoughts…"
            }
            className="w-full resize-y rounded-xl border-2 theme-border bg-[var(--surface)] px-4 py-3 text-sm theme-text outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
          />
          <p className="mt-1.5 text-right text-xs theme-text-muted">
            {message.length}/5000
          </p>
        </div>

        {/* Error message */}
        {status === "error" && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
          >
            Something went wrong. Please try again.
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className={`mt-6 w-full rounded-xl py-3.5 text-sm font-semibold transition active:scale-[0.99] ${
            canSubmit
              ? "bg-[var(--accent)] text-[var(--accent-text)] shadow-sm hover:opacity-90"
              : "cursor-not-allowed border-2 theme-border bg-[var(--surface-2)] theme-text-muted"
          }`}
        >
          {status === "sending" ? "Sending…" : "Send feedback"}
        </button>
      </form>
    </div>
  );
}
