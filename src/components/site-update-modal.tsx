"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * One-time "we've updated the site" prompt shown on the landing page. Asks
 * whether the visitor prefers the new version and records the answer as a vote
 * in the feedback table (target_type "site-version"), so the admin inbox shows
 * a running +Yes / -No tally. Shown at most once per browser: the moment the
 * visitor votes or dismisses, we set a localStorage flag and never show it again.
 *
 * Only shown to returning visitors: someone with no pre-existing local progress
 * never saw the old version, so asking them "do you prefer the new one?" is
 * meaningless (and blocks their very first impression of the landing page).
 */
const STORAGE_KEY = "calc_site_update_v2_responded";
/** Same key the progress system persists under (see progress-provider.tsx). */
const PROGRESS_KEY = "calc_progress_v1";
const TARGET_TYPE = "site-version";
const TARGET_ID = "new-version-2026";

/**
 * True only when the browser already holds real practice progress (attempts,
 * completions, test results, ...) written by the progress system. Any parse or
 * storage error means "no" — a brand-new visitor must never see the prompt.
 */
function hasExistingProgress(): boolean {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return false;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return false;
    }
    const p = parsed as Record<string, unknown>;
    const nonEmptyArray = (v: unknown) => Array.isArray(v) && v.length > 0;
    return (
      nonEmptyArray(p.attempts) ||
      nonEmptyArray(p.attemptedProblemIds) ||
      nonEmptyArray(p.completedProblemIds) ||
      nonEmptyArray(p.completedModuleIds) ||
      nonEmptyArray(p.testResults) ||
      nonEmptyArray(p.diagnostics)
    );
  } catch {
    return false;
  }
}

export function SiteUpdateModal() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"ask" | "sending" | "done">("ask");

  useEffect(() => {
    // Never re-show once responded. Read after mount so SSR/client markup match.
    let responded = false;
    try {
      responded = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      responded = false;
    }
    if (responded) return;
    // First-time visitors (no stored progress) never saw the old site — skip.
    if (!hasExistingProgress()) return;
    const t = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const markResponded = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore private-mode / disabled storage */
    }
  }, []);

  const dismiss = useCallback(() => {
    markResponded();
    setOpen(false);
  }, [markResponded]);

  const vote = useCallback(
    async (value: 1 | -1) => {
      if (state === "sending") return;
      setState("sending");
      markResponded();
      try {
        await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "vote",
            target_type: TARGET_TYPE,
            target_id: TARGET_ID,
            vote: value,
            user_id: null,
            page_url:
              typeof window !== "undefined" ? window.location.href : null,
          }),
        });
      } catch {
        // Best-effort: still thank the visitor even if the request failed.
      }
      setState("done");
      setTimeout(() => setOpen(false), 1400);
    },
    [state, markResponded],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-update-title"
    >
      <div
        className="absolute inset-0 bg-zinc-900/30 backdrop-blur-[2px]"
        onClick={dismiss}
        aria-hidden
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {state === "done" ? (
          <div className="py-4 text-center">
            <p className="text-2xl">🙏</p>
            <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Thanks for the feedback!
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              What&apos;s new
            </p>
            <h2
              id="site-update-title"
              className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100"
            >
              We&apos;ve updated the site 🎉
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              It now includes much more content and questions. Do you prefer this
              new version?
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                disabled={state === "sending"}
                onClick={() => vote(1)}
                className="flex-1 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Yes
              </button>
              <button
                type="button"
                disabled={state === "sending"}
                onClick={() => vote(-1)}
                className="flex-1 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                No
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
