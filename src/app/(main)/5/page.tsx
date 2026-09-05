import Link from "next/link";
import {
  JsonLd,
  LANDING_FAQ,
  buildLandingJsonLd,
  buildLandingMetadata,
  getLandingData,
} from "@/lib/landing/seo";
import { SubjectCard } from "@/components/subject-card";

/**
 * Landing variant 5 — "Warm, friendly, approachable" + conversion psychology.
 *
 * Honest persuasion patterns layered in (no fabricated proof):
 *  - Friction reduction: reassurance microcopy at every CTA.
 *  - Problem–Agitate–Solve: name the pain before the relief.
 *  - Reciprocity + curiosity gap: a real sample problem with a click-to-reveal
 *    solution (native <details>, no client JS).
 *  - Anchoring / price contrast: what learning normally costs vs. $0.
 *  - Goal-gradient: the "how it works" steps framed as a numbered path.
 *
 * Server Component: all copy, catalogue and FAQ render as crawlable HTML with no
 * client JS. SEO/JSON-LD come from @/lib/landing/seo.
 */

export const metadata = buildLandingMetadata({
  path: "/5",
  title: "Learn University Math, Free & Friendly — Calculus, Linear Algebra & Stats",
  description:
    "CalcPath is a free, welcoming way to learn university mathematics. Clear chapters, worked examples, and practice problems with full step-by-step solutions for calculus, linear algebra and statistics — no account, no pressure, no cost.",
});

// Social proof — a real figure, not fabricated.
// Source: Cloudflare Analytics, total unique visitors, trailing 30 days
// (4.22k as of 2026-07-10, rounded down conservatively). Update periodically.
const MONTHLY_VISITORS = "4,200+";

const PAINS = [
  "You re-read the same paragraph three times, and it still won't click.",
  "The lecture moved on — and you didn't.",
  "The textbook skips the exact step you were stuck on.",
];

const COSTS = [
  { label: "A private tutor", price: "$40–80", unit: "/hour" },
  { label: "One course textbook", price: "$150+", unit: "" },
  { label: "An online course", price: "$50–200", unit: "" },
];

const STEPS = [
  {
    title: "Read it, and get it",
    body: "Derivation-first chapters that build each idea up from where it comes from — so the why sticks, not just the what.",
  },
  {
    title: "Practise, never stuck",
    body: "Every problem comes with a full, step-by-step worked solution. Get one wrong? You'll see exactly where and why — no dead ends.",
  },
  {
    title: "Know where to start",
    body: "A gentle diagnostic finds your gaps, and topic tests quietly confirm when a concept has clicked. No guesswork.",
  },
  {
    title: "See yourself grow",
    body: "Your progress saves automatically as you go, so you can always pick up right where you left off and watch it add up.",
  },
];

export default async function Page() {
  const data = await getLandingData();
  const { subjects, subjectCount, totalChapters, primary, subjectNames } = data;

  return (
    <div className="theme-bg theme-text">
      <JsonLd data={buildLandingJsonLd(data)} />

      {/* Hero — gentle gradient, warm and reassuring */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 60% at 50% -5%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 65%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/3 h-64 opacity-60"
          style={{
            background:
              "radial-gradient(50% 80% at 85% 40%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-5 py-20 text-center sm:py-28">
          <p className="inline-flex items-center gap-2 rounded-full border theme-border bg-[var(--surface)] px-4 py-1.5 text-sm font-medium theme-text-secondary shadow-sm">
            <span aria-hidden>👋</span> Free forever · No account needed
          </p>

          <h1 className="mx-auto mt-7 max-w-3xl text-balance font-serif text-4xl font-medium leading-[1.12] tracking-tight theme-text sm:text-6xl">
            Learning math shouldn&apos;t be lonely
            <br className="hidden sm:block" />{" "}
            <span className="text-[var(--accent)]">— or expensive.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed theme-text-secondary sm:text-xl">
            CalcPath is your patient, always-there guide to university
            mathematics. Clear explanations, gentle practice, and full worked
            solutions for every problem — so you are never left stuck. Take it at
            your own pace. You&apos;ve got this.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {primary && (
              <Link
                href={`/${primary.slug}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-7 py-3.5 text-base font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] sm:w-auto"
              >
                Start with {primary.label} <span aria-hidden>→</span>
              </Link>
            )}
            <Link
              href="/subjects"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border theme-border bg-[var(--surface)] px-7 py-3.5 text-base font-semibold theme-text-secondary shadow-sm transition hover:border-[color-mix(in_srgb,var(--accent)_40%,var(--border))] hover:theme-text sm:w-auto"
            >
              Browse all subjects
            </Link>
          </div>

          {/* Social proof — real Cloudflare figure, at the decision point.
              One proof line + one fact line; "free/no signup" lives in the badge above. */}
          <p className="mt-7 text-sm theme-text-secondary">
            Join{" "}
            <span className="font-semibold theme-text">{MONTHLY_VISITORS} students</span>{" "}
            who learned here in the last 30 days
          </p>
          <p className="mt-2 text-sm theme-text-muted">
            {subjectCount} courses · {totalChapters}+ chapters · start in seconds
          </p>
        </div>
      </section>

      {/* Problem–Agitate–Solve — name the pain, then the relief */}
      <section className="mx-auto max-w-4xl px-5 py-14">
        <div className="rounded-3xl border theme-border bg-[var(--surface)] p-7 shadow-sm sm:p-10">
          <h2 className="text-center font-serif text-2xl font-medium tracking-tight theme-text sm:text-3xl">
            We&apos;ve all had that moment.
          </h2>
          <ul className="mx-auto mt-7 grid max-w-3xl gap-3 sm:grid-cols-3">
            {PAINS.map((pain) => (
              <li
                key={pain}
                className="rounded-2xl border theme-border bg-[var(--surface-2)] px-4 py-4 text-sm leading-relaxed theme-text-secondary"
              >
                {pain}
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-7 max-w-2xl text-center text-lg leading-relaxed theme-text sm:text-xl">
            That exact moment — stuck, a little frustrated, not sure where to turn
            — is what CalcPath is built for.
          </p>
        </div>
      </section>

      {/* Entity block — defines the platform; sentence kept verbatim for AI answer engines */}
      <section className="mx-auto max-w-3xl px-5 py-14 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          What is CalcPath?
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-balance font-serif text-2xl font-medium leading-snug tracking-tight theme-text sm:text-3xl">
          CalcPath is a free platform for learning university mathematics.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed theme-text-secondary sm:text-lg">
          It pairs warm, clear reference chapters with gentle, built-in practice,
          so you can read an idea and try it out straight away — with full,
          step-by-step solutions whenever you get stuck. Right now it welcomes you
          into {subjectNames}. No sign-up, no ads, no cost — just a kind place to
          learn at your own speed.
        </p>
      </section>

      {/* Reciprocity + curiosity gap — try a real problem, reveal the solution */}
      <section className="mx-auto max-w-3xl px-5 py-12">
        <div className="mb-6 text-center">
          <h2 className="font-serif text-3xl font-medium tracking-tight theme-text sm:text-4xl">
            See how it feels — try one now
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed theme-text-secondary">
            No signup, nothing to install. Here&apos;s a real CalcPath problem.
            Have a go, then peek at the full solution.
          </p>
        </div>

        <div className="rounded-3xl border theme-border bg-[var(--surface)] p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            Warm-up · Calculus
          </p>
          <p className="mt-3 text-lg theme-text sm:text-xl">
            Differentiate <span className="font-semibold">f(x) = 3x² − 5x + 2</span>.
          </p>

          <details className="group mt-5 rounded-2xl border theme-border bg-[var(--surface-2)] p-5 [&_summary]:cursor-pointer">
            <summary className="flex items-center justify-between gap-4 text-sm font-semibold text-[var(--accent)] marker:content-['']">
              Reveal the step-by-step solution
              <span aria-hidden className="transition-transform duration-200 group-open:rotate-45">
                +
              </span>
            </summary>
            <ol className="mt-4 space-y-2 text-sm leading-relaxed theme-text-secondary">
              <li>
                <strong className="theme-text">1.</strong> Differentiate each term
                on its own using the power rule, d/dx[axⁿ] = n·a·xⁿ⁻¹.
              </li>
              <li>
                <strong className="theme-text">2.</strong> 3x² → 6x, then −5x → −5,
                and the constant +2 → 0.
              </li>
              <li>
                <strong className="theme-text">3.</strong> Add them back together:{" "}
                <span className="font-semibold theme-text">f′(x) = 6x − 5.</span>
              </li>
            </ol>
            <p className="mt-4 text-sm leading-relaxed theme-text-secondary">
              That&apos;s every problem on CalcPath — you&apos;re never handed just
              an answer, always the reasoning that gets you there.
            </p>
          </details>

          {primary && (
            <Link
              href={`/${primary.slug}/practice`}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)]"
            >
              Try more like this <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      </section>

      {/* Subjects — refined typographic course cards */}
      <section className="border-y theme-border bg-[color-mix(in_srgb,var(--accent)_5%,transparent)]">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-medium tracking-tight theme-text sm:text-4xl">
              Pick a subject — start wherever feels right
            </h2>
            <p className="mt-4 text-base leading-relaxed theme-text-secondary sm:text-lg">
              Each one is a complete, free course. There&apos;s no wrong place to
              begin — take it one chapter at a time.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <SubjectCard key={subject.slug} subject={subject} />
            ))}
          </div>
        </div>
      </section>

      {/* Anchoring / price contrast — what learning usually costs, vs. $0 */}
      <section className="mx-auto max-w-4xl px-5 py-16 sm:py-20">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-medium tracking-tight theme-text sm:text-4xl">
            Everywhere else, getting unstuck costs money
          </h2>
          <p className="mt-4 text-base leading-relaxed theme-text-secondary sm:text-lg">
            Real help with university math usually comes with a price tag.
          </p>
        </div>

        {/* Receipt: the familiar "what it usually costs" artifact, itemised,
            with CalcPath as the total. One object, one glance, one idea. */}
        <div className="mx-auto max-w-md rounded-2xl border theme-border bg-[var(--surface)] p-7 shadow-[0_16px_40px_-24px_rgba(2,6,23,0.35)] sm:p-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] theme-text-muted">
            Getting unstuck — the usual bill
          </p>

          <dl className="mt-6 space-y-3">
            {COSTS.map((c) => (
              <div
                key={c.label}
                className="flex items-baseline justify-between gap-4 border-b border-dashed theme-border pb-3"
              >
                <dt className="text-sm theme-text-secondary">{c.label}</dt>
                <dd className="text-sm font-semibold tabular-nums theme-text-muted line-through decoration-[color-mix(in_srgb,var(--accent)_50%,transparent)]">
                  {c.price}
                  {c.unit}
                </dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-4 pt-1">
              <dt className="text-base font-semibold theme-text">CalcPath</dt>
              <dd className="font-serif text-3xl font-semibold tabular-nums text-[var(--accent)]">
                $0
              </dd>
            </div>
          </dl>

          <p className="mt-6 border-t theme-border pt-4 text-center text-xs leading-relaxed theme-text-muted">
            Free forever. Funded by optional donations — never by ads or your
            data.
          </p>
        </div>
      </section>

      {/* How it works — reframed as a numbered path (goal-gradient) */}
      <section className="border-t theme-border bg-[color-mix(in_srgb,var(--accent)_5%,transparent)]">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-medium tracking-tight theme-text sm:text-4xl">
              Your path from stuck to confident
            </h2>
            <p className="mt-4 text-base leading-relaxed theme-text-secondary sm:text-lg">
              Four small steps — no lectures to keep up with, no pressure to be
              perfect.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="flex gap-4 rounded-3xl border theme-border bg-[var(--surface)] p-6 shadow-sm"
              >
                <div
                  aria-hidden
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold text-[var(--accent)]"
                  style={{
                    background:
                      "color-mix(in srgb, var(--accent) 12%, transparent)",
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-lg font-semibold theme-text">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed theme-text-secondary">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — visible answers, mirrored in FAQPage JSON-LD */}
      <section className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
        <div className="mb-10 text-center">
          <h2 className="font-serif text-3xl font-medium tracking-tight theme-text sm:text-4xl">
            Questions? That&apos;s completely normal.
          </h2>
          <p className="mt-4 text-base leading-relaxed theme-text-secondary">
            Here are the things people ask us most.
          </p>
        </div>

        <div className="space-y-4">
          {LANDING_FAQ.map((f) => (
            <div
              key={f.q}
              className="rounded-3xl border theme-border bg-[var(--surface)] p-6 shadow-sm"
            >
              <h3 className="text-base font-semibold theme-text sm:text-lg">
                {f.q}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed theme-text-secondary sm:text-base">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA — warm and encouraging */}
      <section className="relative overflow-hidden px-5 py-20 sm:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 70% at 50% 120%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 65%)",
          }}
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-serif text-3xl font-medium tracking-tight theme-text sm:text-5xl">
            You&apos;ve got this — start today,{" "}
            <span className="whitespace-nowrap text-[var(--accent)]">
              it&apos;s free.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed theme-text-secondary">
            No card, no account, no catch. Just open a chapter and take the first
            small step. We&apos;ll be right here the whole way.
          </p>
          {primary && (
            <Link
              href={`/${primary.slug}`}
              className="mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-8 py-4 text-base font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98]"
            >
              Start with {primary.label} <span aria-hidden>→</span>
            </Link>
          )}
          <p className="mt-5 text-sm theme-text-muted">
            No signup · No card · Start in seconds
          </p>
        </div>
      </section>
    </div>
  );
}
