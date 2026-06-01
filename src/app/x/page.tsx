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
      icon: "λ",
      desc: "9 topics, ~336 questions. Full port to content/linear-algebra/ (index + per-topic JSON + MDX).",
      topicsCount: 9,
    },
    {
      slug: "statistics",
      label: "Statistics",
      icon: "σ",
      desc: "14 topics. Fully ported to content/statistics/ by content agents. Ready for generic flows.",
      topicsCount: 14,
    },
    // Calculus content/ exists but FS loader adapter not yet wired (see NOTES.md)
  ];

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight theme-text">Experimental Dynamic Area</h1>
        <p className="mt-2 max-w-2xl text-[15px] theme-text-secondary">
          This proves the full user flow using <strong>only</strong> the new content data (JSON + MDX from <code>content/</code> via <code>getFileSystemContentBundle</code>).
          No legacy <code>*-content.ts</code> or per-subject app folders used here.
        </p>
      </div>

      <div className="mb-6 rounded-xl border theme-border bg-[var(--surface-2)] p-4 text-sm theme-text-secondary">
        <strong className="theme-text">Current status:</strong> Full browse + explanation (lightweight MDX renderer) + working generic practice. See <code>NOTES.md</code> (content lib) for architecture decisions + open items.
      </div>

      <h2 className="mb-4 text-xl font-semibold theme-text">Available Subjects (data-driven)</h2>

      <div className="grid gap-4 md:grid-cols-2">
        {subjects.map((s) => (
          <div key={s.slug} className="rounded-2xl border theme-border theme-surface p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-3xl leading-none opacity-80" aria-hidden>{s.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold theme-text">{s.label}</h3>
                  <p className="mt-1 text-sm theme-text-secondary">{s.desc}</p>
                </div>
              </div>
              <span className="shrink-0 rounded-full border theme-border bg-[var(--surface-2)] px-2.5 py-0.5 text-xs font-medium theme-text-muted">
                {s.topicsCount} topics
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/x/${s.slug}`}
                className="btn-primary inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.985]"
              >
                Browse topics →
              </Link>
              <Link
                href={`/x/${s.slug}/practice`}
                className="btn-secondary inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-[var(--surface-2)]"
              >
                Practice topics
              </Link>
            </div>
            <p className="mt-3 text-[11px] theme-text-muted">Pure FileSystemContentBundle • no legacy imports</p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-xs theme-text-muted">
        Routes: <code>/x/[subject]</code> • <code>/x/[subject]/modules/[topicId]</code> • <code>/x/[subject]/practice/[topicId]</code>.
        Server-rendered from content loader on each request.
      </div>
    </div>
  );
}
