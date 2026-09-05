import Link from "next/link";
import {
  JsonLd,
  LANDING_FAQ,
  buildLandingJsonLd,
  buildLandingMetadata,
  getLandingData,
} from "@/lib/landing/seo";

/**
 * Landing variant 4 — "Minimal product" (Linear / Vercel style). Ultra-clean,
 * hairline-bordered, restrained type, lots of negative space. Server Component:
 * all copy, the catalogue and the FAQ render as crawlable HTML with no client
 * JS. SEO + JSON-LD come from @/lib/landing/seo.
 */

export const metadata = buildLandingMetadata({
  path: "/4",
  title: "CalcPath — Free University Math: Calculus, Linear Algebra & Statistics",
  description:
    "A clean, free platform for university mathematics. Derivation-first chapters, practice problems with full step-by-step solutions, diagnostic and topic tests, and automatic progress tracking. No account required.",
});

const FEATURES = [
  {
    label: "Chapters",
    title: "Derivation-first",
    body: "Concise, self-contained chapters that explain the why before the what — written to be understood on the first read.",
  },
  {
    label: "Practice",
    title: "Full solutions",
    body: "Every problem ships with a complete, step-by-step worked solution, so you learn from each mistake instead of guessing.",
  },
  {
    label: "Testing",
    title: "Diagnostic & topic tests",
    body: "A quick diagnostic pinpoints the exact topics to review, and per-topic tests confirm when you have mastered them.",
  },
  {
    label: "Progress",
    title: "Tracked automatically",
    body: "Completed chapters and practice are saved as you go, so you always pick up exactly where you left off.",
  },
];

export default async function LandingV4() {
  const data = await getLandingData();
  const { subjects, subjectCount, totalChapters, primary, subjectNames } = data;

  return (
    <div className="theme-bg theme-text font-sans">
      <JsonLd data={buildLandingJsonLd(data)} />

      {/* Hero */}
      <section className="border-b theme-border">
        <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] theme-text-muted">
            Free university mathematics
          </p>
          <h1 className="mt-5 max-w-2xl text-3xl font-semibold leading-[1.15] tracking-tight theme-text sm:text-4xl">
            Learn math by understanding it, not memorising it.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed theme-text-secondary">
            Clear chapters and practice problems with full step-by-step solutions —
            calculus, linear algebra, statistics and more. No account, no ads, no cost.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {primary && (
              <Link
                href={`/${primary.slug}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 active:scale-[0.98]"
              >
                Start with {primary.label}
                <span aria-hidden>→</span>
              </Link>
            )}
            <Link
              href="/subjects"
              className="inline-flex items-center rounded-md border theme-border bg-[var(--surface)] px-4 py-2 text-sm font-medium theme-text-secondary transition hover:theme-text hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))]"
            >
              Browse all subjects
            </Link>
          </div>

          <dl className="mt-14 flex flex-wrap gap-x-10 gap-y-4 border-t theme-border pt-6">
            {[
              { n: `${subjectCount}`, l: "Subjects" },
              { n: `${totalChapters}+`, l: "Chapters" },
              { n: "100%", l: "Free" },
              { n: "0", l: "Ads" },
            ].map((stat) => (
              <div key={stat.l}>
                <dt className="text-xl font-semibold tracking-tight theme-text">{stat.n}</dt>
                <dd className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.15em] theme-text-muted">
                  {stat.l}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Entity-defining copy for AI answer engines */}
      <section className="border-b theme-border">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="max-w-3xl text-[15px] leading-relaxed theme-text-secondary">
            <span className="theme-text">
              CalcPath is a free platform for learning university mathematics.
            </span>{" "}
            It pairs clear, self-contained reference chapters with an integrated
            practice engine, so you can read a concept and immediately test your
            understanding against problems that include full worked solutions. It
            currently covers {subjectNames} — no sign-up, no ads, no cost.
          </p>
        </div>
      </section>

      {/* Subjects — compact dense grid of low-profile cards */}
      <section className="border-b theme-border">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="mb-8 flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight theme-text">Courses</h2>
            <p className="text-[13px] theme-text-muted">
              {subjectCount} subjects · {totalChapters}+ chapters
            </p>
          </div>

          <ul className="grid gap-px overflow-hidden rounded-lg border theme-border bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => {
              const chapterLabel =
                subject.topicCount === 1 ? "1 chapter" : `${subject.topicCount ?? 0} chapters`;
              return (
                <li key={subject.slug}>
                  <Link
                    href={`/${subject.slug}`}
                    className="group flex h-full flex-col bg-[var(--surface)] p-5 transition hover:bg-[var(--surface-2)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-medium tracking-tight theme-text">
                        {subject.label}
                      </h3>
                      <span
                        aria-hidden
                        className="text-sm theme-text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]"
                      >
                        →
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] theme-text-muted">
                      {chapterLabel}
                    </p>
                    <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed theme-text-secondary">
                      {subject.shortDescription}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b theme-border">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="mb-8 text-lg font-semibold tracking-tight theme-text">
            How it works
          </h2>
          <div className="grid gap-px overflow-hidden rounded-lg border theme-border bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-[var(--surface)] p-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--accent)]">
                  {f.label}
                </p>
                <h3 className="mt-2 text-sm font-medium tracking-tight theme-text">{f.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed theme-text-secondary">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — visible + mirrored in FAQPage JSON-LD */}
      <section className="border-b theme-border">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="mb-8 text-lg font-semibold tracking-tight theme-text">
            Frequently asked questions
          </h2>
          <dl className="divide-y theme-border border-y theme-border">
            {LANDING_FAQ.map((f) => (
              <div key={f.q} className="grid gap-2 py-6 sm:grid-cols-3 sm:gap-8">
                <dt className="text-sm font-medium tracking-tight theme-text">{f.q}</dt>
                <dd className="text-[13px] leading-relaxed theme-text-secondary sm:col-span-2">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Final CTA */}
      <section>
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="flex flex-col items-start gap-6 rounded-lg border theme-border bg-[var(--surface)] p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight theme-text">
                Start learning today — it&apos;s free
              </h2>
              <p className="mt-1.5 max-w-md text-[13px] leading-relaxed theme-text-secondary">
                No account, no card, no catch. Pick a subject and open the first chapter.
              </p>
            </div>
            {primary && (
              <Link
                href={`/${primary.slug}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 active:scale-[0.98]"
              >
                Start with {primary.label}
                <span aria-hidden>→</span>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
