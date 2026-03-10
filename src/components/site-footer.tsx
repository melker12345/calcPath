"use client";

import Link from "next/link";

export const SiteFooter = () => (
  <footer className="border-t border-orange-100 bg-white pb-[env(safe-area-inset-bottom)]">
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Footer grid */}
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        {/* Brand column */}
        <div className="sm:col-span-2 md:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-400 text-sm font-bold text-white">
              ∫
            </div>
            <span className="text-lg font-bold text-orange-900">CalcPath</span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-orange-600/70">
            Free step-by-step calculus lessons, practice problems, and tests.
          </p>
        </div>

        {/* Learn column */}
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-orange-400">
            Learn
          </h4>
          <nav className="flex flex-col gap-2">
            <Link href="/calculus/modules" className="text-sm text-orange-600 hover:text-orange-900">Modules</Link>
            <Link href="/calculus/practice" className="text-sm text-orange-600 hover:text-orange-900">Practice</Link>
            {/* <Link href="/calculus/flashcards" className="text-sm text-orange-600 hover:text-orange-900">Flash Cards</Link> */}
          </nav>
        </div>

        {/* Progress column */}
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-orange-400">
            Progress
          </h4>
          <nav className="flex flex-col gap-2">
            <Link href="/calculus/dashboard" className="text-sm text-orange-600 hover:text-orange-900">Dashboard</Link>
            <Link href="/paths" className="text-sm text-orange-600 hover:text-orange-900">Learning Paths</Link>
            <Link href="/streaks" className="text-sm text-orange-600 hover:text-orange-900">Streaks</Link>
          </nav>
        </div>

        {/* Account column */}
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-orange-400">
            Account
          </h4>
          <nav className="flex flex-col gap-2">
            <Link href="/auth" className="text-sm text-orange-600 hover:text-orange-900">Sign In</Link>
            <Link href="/account" className="text-sm text-orange-600 hover:text-orange-900">Settings</Link>
          </nav>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-orange-100 pt-6 sm:flex-row">
        <p className="text-sm text-orange-400">© 2026 CalcPath</p>
        <Link
          href="/donate"
          className="text-sm font-medium text-orange-500 transition hover:text-orange-700"
        >
          Support CalcPath ♥
        </Link>
      </div>
    </div>
  </footer>
);
