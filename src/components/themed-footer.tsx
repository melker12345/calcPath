"use client";

import Link from "next/link";
import type { SubjectTheme } from "@/lib/themes";

export function ThemedFooter({
  theme,
  subjectSlug,
}: {
  theme: SubjectTheme;
  subjectSlug: string;
}) {
  const c = theme.colors;
  const prefix = `/${subjectSlug}`;

  return (
    <footer style={{ borderTop: `1px solid ${c.border}`, backgroundColor: c.bg }} className="pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Footer grid */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold"
                style={{ background: c.logoBg, color: c.logoText }}
              >
                ∫
              </div>
              <span className="text-lg font-bold" style={{ color: c.text }}>CalcPath</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: c.textMuted }}>
              Free step-by-step calculus lessons, practice problems, and tests.
            </p>
          </div>

          {/* Learn column */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: c.textDim }}>
              Learn
            </h4>
            <nav className="flex flex-col gap-2">
              <Link href={`${prefix}/modules`} className="text-sm transition hover:opacity-70" style={{ color: c.textMuted }}>
                Modules
              </Link>
              <Link href={`${prefix}/practice`} className="text-sm transition hover:opacity-70" style={{ color: c.textMuted }}>
                Practice
              </Link>
              <Link href={`${prefix}/flashcards`} className="text-sm transition hover:opacity-70" style={{ color: c.textMuted }}>
                Flash Cards
              </Link>
            </nav>
          </div>

          {/* Progress column */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: c.textDim }}>
              Progress
            </h4>
            <nav className="flex flex-col gap-2">
              <Link href={`${prefix}/dashboard`} className="text-sm transition hover:opacity-70" style={{ color: c.textMuted }}>
                Dashboard
              </Link>
              <Link href="/paths" className="text-sm transition hover:opacity-70" style={{ color: c.textMuted }}>
                Learning Paths
              </Link>
              <Link href="/streaks" className="text-sm transition hover:opacity-70" style={{ color: c.textMuted }}>
                Streaks
              </Link>
            </nav>
          </div>

          {/* Account column */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: c.textDim }}>
              Account
            </h4>
            <nav className="flex flex-col gap-2">
              <Link href="/auth" className="text-sm transition hover:opacity-70" style={{ color: c.textMuted }}>
                Sign In
              </Link>
              <Link href="/account" className="text-sm transition hover:opacity-70" style={{ color: c.textMuted }}>
                Settings
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 pt-6 sm:flex-row" style={{ borderTop: `1px solid ${c.border}` }}>
          <p className="text-sm" style={{ color: c.textDim }}>© 2026 CalcPath</p>
          <Link
            href="/donate"
            className="text-sm font-medium transition hover:opacity-80"
            style={{ color: c.accent }}
          >
            Support CalcPath ♥
          </Link>
        </div>
      </div>
    </footer>
  );
}
