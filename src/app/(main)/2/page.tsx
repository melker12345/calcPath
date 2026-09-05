import Link from "next/link";
import {
  JsonLd,
  LANDING_FAQ,
  buildLandingJsonLd,
  buildLandingMetadata,
  getLandingData,
} from "@/lib/landing/seo";

/**
 * Landing variant 2 — "Editorial / academic authority". Typeset like a scholarly
 * course index: serif headings, a left-aligned hero, subjects as an elegant
 * numbered contents list, and generous ink-on-paper whitespace. Server Component:
 * all copy, catalogue and FAQ render as crawlable HTML with no client JS.
 * SEO/JSON-LD come from @/lib/landing/seo.
 */

export const metadata = buildLandingMetadata({
  path: "/2",
  title:
    "CalcPath — Free University Mathematics: Calculus, Linear Algebra & Statistics",
  description:
    "A free, ad-free reference for university mathematics. Study calculus, linear algebra and statistics through clear, derivation-first chapters and practice problems with full step-by-step worked solutions. No account required.",
});

const FEATURES = [
  {
    title: "Derivation-first chapters",
    body: "Each topic is written like a good textbook section: definitions, motivation and full derivations, so you understand where every result comes from rather than memorising it.",
  },
  {
    title: "Practice with full solutions",
    body: "Every practice problem is paired with a complete, step-by-step worked solution — you learn from the method, not just the final answer.",
  },
  {
    title: "A diagnostic and topic tests",
    body: "A short diagnostic surfaces exactly which topics need attention, and per-topic tests confirm mastery before you move on.",
  },
  {
    title: "Automatic progress tracking",
    body: "Completed chapters and solved problems are saved on your device automatically, so you always resume precisely where you left off.",
  },
];

export default async function LandingV2() {
  const data = await getLandingData();
  const { subjects, subjectCount, totalChapters, primary, subjectNames } = data;

  return (
    <div className="theme-bg theme-text">
      <JsonLd data={buildLandingJsonLd(data)} />

      {/* Hero — left-aligned, editorial */}
      <header className="mx-auto max-w-4xl px-4 pt-20 pb-12 sm:px-6 sm:pt-28">
        <p className="text-xs font-medium uppercase tracking-[0.2em] theme-text-muted">
          Free · Ad-free · No account required
        </p>
        <h1 className="mt-6 font-serif text-4xl font-medium leading-[1.1] tracking-tight theme-text sm:text-6xl">
          University mathematics,
          <br className="hidden sm:block" />{" "}
          <span className="italic text-[var(--accent)]">clearly derived</span>.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-relaxed theme-text-secondary">
          CalcPath is a free, ad-free reference for calculus, linear algebra and
          statistics — clear, derivation-first chapters paired with practice
          problems that carry full, step-by-step worked solutions. Read the
          theory, then prove you have understood it.
        </p>

        <div className="mt-9 flex flex-col gap-x-8 gap-y-4 sm:flex-row sm:items-center">
          {primary && (
            <Link
              href={`/${primary.slug}`}
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-6 py-3 text-base font-medium text-white transition hover:opacity-90 active:scale-[0.99]"
            >
              Begin with {primary.label}
              <span
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          )}
          <Link
            href="/subjects"
            className="inline-flex items-center gap-1.5 text-base font-medium theme-text-secondary underline-offset-4 transition hover:text-[var(--accent)] hover:underline"
          >
            View the full catalogue
          </Link>
        </div>

        <hr className="mt-14 theme-border" aria-hidden />
      </header>

      {/* Entity-defining paragraph */}
      <section className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
        <h2 className="font-serif text-2xl font-medium tracking-tight theme-text sm:text-3xl">
          About CalcPath
        </h2>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed theme-text-secondary">
          CalcPath is a free platform for learning university mathematics. It
          combines self-contained reference chapters with an integrated practice
          engine, so you can read a concept and immediately test it against
          problems that include complete worked solutions. It currently covers{" "}
          <span className="theme-text">{subjectNames}</span>, spanning{" "}
          {totalChapters} chapters across {subjectCount} subjects — with no
          sign-up, no advertising and no cost.
        </p>
      </section>

      {/* Subjects — numbered contents list */}
      <section className="mx-auto mt-12 max-w-5xl px-4 sm:px-6">
        <div className="flex items-baseline justify-between gap-4 border-b theme-border pb-4">
          <h2 className="font-serif text-2xl font-medium tracking-tight theme-text sm:text-3xl">
            Contents
          </h2>
          <p className="text-xs font-medium uppercase tracking-[0.16em] theme-text-muted">
            {subjectCount} subjects
          </p>
        </div>

        <ol className="mt-2">
          {subjects.map((subject, i) => {
            const chapterLabel =
              subject.topicCount === 1
                ? "1 chapter"
                : `${subject.topicCount ?? 0} chapters`;
            const index = String(i + 1).padStart(2, "0");

            return (
              <li key={subject.slug} className="border-t theme-border first:border-t-0">
                <Link
                  href={`/${subject.slug}`}
                  className="group flex items-baseline gap-5 rounded-md px-3 py-6 transition-colors hover:bg-[var(--surface-2)] sm:gap-8 sm:px-4"
                >
                  <span
                    aria-hidden
                    className="font-serif text-2xl font-normal tabular-nums theme-text-muted transition-colors group-hover:text-[var(--accent)] sm:text-3xl"
                  >
                    {index}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-serif text-xl font-medium tracking-tight theme-text sm:text-2xl">
                        {subject.label}
                      </span>
                      <span className="text-xs font-medium uppercase tracking-[0.14em] theme-text-muted">
                        {chapterLabel}
                      </span>
                    </span>
                    <span className="mt-1.5 block max-w-2xl text-sm leading-relaxed theme-text-secondary">
                      {subject.shortDescription}
                    </span>
                  </span>
                  <span className="hidden shrink-0 items-center gap-1.5 self-center text-sm font-medium text-[var(--accent)] sm:inline-flex">
                    Read
                    <span
                      aria-hidden
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {/* How it works */}
      <section className="mx-auto mt-24 max-w-4xl px-4 sm:px-6">
        <h2 className="font-serif text-2xl font-medium tracking-tight theme-text sm:text-3xl">
          How it works
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed theme-text-secondary">
          The method behind every subject is the same: understand the idea, then
          practise it until it is second nature.
        </p>

        <dl className="mt-10 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="border-t theme-border pt-5">
              <span
                aria-hidden
                className="font-serif text-sm font-medium tabular-nums text-[var(--accent)]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <dt className="mt-2 font-serif text-xl font-medium tracking-tight theme-text">
                {f.title}
              </dt>
              <dd className="mt-2 text-base leading-relaxed theme-text-secondary">
                {f.body}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* FAQ — visible, mirrored in FAQPage JSON-LD */}
      <section className="mx-auto mt-24 max-w-4xl px-4 sm:px-6">
        <h2 className="font-serif text-2xl font-medium tracking-tight theme-text sm:text-3xl">
          Frequently asked questions
        </h2>
        <div className="mt-8 divide-y theme-border border-y theme-border">
          {LANDING_FAQ.map((f) => (
            <details key={f.q} className="group py-5 [&_summary]:cursor-pointer">
              <summary className="flex items-baseline justify-between gap-6 font-serif text-lg font-medium theme-text marker:content-['']">
                {f.q}
                <span
                  aria-hidden
                  className="mt-1 shrink-0 text-[var(--accent)] transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-base leading-relaxed theme-text-secondary">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto mt-24 mb-28 max-w-4xl px-4 sm:px-6">
        <div className="border-t-2 border-[var(--accent)] pt-10">
          <h2 className="font-serif text-3xl font-medium tracking-tight theme-text sm:text-4xl">
            Open the first chapter.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed theme-text-secondary">
            No account, no card, no catch — pick a subject and start reading. Your
            progress saves itself as you go.
          </p>
          {primary && (
            <Link
              href={`/${primary.slug}`}
              className="group mt-8 inline-flex items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-7 py-3.5 text-base font-medium text-white transition hover:opacity-90 active:scale-[0.99]"
            >
              Begin with {primary.label}
              <span
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
