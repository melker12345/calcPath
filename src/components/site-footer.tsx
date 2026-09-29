import Link from "next/link";

/**
 * Site footer is async to support auto subject discovery from content/ (scan index.json).
 * New subjects appear here automatically with no entry in subjects.ts (uses index metadata + fallback).
 */
export const SiteFooter = async () => {
  const { getAvailableSubjectConfigs } = await import("@/lib/content/loader");
  const subjectList = await getAvailableSubjectConfigs();
  return (
  <footer className="border-t theme-border theme-surface pb-[env(safe-area-inset-bottom)]">
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-5">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="font-serif text-xl font-semibold theme-text">CalcPath</span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed theme-text-muted">
            Free university mathematics notes, examples, and practice.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider theme-text-muted">
            Contents
          </h4>
          <nav className="flex flex-col gap-2">
            {subjectList.map((subject) => (
              <Link
                key={subject.slug}
                href={`/${subject.slug}`}
                className="text-sm theme-text-secondary hover:underline"
              >
                {subject.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider theme-text-muted">
            Work
          </h4>
          <nav className="flex flex-col gap-2">
            <Link href="/problem-sets" className="text-sm theme-text-secondary hover:underline">Problem sets</Link>
            <Link href="/about" className="text-sm theme-text-secondary hover:underline">About</Link>
          </nav>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider theme-text-muted">
            Site
          </h4>
          <nav className="flex flex-col gap-2">
            <Link href="/dashboard" className="text-sm theme-text-secondary hover:underline">Progress</Link>
            <Link href="/feedback" className="text-sm theme-text-secondary hover:underline">Feedback</Link>
          </nav>
        </div>
      </div>

      <div className="mt-8 border-t theme-border pt-6">
        <p className="text-sm theme-text-muted">© 2026 CalcPath</p>
      </div>
    </div>
  </footer>
  );
};
