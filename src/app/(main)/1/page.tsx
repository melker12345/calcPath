import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import {
  JsonLd,
  LANDING_FAQ,
  buildLandingJsonLd,
  buildLandingMetadata,
  getLandingData,
} from "@/lib/landing/seo";

/**
 * Landing variant 1 — modern geometric sans (Space Grotesk headings), centered
 * hero, card grid. Server Component: full copy, catalogue and FAQ render as
 * crawlable HTML with no client JS. SEO/JSON-LD come from @/lib/landing/seo.
 */

// Display font scoped to this page only (variable applied on the page wrapper).
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata = buildLandingMetadata({
  path: "/1",
  title: "Free University Math Courses — Calculus, Statistics & Linear Algebra",
  description:
    "Learn university mathematics free with CalcPath: clear chapters, worked examples, and practice problems with full step-by-step solutions for calculus, linear algebra, statistics and more. No account required.",
});

const FAQ = LANDING_FAQ;

const FEATURES = [
  {
    icon: "📖",
    title: "Read the theory, clearly",
    body: "Derivation-first chapters that explain the why, not just the what — written to be understood on the first read.",
  },
  {
    icon: "✎",
    title: "Practise with full solutions",
    body: "Every problem comes with a complete, step-by-step worked solution, so you learn from mistakes instead of guessing.",
  },
  {
    icon: "🎯",
    title: "Find your gaps",
    body: "A quick diagnostic points you to the exact topics to review, and topic tests confirm when you've mastered them.",
  },
  {
    icon: "📈",
    title: "Track your progress",
    body: "Your completed chapters and practice are saved automatically — pick up exactly where you left off.",
  },
];

export default async function LandingV1() {
  const data = await getLandingData();
  const { subjects: sorted, subjectCount, totalChapters, primary, subjectNames } = data;
  const jsonLd = buildLandingJsonLd(data);

  return (
    <div className={`${spaceGrotesk.variable} theme-bg theme-text`}>
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b theme-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 55% at 50% 0%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <p className="inline-flex items-center gap-2 rounded-full border theme-border bg-[var(--surface)] px-3 py-1 text-xs font-semibold theme-text-secondary">
            <span aria-hidden>✦</span> Free forever · No account required
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl font-[family-name:var(--font-space-grotesk)] text-4xl font-semibold leading-[1.08] tracking-tight theme-text sm:text-6xl">
            Learn university math by{" "}
            <span className="text-[var(--accent)]">understanding it</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed theme-text-secondary">
            Clear, derivation-first chapters and thousands of practice problems
            with full step-by-step solutions — for calculus, linear algebra,
            statistics and more. Read the theory, then practise it, all in one place.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {primary && (
              <Link
                href={`/${primary.slug}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] sm:w-auto"
              >
                Start with {primary.label} →
              </Link>
            )}
            <Link
              href="/subjects"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border theme-border bg-[var(--surface)] px-6 py-3 text-base font-semibold theme-text-secondary transition hover:border-[var(--accent)]/40 hover:theme-text sm:w-auto"
            >
              Browse all subjects
            </Link>
          </div>

          <dl className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { n: `${subjectCount}`, l: "Subjects" },
              { n: `${totalChapters}+`, l: "Chapters" },
              { n: "100%", l: "Free" },
              { n: "0", l: "Ads" },
            ].map((stat) => (
              <div key={stat.l} className="rounded-2xl border theme-border bg-[var(--surface)] px-4 py-5">
                <dt className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold theme-text sm:text-3xl">{stat.n}</dt>
                <dd className="mt-1 text-xs font-medium uppercase tracking-wide theme-text-muted">{stat.l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* What is CalcPath — entity-defining copy for AI answer engines */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-tight theme-text">
          What is CalcPath?
        </h2>
        <p className="mt-4 text-lg leading-relaxed theme-text-secondary">
          <strong className="theme-text">CalcPath is a free platform for learning
          university mathematics.</strong>{" "}
          It pairs clear, self-contained reference chapters with an integrated
          practice engine, so you can read a concept and immediately test your
          understanding with problems that include full worked solutions. It
          currently covers {subjectNames}. No sign-up, no ads, no cost.
        </p>
      </section>

      {/* Subjects */}
      <section className="border-y theme-border bg-[var(--surface-2)]/40">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-tight theme-text">
              Courses you can start right now
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed theme-text-secondary">
              Each subject is a complete, free course. Read the chapters or jump
              straight into practice.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((subject) => {
              const chapterLabel =
                subject.topicCount === 1 ? "1 chapter" : `${subject.topicCount ?? 0} chapters`;
              const glyph = subject.icon || subject.label.charAt(0).toUpperCase();
              return (
                <Link
                  key={subject.slug}
                  href={`/${subject.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border theme-border bg-[var(--surface)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.22)]"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-60"
                  />
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border theme-border bg-[var(--surface-2)] font-[family-name:var(--font-space-grotesk)] text-xl theme-text transition-colors group-hover:border-[color-mix(in_srgb,var(--accent)_40%,var(--border))] group-hover:text-[var(--accent)]">
                      {glyph}
                    </div>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight theme-text">
                      {subject.label}
                    </h3>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide theme-text-muted">
                      {chapterLabel}
                    </p>
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed theme-text-secondary">
                      {subject.shortDescription}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center gap-1.5 border-t theme-border px-6 py-4 text-sm font-semibold text-[var(--accent)]">
                    Start course
                    <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-tight theme-text">
            Everything you need to actually learn it
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border theme-border bg-[var(--surface)] p-5">
              <div className="text-2xl" aria-hidden>{f.icon}</div>
              <h3 className="mt-3 text-base font-semibold theme-text">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed theme-text-secondary">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ — visible + mirrored in FAQPage JSON-LD */}
      <section className="border-t theme-border bg-[var(--surface-2)]/40">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2 className="text-center font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-tight theme-text">
            Frequently asked questions
          </h2>
          <div className="mt-8 space-y-3">
            {FAQ.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border theme-border bg-[var(--surface)] p-5 [&_summary]:cursor-pointer"
              >
                <summary className="flex items-center justify-between gap-4 text-base font-semibold theme-text marker:content-['']">
                  {f.q}
                  <span aria-hidden className="text-[var(--accent)] transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed theme-text-secondary">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-tight theme-text sm:text-4xl">
          Start learning today — it&apos;s free
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed theme-text-secondary">
          No account, no card, no catch. Pick a subject and start with the first chapter.
        </p>
        {primary && (
          <Link
            href={`/${primary.slug}`}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-3.5 text-base font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98]"
          >
            Start with {primary.label} →
          </Link>
        )}
      </section>
    </div>
  );
}
