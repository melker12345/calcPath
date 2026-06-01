import Link from "next/link";

/**
 * Dynamic content landing: the subject browser for the new evolving UI.
 * All navigation and content is driven from the content/ directory (no hard-coded subject folders).
 * This area is the forward-looking implementation where new content is developed and will eventually become the main experience.
 */
export default function DynamicHome() {
  const subjects = [
    {
      slug: "linear-algebra",
      label: "Linear Algebra",
      desc: "9 topics with full explanations and ~336 practice questions. Complete interactive experience available here.",
      topicsCount: 9,
    },
    {
      slug: "statistics",
      label: "Statistics",
      desc: "14 topics with full explanations and 461 practice questions. The primary place for new content development.",
      topicsCount: 14,
    },
    {
      slug: "calculus",
      label: "Calculus",
      desc: "9 topics with full explanations and ~435 practice questions. Actively evolving as part of the new content system.",
      topicsCount: 9,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight theme-text">Dynamic Content Area</h1>
        <p className="mt-2 max-w-2xl theme-text-secondary">
          This is where new content for CalcPath is being developed. All material is loaded from <code>content/</code> (JSON + MDX) using a generic, data-driven UI. No legacy hard-coded files are used. This dynamic area will eventually become the main experience across the app.
        </p>
      </div>

      <div className="mb-6 rounded-xl border theme-border bg-[var(--surface-2)] p-4 text-sm">
        <strong className="theme-text">Active development:</strong> The new dynamic content system lives here. Legacy content is in backup. We are building the future of navigation, practice, and explanations in this evolving UI.
      </div>

      <h2 className="mb-4 text-xl font-semibold theme-text">Subjects</h2>
      <p className="mb-4 text-sm theme-text-muted">Browse the full content library. These are the live subjects powered by the new system — pick any to explore topics, explanations, and practice.</p>

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
                Practice overview
              </Link>
            </div>
            <p className="mt-3 text-[11px] theme-text-muted">Fully powered by the dynamic content loader.</p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-xs theme-text-muted">
        All routes under <code>/x/[subject]</code> (topic browser, explanations at <code>/modules/[topicId]</code>, practice at <code>/practice/[topicId]</code>).
        Content is fetched live from the filesystem via the content system.
      </div>
    </main>
  );
}
