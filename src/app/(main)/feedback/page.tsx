"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { trackEvent } from "@/lib/analytics";

const FEEDBACK_KINDS = [
  { id: "bug", label: "Bug", icon: "🐛" },
  { id: "feature", label: "Feature idea", icon: "💡" },
  { id: "general", label: "General", icon: "💬" },
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
      <div className="mx-auto w-full max-w-xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="rounded-2xl border-2 border-emerald-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Thanks for your feedback!</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            We read every submission. Your input helps make CalcPath better for everyone.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-6 rounded-xl border-2 border-orange-200 bg-white px-5 py-2.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-50 active:scale-95"
          >
            Send more feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6 sm:py-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Feedback</h1>
        <p className="mt-2 text-base leading-relaxed text-zinc-500">
          Any feedback is highly appreciated. If you have an idea, found a bug, or
          just want to share your thoughts — please let us know.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border-2 border-orange-100 bg-white p-6 shadow-sm sm:p-8">
        {/* Kind selector */}
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-zinc-700">
            What kind of feedback is this?
          </legend>
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setKind(k.id)}
                className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition active:scale-95 ${
                  kind === k.id
                    ? "border-orange-400 bg-orange-50 text-orange-800"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                }`}
              >
                <span>{k.icon}</span>
                {k.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Message */}
        <div className="mt-6">
          <label htmlFor="feedback-message" className="mb-2 block text-sm font-semibold text-zinc-700">
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
            className="w-full resize-y rounded-xl border-2 border-orange-100 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
          <p className="mt-1 text-right text-xs text-zinc-400">
            {message.length}/5000
          </p>
        </div>

        {/* Error message */}
        {status === "error" && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Something went wrong. Please try again.
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={status === "sending" || message.trim().length < 3}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "sending" ? "Sending..." : "Send Feedback"}
        </button>
      </form>
    </div>
  );
}
