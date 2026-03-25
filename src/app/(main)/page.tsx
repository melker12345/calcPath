import type { Metadata } from "next";
import Link from "next/link";
import { problems as calculusProblems } from "@/lib/calculus-content";
import { problems as statisticsProblems } from "@/lib/statistics-content";
import { problems as linalgProblems } from "@/lib/linalg-content";

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

const heading = "var(--font-inter), system-ui, -apple-system, sans-serif";
const body = "var(--font-inter), system-ui, -apple-system, sans-serif";

const subjects = [
  // Problem counts are derived from the actual content files — same source as the dashboard.
  {
    slug: "calculus",
    title: "Calculus",
    icon: "∫",
    description:
      `Limits, derivatives, integrals, series, differential equations, and more. 8 modules with ${calculusProblems.length}+ practice problems — each solved step by step.`,
    modules: 8,
    problems: calculusProblems.length,
    available: true,
    accentColor: "#dc2626",
    bgColor: "#f8fafc",
    bgOpacity: 0.4,
    bgPattern: `linear-gradient(#93c5fd33 1px, transparent 1px), linear-gradient(90deg, #93c5fd33 1px, transparent 1px)`,
    bgSize: "20px 20px",
    textColor: "#18181b",
    mutedColor: "#52525b",
    borderColor: "rgba(0,0,0,0.08)",
    statColor: "#18181b",
    darkCard: false,
  },
  {
    slug: "statistics",
    title: "Statistics",
    icon: "σ",
    description:
      `Descriptive statistics, probability, distributions, hypothesis testing, regression, and more. 10 modules with ${statisticsProblems.length}+ practice problems — each solved step by step.`,
    modules: 10,
    problems: statisticsProblems.length,
    available: true,
    accentColor: "#fde68a",
    bgColor: "#1a3a2a",
    bgOpacity: 0.92,
    bgPattern: `radial-gradient(circle at 80% 20%, rgba(253,230,138,0.06) 0%, transparent 60%)`,
    bgSize: "auto",
    textColor: "#e8e4d9",
    mutedColor: "rgba(232,228,217,0.6)",
    borderColor: "rgba(253,230,138,0.22)",
    statColor: "#fde68a",
    darkCard: true,
  },
  {
    slug: "linear-algebra",
    title: "Linear Algebra",
    icon: "λ",
    description:
      `Vectors, matrices, systems of equations, vector spaces, eigenvalues, and more. 8 modules with ${linalgProblems.length}+ practice problems — each solved step by step.`,
    modules: 8,
    problems: linalgProblems.length,
    available: true,
    accentColor: "#3372A2",
    bgColor: "#0f172a",
    bgOpacity: 0.92,
    bgPattern: `radial-gradient(circle at 80% 20%, rgba(51,114,162,0.12) 0%, transparent 60%)`,
    bgSize: "auto",
    textColor: "#e2e8f0",
    mutedColor: "rgba(226,232,240,0.6)",
    borderColor: "rgba(51,114,162,0.35)",
    statColor: "#5b9bd5",
    darkCard: true,
  },
  {
    slug: "discrete-math",
    title: "Discrete Mathematics",
    icon: "Σ",
    description:
      "Discrete mathematics is the study of mathematical structures that are countable, distinct, and separable, rather than continuous",
    modules: 4,
    problems: 120,
    available: false,
    accentColor: "#AC21FC",
    bgColor: "#1a3a2a",
    bgOpacity: 0.4,
    bgPattern: "none",
    bgSize: "auto",
    textColor: "#18181b",
    mutedColor: "#52525b",
    borderColor: "rgba(0,0,0,0.04)",
    statColor: "#18181b",
    darkCard: false,
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="px-6 pb-16 pt-16 sm:px-12 sm:pb-24 sm:pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-orange-600" style={{ fontFamily: body }}>
            CalcPath
          </p>
          <h1
            className="text-[2.5rem] font-bold leading-[1.08] tracking-tight text-zinc-900 sm:text-[3.5rem] md:text-[4.5rem]"
            style={{ fontFamily: heading }}
          >
            Learn math by<br />
            <span className="text-orange-600">understanding it</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-zinc-600 sm:text-lg" style={{ fontFamily: body }}>
            Free step-by-step courses with practice problems, instant feedback, and detailed solutions. Pick a subject and start learning.
          </p>
        </div>
      </section>

      {/* Subject cards */}
      <section className="px-6 pb-24 sm:px-12 sm:pb-32">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-xl font-bold text-zinc-900 sm:text-2xl" style={{ fontFamily: heading }}>
            Subjects
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            {subjects.map((subject) => {
              const classes = `group relative overflow-hidden rounded-2xl border-2 p-6 transition-all sm:p-8 ${
                subject.available
                  ? "cursor-pointer hover:shadow-xl"
                  : "opacity-75"
              }`;

              const inner = (
                <>
                  {/* Themed background */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: subject.bgColor,
                      backgroundImage: subject.bgPattern,
                      backgroundSize: subject.bgSize,
                      opacity: subject.bgOpacity,
                    }}
                    aria-hidden="true"
                  />

                  <div className="relative z-10">
                    {/* Icon + title */}
                    <div className="mb-4 flex items-center gap-3">
                      <span
                        className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl font-bold"
                        style={{
                          background: subject.available ? subject.accentColor : "#94a3b8",
                          color: subject.darkCard ? (subject.slug === "statistics" ? "#122a1f" : "#fff") : "#fff",
                        }}
                      >
                        {subject.icon}
                      </span>
                      <div>
                        <h3
                          className="text-xl font-bold sm:text-2xl"
                          style={{ fontFamily: heading, color: subject.textColor }}
                        >
                          {subject.title}
                        </h3>
                        {!subject.available && (
                          <span className="inline-block rounded-full bg-zinc-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                            Coming soon
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed" style={{ fontFamily: body, color: subject.mutedColor }}>
                      {subject.description}
                    </p>

                    {subject.available && subject.modules && (
                      <div className="mt-5 flex items-center gap-6">
                        <div>
                          <span className="text-2xl font-bold" style={{ color: subject.statColor }}>{subject.modules}</span>
                          <span className="ml-1 text-xs" style={{ color: subject.mutedColor }}>modules</span>
                        </div>
                        <div className="h-6 w-px" style={{ background: subject.darkCard ? "rgba(255,255,255,0.12)" : "#e4e4e7" }} />
                        <div>
                          <span className="text-2xl font-bold" style={{ color: subject.statColor }}>{subject.problems}</span>
                          <span className="ml-1 text-xs" style={{ color: subject.mutedColor }}>problems</span>
                        </div>
                      </div>
                    )}

                    {subject.available && (
                      <div className="mt-6">
                        <span
                          className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition group-hover:brightness-110"
                          style={{
                            background: subject.accentColor,
                            color: subject.slug === "statistics" ? "#122a1f" : "#fff",
                          }}
                        >
                          Start learning
                          <span className="transition-transform group-hover:translate-x-1">→</span>
                        </span>
                      </div>
                    )}
                  </div>
                </>
              );

              return subject.available ? (
                <Link
                  key={subject.slug}
                  href={`/${subject.slug}`}
                  className={classes}
                  style={{ borderColor: subject.borderColor }}
                >
                  {inner}
                </Link>
              ) : (
                <div key={subject.slug} className={classes} style={{ borderColor: subject.borderColor }}>
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 pb-20 sm:px-12 sm:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-base text-zinc-600" style={{ fontFamily: body }}>
            Everything on CalcPath is completely free — lessons, practice problems, tests, and more. Create an account to track your progress.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/calculus"
              className="rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:shadow-xl"
            >
              Start with Calculus
            </Link>
            <Link
              href="/calculus/practice"
              className="rounded-xl border-2 border-orange-200 px-6 py-3 text-sm font-semibold text-orange-700 transition hover:border-orange-300 hover:bg-orange-50"
            >
              Start practicing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
