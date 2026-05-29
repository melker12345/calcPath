import Link from "next/link";

export const SiteFooter = () => (
  <footer className="border-t theme-border theme-surface pb-[env(safe-area-inset-bottom)]">
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-5">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="font-serif text-xl font-semibold theme-text">CalcPath</span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-[var(--text-muted)] dark:text-[#8b949e]">
            Free university mathematics notes, examples, and practice.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider theme-text-muted">
            Contents
          </h4>
          <nav className="flex flex-col gap-2">
            <Link href="/calculus" className="text-sm theme-text-secondary hover:theme-text">Calculus</Link>
            <Link href="/statistics" className="text-sm text-stone-600 dark:text-[var(--text-muted)] hover:text-stone-950 hover:underline">Statistics</Link>
            <Link href="/linear-algebra" className="text-sm text-stone-600 dark:text-[var(--text-muted)] hover:text-stone-950 hover:underline">Linear Algebra</Link>
          </nav>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider theme-text-muted">
            Work
          </h4>
          <nav className="flex flex-col gap-2">
            <Link href="/diagnostic" className="text-sm text-stone-600 dark:text-[var(--text-muted)] hover:text-stone-950 hover:underline">Diagnostic</Link>
            <Link href="/calculus/practice" className="text-sm text-stone-600 dark:text-[var(--text-muted)] hover:text-stone-950 hover:underline">Practice</Link>
            <Link href="/paths" className="text-sm text-stone-600 dark:text-[var(--text-muted)] hover:text-stone-950 hover:underline">Paths</Link>
          </nav>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider theme-text-muted">
            Account
          </h4>
          <nav className="flex flex-col gap-2">
            <Link href="/auth" className="text-sm text-stone-600 dark:text-[var(--text-muted)] hover:text-stone-950 hover:underline">Sign In</Link>
            <Link href="/account" className="text-sm text-stone-600 dark:text-[var(--text-muted)] hover:text-stone-950 hover:underline">Settings</Link>
            <Link href="/feedback" className="text-sm text-stone-600 dark:text-[var(--text-muted)] hover:text-stone-950 hover:underline">Feedback</Link>
          </nav>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-stone-300 pt-6 sm:flex-row">
        <p className="text-sm text-stone-500">© 2026 CalcPath</p>
        <Link
          href="/donate"
          className="text-sm font-medium text-stone-600 dark:text-[var(--text-muted)] transition hover:text-stone-950"
        >
          Support CalcPath
        </Link>
      </div>
    </div>
  </footer>
);
