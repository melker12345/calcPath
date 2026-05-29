import type { Metadata } from "next";
import Link from "next/link";

// Accent comes from CSS variables for proper light/dark theming (GitHub-inspired blues)


const subjects = [
  {
    slug: "calculus" as const,
    label: "Calculus",
    icon: "∫",
    count: 8,
    topics: ["Limits & Continuity", "Derivatives", "Integrals", "Series & Sequences", "Differential Equations"],
  },
  {
    slug: "linear-algebra" as const,
    label: "Linear Algebra",
    icon: "λ",
    count: 9,
    topics: ["Vectors & Operations", "Matrices", "Determinants", "Eigenvalues", "Vector Spaces"],
  },
  {
    slug: "statistics" as const,
    label: "Statistics",
    icon: "σ",
    count: 11,
    topics: ["Probability", "Distributions", "Inference", "Regression", "Hypothesis Testing"],
  },
];

const standards = [
  {
    num: "01",
    title: "Precision first",
    text: "Definitions are exact. Derivations show every meaningful step. Nothing is left as \"obvious\".",
  },
  {
    num: "02",
    title: "Examples before abstraction",
    text: "You meet every concept through concrete, carefully chosen problems before the general machinery appears.",
  },
  {
    num: "03",
    title: "Feedback that actually teaches",
    text: "Incorrect answers are met with precise hints that address the exact misunderstanding — not generic encouragement.",
  },
  {
    num: "04",
    title: "Designed for the long term",
    text: "The goal is lasting understanding, not just passing the next exam. The structure reflects that.",
  },
];

export const metadata: Metadata = {
  title: "CalcPath — Learn University Mathematics for Free",
  description:
    "Free university-level math courses with step-by-step lessons and practice problems. Learn calculus, statistics, and linear algebra at your own pace — no account required.",
  keywords: [
    "learn university mathematics",
    "university math",
    "free math courses",
    "learn calculus online",
    "learn statistics online",
    "learn linear algebra online",
    "university math practice",
    "calculus course free",
    "statistics course free",
    "linear algebra course free",
  ],
  alternates: { canonical: "https://calc-path.com" },
  openGraph: {
    title: "CalcPath — Learn University Mathematics for Free",
    description:
      "Free step-by-step courses in calculus, statistics, and linear algebra. Practice problems with instant feedback, worked solutions, and no account required.",
    url: "https://calc-path.com",
  },
};

export default function HomePage() {
  return (
    <main>
      {/* Hero — clean, editorial */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-14">
        <div className="max-w-[46rem]">
          <div 
            className="inline-block rounded-full px-3 py-1 text-[11px] font-semibold tracking-[1.5px] theme-text"
            style={{ color: 'var(--accent)' }}
          >
            FREE UNIVERSITY MATHEMATICS
          </div>

          <h1 className="mt-5 text-[68px] font-semibold tracking-[-3.8px] leading-[0.96] theme-text">
            University mathematics,<br />written properly.
          </h1>

          <p className="mt-6 max-w-lg text-[17px] leading-relaxed theme-text-secondary">
            Three complete, self-contained courses. Every explanation is written to be read, 
            not skimmed. Every problem exists to build real understanding.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/calculus"
              className="inline-flex items-center justify-center rounded-xl px-8 py-3 text-[15px] font-semibold text-white transition active:scale-[0.985]"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Begin with Calculus
            </Link>
            <Link
              href="/diagnostic"
              className="inline-flex items-center justify-center rounded-xl border theme-border theme-surface px-6 py-3 text-[15px] font-semibold theme-text transition hover:theme-surface-2"
            >
              Find your starting point
            </Link>
          </div>
        </div>
      </section>

      {/* The Curriculum */}
      <section className="border-y theme-border theme-surface py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-9">
            <div className="text-[11px] font-semibold tracking-[1.5px]" style={{ color: 'var(--accent)' }}>
              THE CURRICULUM
            </div>
            <div className="mt-2 text-4xl font-semibold tracking-[-1.3px] text-black theme-text">
              Three complete courses
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {subjects.map((subject) => (
              <Link
                key={subject.slug}
                href={`/${subject.slug}`}
                className="group flex flex-col rounded-3xl border theme-border theme-surface p-8 transition-all hover:border-zinc-300 active:bg-zinc-50 dark:hover:border-[#484f58]"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-4xl font-light text-white transition dark:text-[#0d1117]"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    {subject.icon}
                  </div>
                  <div>
                    <div className="text-[26px] font-semibold tracking-[-0.6px] text-black theme-text">{subject.label}</div>
                    <div className="text-sm theme-text-muted">{subject.count} modules</div>
                  </div>
                </div>

                <div className="mt-8 space-y-[13px] border-t border-zinc-100 pt-7 text-[14.5px] dark:border-[#30363d]">
                  {subject.topics.map((topic, idx) => (
                    <div key={idx} className="flex items-center gap-3 theme-text-secondary group-hover:theme-text">
                      <span className="font-mono text-[10px] text-zinc-400 tabular-nums dark:text-[#484f58]">{String(idx + 1).padStart(2, "0")}</span>
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>

                <div 
                  className="mt-auto flex items-center gap-1.5 pt-9 text-sm font-medium transition"
                  style={{ color: 'var(--accent)' }}
                >
                  Open course <span className="transition group-hover:translate-x-0.5">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* The Standard */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <div className="text-[11px] font-semibold tracking-[1.5px]" style={{ color: 'var(--accent)' }}>
            THE STANDARD
          </div>
          <h2 className="mt-2 text-4xl font-semibold tracking-[-1.2px] text-black theme-text">
            Built like documentation.<br />Not like a textbook.
          </h2>
          <p className="mt-4 text-lg theme-text-secondary">
            Most math resources are either too terse or too hand-holdy. These notes aim for the difficult middle: 
            rigorous enough for real understanding, clear enough to read without a lecturer.
          </p>
        </div>

        <div className="mt-12 grid gap-x-9 gap-y-11 md:grid-cols-2">
          {standards.map((item, index) => (
            <div key={index} className="flex gap-5">
              <div 
                className="mt-0.5 w-8 font-mono text-sm font-semibold tabular-nums"
                style={{ color: 'var(--accent)' }}
              >
                {item.num}
              </div>
              <div>
                <div className="text-[17px] font-semibold tracking-tight text-black theme-text">{item.title}</div>
                <p className="mt-2.5 text-[15px] leading-relaxed theme-text-secondary">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Inside the notes */}
      <section className="border-y theme-border theme-surface py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-7 flex items-center gap-3">
            <div 
              className="rounded px-2.5 py-px text-[10px] font-bold tracking-[1.5px] text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              CALCULUS • LIMITS
            </div>
            <div className="text-xs uppercase tracking-widest theme-text-muted">From the notes</div>
          </div>

          <div className="max-w-3xl">
            <h3 className="text-3xl font-semibold tracking-[-0.7px] text-black theme-text">When substitution fails</h3>
            <p className="mt-3 text-[16px] leading-relaxed theme-text-secondary">
              Direct substitution is the fastest way to evaluate a limit — until it produces the indeterminate form 0/0. 
              In those cases we usually need algebraic manipulation before we can proceed.
            </p>

            <div className="mt-8 rounded-2xl border theme-border theme-surface p-8">
              <div className="font-mono text-sm theme-text-muted">Example</div>
              <div className="mt-1.5 font-mono text-[17px] tracking-tight text-black theme-text">
                lim<sub className="text-sm">x→2</sub> (x² − 4) / (x − 2)
              </div>

              <div className="mt-6 space-y-2 text-[14.5px] theme-text-secondary">
                <div>1. Substituting x = 2 gives 0/0 — indeterminate.</div>
                <div>2. Factor numerator: x² − 4 = (x − 2)(x + 2)</div>
                <div>3. Cancel the common factor (valid for x ≠ 2)</div>
                <div>4. The expression simplifies to x + 2</div>
                <div className="pt-1.5" style={{ color: 'var(--accent)' }}>Result: lim = 4</div>
              </div>
            </div>

            <div className="mt-5">
              <Link 
                href="/calculus/modules/limits" 
                className="inline-flex items-center text-[14px] font-medium transition hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                Continue reading the Limits module →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Start anywhere */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-[11px] font-semibold tracking-[1.5px]" style={{ color: 'var(--accent)' }}>
          START ANYWHERE
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { href: "/calculus", label: "Calculus", sub: "Start from the beginning" },
            { href: "/diagnostic", label: "Take the diagnostic", sub: "See where you actually are" },
            { href: "/linear-algebra", label: "Linear Algebra", sub: "Jump straight in" },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="group flex items-center justify-between rounded-2xl border theme-border theme-surface px-7 py-5 text-sm transition hover:border-zinc-300 dark:hover:border-[#484f58]"
            >
              <div>
                <div className="font-semibold text-black theme-text">{item.label}</div>
                <div className="theme-text-muted">{item.sub}</div>
              </div>
              <span className="text-xl theme-text-muted transition">→</span>
            </Link>
          ))}
        </div>

        <div className="mt-9 text-center text-sm theme-text-muted">
          All material is free. No account required to read or practice.
        </div>
      </section>
    </main>
  );
}
