import Link from "next/link";
import {
  JsonLd,
  LANDING_FAQ,
  buildLandingJsonLd,
  buildLandingMetadata,
  getLandingData,
} from "@/lib/landing/seo";

/**
 * Landing variant 3 — "Bold marketing / high-contrast conversion". Big
 * extra-bold sans headlines, a punchy hero, a full-width accent stats band, and
 * confident subject cards. Server Component: all copy, catalogue and FAQ render
 * as crawlable HTML with no client JS. SEO/JSON-LD come from @/lib/landing/seo.
 */

export const metadata = buildLandingMetadata({
  path: "/3",
  title: "Master University Math Free — Calculus, Linear Algebra & Statistics",
  description:
    "CalcPath is a free platform for learning university mathematics. Master calculus, linear algebra and statistics with clear chapters and practice problems that include full step-by-step worked solutions. No account, no ads, no cost.",
});

const FEATURES = [
  {
    title: "Derivation-first chapters",
    body: "Concepts built up from the ground, so the formulas make sense instead of being memorised — clear, self-contained, and written to click on the first read.",
  },
  {
    title: "Practice with full solutions",
    body: "Every practice problem comes with a complete, step-by-step worked solution — learn from each mistake instead of guessing where you went wrong.",
  },
  {
    title: "Diagnostic + topic tests",
    body: "A quick diagnostic pinpoints exactly what to review, and per-topic tests confirm the moment you have genuinely mastered the material.",
  },
  {
    title: "Automatic progress tracking",
    body: "Completed chapters and solved problems are saved automatically on your device — jump back in and pick up precisely where you left off.",
  },
];

export default async function LandingV3() {
  const data = await getLandingData();
  const { subjects, subjectCount, totalChapters, primary, subjectNames } = data;

  return (
    <div className="theme-bg theme-text font-sans">
      <JsonLd data={buildLandingJsonLd(data)} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b theme-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(75% 60% at 50% -10%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <p className="inline-flex items-center gap-2 rounded-full border theme-border bg-[var(--surface)] px-4 py-1.5 text-xs font-bold uppercase tracking-widest theme-text-secondary">
            <span
              className="inline-block h-2 w-2 rounded-full bg-[var(--accent)]"
              aria-hidden
            />
            Free forever · No account
          </p>
          <h1 className="mx-auto mt-7 max-w-4xl text-5xl font-extrabold leading-[0.98] tracking-tight theme-text sm:text-7xl">
            Master university math.
            <br />
            <span className="text-[var(--accent)]">Free. Forever.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed theme-text-secondary sm:text-xl">
            Calculus, linear algebra and statistics — taught with clear,
            derivation-first chapters and thousands of practice problems that
            come with full step-by-step solutions. Read it, practise it, own it.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {primary && (
              <Link
                href={`/${primary.slug}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 active:translate-y-0 active:scale-[0.98] sm:w-auto"
              >
                Start {primary.label} free
                <span aria-hidden>→</span>
              </Link>
            )}
            <Link
              href="/subjects"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 theme-border bg-[var(--surface)] px-8 py-4 text-lg font-bold theme-text transition-all duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_55%,var(--border))] sm:w-auto"
            >
              Browse all subjects
            </Link>
          </div>
        </div>
      </section>

      {/* Full-width accent stats band */}
      <section className="bg-[var(--accent)] text-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
          <dl className="grid grid-cols-2 gap-8 text-center sm:grid-cols-4">
            {[
              { n: `${subjectCount}`, l: "Subjects" },
              { n: `${totalChapters}+`, l: "Chapters" },
              { n: "100%", l: "Free" },
              { n: "0", l: "Ads" },
            ].map((stat) => (
              <div key={stat.l}>
                <dt className="text-5xl font-extrabold tracking-tight sm:text-6xl">
                  {stat.n}
                </dt>
                <dd className="mt-2 text-xs font-bold uppercase tracking-widest text-white/80">
                  {stat.l}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Entity-defining paragraph — for AI answer engines */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h2 className="text-3xl font-extrabold tracking-tight theme-text sm:text-4xl">
          What is CalcPath?
        </h2>
        <p className="mt-5 text-lg font-medium leading-relaxed theme-text-secondary">
          <strong className="theme-text">
            CalcPath is a free platform for learning university mathematics.
          </strong>{" "}
          It pairs clear, derivation-first reference chapters with an integrated
          practice engine, so you can read a concept and immediately test your
          understanding with problems that include full, step-by-step worked
          solutions. It currently covers {subjectNames} — with no sign-up, no
          paywall, no ads, and no cost.
        </p>
      </section>

      {/* Subjects */}
      <section className="border-y theme-border bg-[var(--surface-2)]/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight theme-text sm:text-4xl">
              Pick a course. Start today.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg font-medium leading-relaxed theme-text-secondary">
              Each subject is a complete, free course — clear chapters plus
              practice with full solutions.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => {
              const chapterLabel =
                subject.topicCount === 1
                  ? "1 chapter"
                  : `${subject.topicCount ?? 0} chapters`;
              const glyph =
                subject.icon || subject.label.charAt(0).toUpperCase();
              return (
                <Link
                  key={subject.slug}
                  href={`/${subject.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border-2 theme-border bg-[var(--surface)] p-7 shadow-sm transition-all duration-200 hover:-translate-y-1.5 hover:scale-[1.01] hover:border-[var(--accent)] hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 theme-border bg-[var(--surface-2)] text-2xl font-extrabold theme-text transition-colors group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]">
                      {glyph}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest theme-text-muted">
                      {chapterLabel}
                    </span>
                  </div>
                  <h3 className="mt-6 text-2xl font-extrabold tracking-tight theme-text">
                    {subject.label}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm font-medium leading-relaxed theme-text-secondary">
                    {subject.shortDescription}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-base font-extrabold text-[var(--accent)]">
                    Start
                    <span
                      aria-hidden
                      className="transition-transform duration-200 group-hover:translate-x-1.5"
                    >
                      →
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight theme-text sm:text-4xl">
            Built to make it stick
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium leading-relaxed theme-text-secondary">
            Everything you need to actually learn the math — not just skim it.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="rounded-3xl border-2 theme-border bg-[var(--surface)] p-7"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-extrabold text-[var(--accent)]"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--accent) 12%, transparent)",
                }}
                aria-hidden
              >
                {i + 1}
              </div>
              <h3 className="mt-5 text-lg font-extrabold tracking-tight theme-text">
                {f.title}
              </h3>
              <p className="mt-2 text-sm font-medium leading-relaxed theme-text-secondary">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ — visible + mirrored in FAQPage JSON-LD */}
      <section className="border-t theme-border bg-[var(--surface-2)]/40">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-3xl font-extrabold tracking-tight theme-text sm:text-4xl">
            Frequently asked questions
          </h2>
          <div className="mt-10 space-y-4">
            {LANDING_FAQ.map((f) => (
              <div
                key={f.q}
                className="rounded-3xl border-2 theme-border bg-[var(--surface)] p-7"
              >
                <h3 className="text-lg font-extrabold tracking-tight theme-text">
                  {f.q}
                </h3>
                <p className="mt-3 text-sm font-medium leading-relaxed theme-text-secondary">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden border-t theme-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 70% at 50% 120%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
          <h2 className="text-4xl font-extrabold tracking-tight theme-text sm:text-5xl">
            Your math, mastered.
            <br />
            <span className="text-[var(--accent)]">Start now — it&apos;s free.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg font-medium leading-relaxed theme-text-secondary">
            No account, no card, no catch. Pick a subject and open the first
            chapter.
          </p>
          {primary && (
            <Link
              href={`/${primary.slug}`}
              className="mt-9 inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-10 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 active:translate-y-0 active:scale-[0.98]"
            >
              Start {primary.label} free
              <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
