import Link from "next/link";
import { subjectThemeClass } from "@/lib/themes";
import {
  JsonLd,
  buildLandingJsonLd,
  buildLandingMetadata,
  getLandingData,
} from "@/lib/landing/seo";

/**
 * Home page — reference-index design, in the manner of a modern encyclopaedia
 * portal: one modest heading, a lead paragraph, then the catalogue as a dense
 * grouped link list. No hero, no marketing grid, no closing CTA.
 *
 * Set in the UI sans (Inter) rather than the display serif. The serif is the
 * course content's voice — module pages are typeset as a book — and keeping the
 * chrome sans is what stops the home page reading like a book jacket.
 *
 * Server Component: the catalogue renders as crawlable HTML with no
 * client JS. The catalogue comes from getLandingData(), which wraps
 * getAvailableSubjectConfigs() auto-discovery, so a newly dropped content/
 * folder appears here with no code change. SEO/JSON-LD come from
 * @/lib/landing/seo — the single source of truth shared with the /1, /3, /4, /5
 * noindexed design references.
 */

export const metadata = buildLandingMetadata({
  path: "/",
  title: "CalcPath — Free University Math: Calculus, Linear Algebra & Statistics",
  description:
    "Learn university mathematics free with CalcPath: clear derivation-first chapters, worked examples, and practice problems with full step-by-step solutions for calculus, linear algebra, statistics and more. No account required.",
});

/**
 * Display names for the `category` field in each content/<slug>/index.json.
 * Unknown categories fall back to a title-cased version of the raw key, so a
 * subject dropped in with a brand-new category still renders rather than
 * vanishing from the index.
 */
const CATEGORY_LABELS: Record<string, string> = {
  foundations: "Foundations",
  calculus: "Calculus and analysis",
  analysis: "Calculus and analysis",
  linear: "Algebra",
  algebra: "Algebra",
  discrete: "Discrete mathematics and logic",
  logic: "Discrete mathematics and logic",
  stats: "Probability and statistics",
};

/** Order the groups appear in; anything unlisted sorts to the end, alphabetically. */
const CATEGORY_ORDER = [
  "Foundations",
  "Calculus and analysis",
  "Algebra",
  "Discrete mathematics and logic",
  "Probability and statistics",
];

function categoryLabel(raw: string | null | undefined): string {
  if (!raw) return "Other";
  return (
    CATEGORY_LABELS[raw] ??
    raw.charAt(0).toUpperCase() + raw.slice(1).replace(/[-_]/g, " ")
  );
}

const SUMMARY = [
  {
    term: "Chapters",
    def: "Each one is a self-contained textbook section — definitions, motivation and full derivations, so a result is shown rather than asserted.",
  },
  {
    term: "Practice",
    def: "Short auto-graded questions that confirm a chapter's methods work. Every one carries a complete worked solution.",
  },
  {
    term: "Problem sets",
    def: "Printable sheets worked on paper — proofs, sketches and find-the-error problems that auto-grading cannot ask — with full solutions on a separate page.",
  },
  {
    term: "Progress",
    def: "Saved in your browser as you go. No account needed; export it as a file to move it to another device.",
  },
];

export default async function Home() {
  const data = await getLandingData();
  const { subjects, subjectCount, totalChapters, primary } = data;

  // Group the auto-discovered catalogue by category, preserving each subject's
  // own `order` within its group.
  const groups = new Map<string, typeof subjects>();
  for (const subject of subjects) {
    const key = categoryLabel(subject.category);
    const existing = groups.get(key);
    if (existing) existing.push(subject);
    else groups.set(key, [subject]);
  }
  const orderedGroups = [...groups.entries()].sort(([a], [b]) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="theme-bg theme-text">
      {/* Structured data (EducationalOrganization + Course ItemList).
          The org node reuses the same @id as the root layout's Organization node
          so crawlers merge them. Exactly one set of nodes on this page. */}
      <JsonLd data={buildLandingJsonLd(data)} />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight theme-text">
          CalcPath
        </h1>
        <p className="mt-1 text-sm theme-text-muted">
          Free university mathematics · {subjectCount} subjects ·{" "}
          {totalChapters} chapters
        </p>

        <p className="mt-6 text-[15px] leading-relaxed theme-text-secondary">
          CalcPath is a free, ad-free reference for university mathematics. Every
          chapter is written as a self-contained textbook section — definitions,
          motivation and full derivations — and paired with practice problems
          that carry complete step-by-step solutions. There is no account, no
          paywall and no advertising; your progress is saved on your device.
        </p>

        <p className="mt-5 text-[15px] theme-text-secondary">
          {primary && (
            <>
              <Link
                href={`/${primary.slug}`}
                className="font-medium text-[var(--accent)] underline-offset-4 hover:underline"
              >
                Start with {primary.label}
              </Link>
              <span aria-hidden className="mx-2 theme-text-muted">
                ·
              </span>
            </>
          )}
          <Link
            href="/subjects"
            className="font-medium text-[var(--accent)] underline-offset-4 hover:underline"
          >
            Browse all subjects
          </Link>
        </p>

        {/* Catalogue — grouped dense link list, in the manner of a portal index */}
        <h2 className="mt-12 border-b theme-border pb-1.5 text-lg font-semibold tracking-tight theme-text">
          Subjects
        </h2>
        <div className="mt-5 grid gap-x-10 gap-y-6 sm:grid-cols-2">
          {orderedGroups.map(([label, list]) => (
            <section key={label}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.1em] theme-text-muted">
                {label}
              </h3>
              <ul className="mt-2 space-y-1">
                {list.map((subject) => (
                  <li key={subject.slug} className="flex items-baseline gap-2">
                    <span
                      aria-hidden
                      className={`w-5 shrink-0 text-center font-serif text-[var(--subject-accent,var(--text-muted))] ${subjectThemeClass(subject.slug)}`}
                    >
                      {subject.icon || "•"}
                    </span>
                    <Link
                      href={`/${subject.slug}`}
                      className="text-[15px] text-[var(--accent)] underline-offset-4 hover:underline"
                    >
                      {subject.label}
                    </Link>
                    <span className="text-xs tabular-nums theme-text-muted">
                      {subject.topicCount}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className="mt-4 text-xs theme-text-muted">
          Figures are chapter counts.
        </p>

        {/* What's inside — three lines, not a feature grid */}
        <h2 className="mt-12 border-b theme-border pb-1.5 text-lg font-semibold tracking-tight theme-text">
          What&apos;s inside
        </h2>
        <dl className="mt-4 space-y-3">
          {SUMMARY.map((item) => (
            <div key={item.term} className="text-[15px] leading-relaxed">
              <dt className="inline font-medium theme-text">{item.term}.</dt>{" "}
              <dd className="inline theme-text-secondary">{item.def}</dd>
            </div>
          ))}
        </dl>
      </main>

    </div>
  );
}
