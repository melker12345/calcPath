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
    <div className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Experimental Dynamic Area</h1>
        <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
          This proves the full user flow using <strong>only</strong> the new content data (JSON + MDX from <code>content/</code> via <code>getFileSystemContentBundle</code>).
          No legacy <code>*-content.ts</code> or per-subject app folders used here.
        </p>
      </div>

      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-900/60 dark:bg-blue-950/30">
        <strong>Current status:</strong> Browse + basic explanation (MDX raw) + working practice (generic). See NOTES.md in content lib for decisions + limitations.
      </div>

      <h2 className="mb-4 text-xl font-semibold">Available Subjects (data-driven)</h2>

      <div className="grid gap-4 md:grid-cols-2">
        {subjects.map((s) => (
          <div key={s.slug} className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm dark:bg-[var(--surface)]">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{s.label}</h3>
                <p className="mt-1 text-sm text-zinc-500">{s.desc}</p>
              </div>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {s.topicsCount} topics
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/x/${s.slug}`}
                className="inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black active:scale-[0.985] dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Browse topics →
              </Link>
              <Link
                href={`/x/${s.slug}/practice`}  // note: we may add list page later; for now topic pages are direct
                className="inline-flex items-center rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Practice overview (soon)
              </Link>
            </div>
            <p className="mt-3 text-[11px] text-zinc-500">Uses only FileSystemContentBundle for this subject.</p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-xs text-zinc-500">
        Routes live at <code>/x/[subject]</code>, <code>/x/[subject]/modules/[topicId]</code>, <code>/x/[subject]/practice/[topicId]</code>.
        All data fetched at request time from the content loader (async server components).
      </div>
    </div>
  );
}
