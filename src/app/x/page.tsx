import Link from "next/link";

/**
 * Experimental landing: lists subjects that have data-driven content in content/ dir.
 * Proves we can drive navigation purely from loader (no hard-coded subject folders).
 */
export default function ExperimentalHome() {
  const subjects = [
    {
      slug: "linear-algebra",
      label: "Linear Algebra",
      desc: "9 topics, ~336 questions. Full port to content/linear-algebra/ (index + per-topic JSON + MDX).",
      topicsCount: 9,
    },
    {
      slug: "statistics",
      label: "Statistics",
      desc: "14 topics. Fully ported to content/statistics/ by content agents. Ready for generic flows.",
      topicsCount: 14,
    },
    // Calculus content/ exists but FS loader adapter not yet wired (see NOTES.md)
  ];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight theme-text">Experimental Dynamic Area</h1>
        <p className="mt-2 max-w-2xl theme-text-secondary">
          This proves the full user flow using <strong>only</strong> the new content data (JSON + MDX from <code>content/</code> via <code>getFileSystemContentBundle</code>).
          No legacy <code>*-content.ts</code> or per-subject app folders used here.
        </p>
      </div>

      <div className="mb-6 rounded-xl border theme-border bg-[var(--surface-2)] p-4 text-sm">
        <strong className="theme-text">Current status:</strong> Browse + explanation (MDX) + working practice (generic components). See NOTES.md for decisions + limitations.
      </div>

      <h2 className="mb-4 text-xl font-semibold theme-text">Available Subjects (data-driven)</h2>

      <div className="grid gap-4 md:grid-cols-2">
        {subjects.map((s) => (
          <div key={s.slug} className="rounded-2xl border theme-border theme-surface p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold theme-text">{s.label}</h3>
                <p className="mt-1 text-sm theme-text-secondary">{s.desc}</p>
              </div>
              <span className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-medium theme-text-muted">
                {s.topicsCount} topics
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/x/${s.slug}`}
                className="btn-primary inline-flex items-center px-4 py-2 text-sm"
              >
                Browse topics →
              </Link>
              <Link
                href={`/x/${s.slug}/practice`}
                className="btn-secondary inline-flex items-center px-4 py-2 text-sm"
              >
                Practice overview (soon)
              </Link>
            </div>
            <p className="mt-3 text-[11px] theme-text-muted">Uses only FileSystemContentBundle for this subject.</p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-xs theme-text-muted">
        Routes live at <code>/x/[subject]</code>, <code>/x/[subject]/modules/[topicId]</code>, <code>/x/[subject]/practice/[topicId]</code>.
        All data fetched at request time from the content loader (async server components).
      </div>
    </main>
  );
}
