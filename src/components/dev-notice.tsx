"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

/**
 * One-time "in development" modal shown on the landing page: the site is a
 * work in progress, and any critique should go to calc-path.com/feedback.
 *
 * This is the only site-wide prompt. It replaced two earlier ones — a
 * bottom-left corner notice with this same text, and a centred "do you prefer
 * the new version?" vote — with one dialog. Dismissal is remembered per browser
 * (localStorage), so a visitor sees it at most once.
 */
const STORAGE_KEY = "calcpath-dev-notice-dismissed";

export function DevNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Read after mount so SSR and client markup match.
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // Storage unavailable — show the notice; dismissal just won't persist.
    }
    if (dismissed) return;
    // Slight delay so it appears after the page settles.
    const t = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const dismiss = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Best-effort — worst case the notice shows again next visit.
    }
  }, []);

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
      aria-labelledby="dev-notice-title"
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
          aria-label="Dismiss notice"
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

        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
          In development
        </span>
        <h2
          id="dev-notice-title"
          className="mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100"
        >
          CalcPath is a work in progress
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          Spotted a wrong answer, a typo, or anything else off? Please tell us —
          every report gets read.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <Link
            href="/feedback"
            onClick={dismiss}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            calc-path.com/feedback →
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="text-sm font-medium text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
