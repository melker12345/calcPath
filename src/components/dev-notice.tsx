"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "calcpath-dev-notice-dismissed";

/**
 * Small dismissible corner notice on the landing page: the site is in active
 * development, and any critique should go to calc-path.com/feedback.
 * Dismissal is remembered per browser (localStorage).
 */
export function DevNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // Storage unavailable — show the notice; dismissal just won't persist.
    }
    if (dismissed) return;
    // Slight delay so it appears after the page settles (same pattern as SiteUpdateModal).
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Best-effort — worst case the notice shows again next visit.
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-xl border theme-border bg-[var(--surface)] p-3.5 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
          In development
        </span>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss notice"
          className="-mr-1 -mt-1 rounded-md p-1 text-sm leading-none theme-text-muted transition hover:bg-[var(--surface-2)]"
        >
          ✕
        </button>
      </div>
      <p className="mt-2 text-xs leading-relaxed theme-text-secondary">
        CalcPath is a work in progress. Spotted a wrong answer, a typo, or
        anything else off? Please tell us — every report gets read.
      </p>
      <Link
        href="/feedback"
        className="mt-2 inline-block text-xs font-semibold text-[var(--accent)] underline underline-offset-2 transition hover:opacity-80"
      >
        calc-path.com/feedback →
      </Link>
    </div>
  );
}
