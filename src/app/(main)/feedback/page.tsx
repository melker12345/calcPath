"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { trackEvent } from "@/lib/analytics";

const FEEDBACK_KINDS = [
  { id: "bug", label: "Bug" },
  { id: "feature", label: "Feature idea" },
  { id: "general", label: "General" },
] as const;

type FeedbackKind = (typeof FEEDBACK_KINDS)[number]["id"];

export default function FeedbackPage() {
  const { user } = useAuth();
  const [kind, setKind] = useState<FeedbackKind>("general");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || trimmed.length < 3) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          message: trimmed,
          user_id: user?.id ?? null,
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
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="theme-card theme-card-light border p-8 text-center sm:p-10">
          <h1 className="text-2xl font-semibold text-stone-950 dark:text-[var(--text-primary)]">Thanks for your feedback.</h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-[var(--text-secondary)]">
            We read every submission. Your input helps make CalcPath better for everyone.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-6 border border-stone-400 bg-white px-5 py-2.5 text-sm font-medium text-stone-900 transition hover:bg-stone-100 active:scale-95 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-[var(--text-primary)] dark:hover:bg-[var(--surface-2)]"
          >
            Send more feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 border-b theme-border pb-5">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950 dark:text-[var(--text-primary)]">Feedback</h1>
        <p className="mt-2 text-base leading-7 text-stone-700 dark:text-[var(--text-secondary)]">
          Any feedback is highly appreciated. If you have an idea, found a bug, or
          just want to share your thoughts — please let us know.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="theme-card theme-card-light border p-6 sm:p-8">
        {/* Kind selector */}
        <fieldset>
          <legend className="mb-3 text-sm font-semibold theme-text">
            What kind of feedback is this?
          </legend>
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setKind(k.id)}
                className={`border px-4 py-2.5 text-sm font-medium transition active:scale-95 ${
                  kind === k.id
                    ? "border-stone-700 bg-stone-100 text-stone-950 dark:border-[var(--border)] dark:bg-[var(--surface-2)] dark:text-[var(--text-primary)]"
                    : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-[var(--text-secondary)] dark:hover:bg-[var(--surface-2)]"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Message */}
        <div className="mt-6">
          <label htmlFor="feedback-message" className="mb-2 block text-sm font-semibold theme-text">
            Your message
          </label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={5000}
            required
            minLength={3}
            placeholder={
              kind === "bug"
                ? "Describe what happened and what you expected..."
                : kind === "feature"
                  ? "What would you like to see added or changed?"
                  : "Share your thoughts..."
            }
            className="w-full resize-y border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 placeholder:text-stone-400 focus:border-stone-600 focus:outline-none dark:border-[var(--border)] dark:bg-[var(--surface-2)] dark:text-[var(--text-primary)] dark:placeholder:text-[var(--text-muted)] dark:focus:border-[var(--accent)]"
          />
          <p className="mt-1 text-right text-xs text-zinc-400 dark:text-[var(--text-muted)]">
            {message.length}/5000
          </p>
        </div>

        {/* Error message */}
        {status === "error" && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            Something went wrong. Please try again.
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={status === "sending" || message.trim().length < 3}
          className="mt-6 w-full border border-stone-900 bg-stone-900 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[var(--border)] dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {status === "sending" ? "Sending..." : "Send Feedback"}
        </button>
      </form>
    </div>
  );
}
