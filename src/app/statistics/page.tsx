import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Learn Statistics — Free University Course | CalcPath",
  description:
    "Learn statistics step by step. Free university-level course covering descriptive statistics, probability, distributions, hypothesis testing, ANOVA, regression, and non-parametric tests. Practice problems with full worked solutions.",
  alternates: { canonical: "https://calc-path.com/statistics" },
};

const courseJsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Statistics",
  description:
    "Free university statistics course covering descriptive statistics, probability, distributions, hypothesis testing, ANOVA, regression, and non-parametric tests. Includes practice problems with step-by-step solutions.",
  provider: {
    "@type": "Organization",
    name: "CalcPath",
    url: "https://calc-path.com",
  },
  url: "https://calc-path.com/statistics",
  educationalLevel: "University",
  inLanguage: "en",
  isAccessibleForFree: true,
  hasCourseInstance: [
    { "@type": "CourseInstance", name: "Descriptive Statistics", url: "https://calc-path.com/statistics/modules/descriptive" },
    { "@type": "CourseInstance", name: "Hypothesis Testing", url: "https://calc-path.com/statistics/modules/hypothesis-testing" },
    { "@type": "CourseInstance", name: "Linear Regression", url: "https://calc-path.com/statistics/modules/regression" },
  ],
};

const serif = "var(--font-newsreader), Georgia, serif";
const body = "var(--font-lora), Georgia, serif";

const C = {
  chalk: "#e8e4d9",
  muted: "rgba(232,228,217,0.55)",
  amber: "#fde68a",
  amberBg: "rgba(253,230,138,0.1)",
  green: "#1a3a2a",
  greenLight: "#1f4433",
};

const curriculum = [
  { id: "descriptive", number: "01", title: "Descriptive Statistics", desc: "Measures of center, spread, shape, and data visualization." },
  { id: "probability", number: "02", title: "Foundations of Probability", desc: "Sample spaces, probability rules, conditional probability, and Bayes' theorem." },
  { id: "discrete-distributions", number: "03", title: "Discrete Probability Distributions", desc: "Random variables, expected value, binomial, Poisson, and geometric distributions." },
  { id: "continuous-distributions", number: "04", title: "Continuous Probability Distributions", desc: "PDFs, CDFs, normal, exponential, and uniform distributions." },
  { id: "sampling", number: "05", title: "Sampling and Data Distributions", desc: "Law of large numbers, central limit theorem, and sampling distributions." },
  { id: "estimation", number: "06", title: "Statistical Inference: Estimation", desc: "Point estimation, MLE, and confidence intervals." },
  { id: "hypothesis-testing", number: "07", title: "Statistical Inference: Hypothesis Testing", desc: "Null and alternative hypotheses, p-values, errors, and t-tests." },
  { id: "anova", number: "08", title: "Analysis of Variance", desc: "One-way ANOVA, the F-test, and multiple comparisons." },
  { id: "regression", number: "09", title: "Linear Regression and Correlation", desc: "Pearson correlation, OLS regression, residuals, and R-squared." },
  { id: "nonparametric", number: "10", title: "Non-Parametric Statistics", desc: "Chi-square tests, Mann-Whitney U, and Wilcoxon signed-rank tests." },
];

export default function StatisticsHome() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      {/* Hero */}
      <section className="relative px-6 pb-20 pt-16 sm:px-12 sm:pb-28 sm:pt-24">
        <div className="mx-auto max-w-4xl">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="h-3 w-3 rounded-full" style={{ background: C.amber }} />
              <span className="text-base font-bold uppercase tracking-[0.3em]" style={{ color: C.amber }}>Statistics</span>
            </div>

            <h1
              className="text-[2.5rem] font-bold leading-[1.08] tracking-tight sm:text-[3.5rem] md:text-[4.25rem]"
              style={{ fontFamily: serif, color: C.chalk }}
            >
              Make sense of{" "}
              <span style={{ color: C.amber }}>data</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed sm:text-lg" style={{ fontFamily: body, color: C.muted }}>
              10 topic modules. Practice problems with step-by-step solutions.
              Free to read. No account required.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <Link
                href="/statistics/modules"
                className="w-full rounded-lg px-7 py-3.5 text-center text-base font-semibold transition hover:brightness-110 sm:w-auto"
                style={{ fontFamily: body, background: C.amber, color: C.green }}
              >
                Start reading
              </Link>
              <Link
                href="/statistics/practice"
                className="w-full rounded-lg px-7 py-3.5 text-center text-base font-semibold transition hover:brightness-110 sm:w-auto"
                style={{ fontFamily: body, border: `2px solid ${C.amber}`, color: C.amber }}
              >
                Start practicing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="px-6 py-16 sm:px-12 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: serif, color: C.chalk }}>Curriculum</h2>
              <p className="mt-1.5 text-sm sm:text-base" style={{ fontFamily: body, color: C.muted }}>
                10 chapters · descriptive stats through non-parametric tests
              </p>
            </div>
            <Link
              href="/statistics/modules"
              className="mt-4 text-sm font-semibold transition hover:opacity-80 sm:mt-0"
              style={{ color: C.amber }}
            >
              View all modules →
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {curriculum.map((topic) => (
              <Link
                key={topic.id}
                href={`/statistics/modules/${topic.id}`}
                className="group flex flex-col rounded-xl p-4 transition-all hover:brightness-110 sm:rounded-2xl sm:p-5"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1.5px solid rgba(253,230,138,0.14)",
                  borderLeft: `3px solid ${C.amber}`,
                }}
              >
                <span
                  className="mb-2 text-xs font-bold uppercase tracking-widest"
                  style={{ color: C.amber }}
                >
                  {topic.number}
                </span>
                <h3
                  className="text-sm font-semibold leading-snug sm:text-[0.95rem]"
                  style={{ fontFamily: serif, color: C.chalk }}
                >
                  {topic.title}
                </h3>
                <p
                  className="mt-1.5 line-clamp-2 text-xs leading-relaxed"
                  style={{ fontFamily: body, color: C.muted }}
                >
                  {topic.desc}
                </p>
                <span
                  className="mt-auto pt-3 text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ color: C.amber }}
                >
                  Read →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-28 pt-8 sm:px-12 sm:pb-36">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: serif, color: C.chalk }}>
            Start with <span style={{ color: C.amber }}>Descriptive Statistics</span>
          </h2>
          <p className="mt-3 text-base" style={{ fontFamily: body, color: C.muted }}>
            The foundation of all statistics. Read at your own pace.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/statistics/modules/descriptive"
              className="w-full max-w-xs rounded-lg px-7 py-3.5 text-center text-base font-semibold transition hover:brightness-110 sm:w-auto"
              style={{ fontFamily: body, background: C.amber, color: C.green }}
            >
              Read Chapter I
            </Link>
            <Link
              href="/statistics/practice"
              className="w-full max-w-xs rounded-lg px-7 py-3.5 text-center text-base font-semibold transition hover:brightness-110 sm:w-auto"
              style={{ fontFamily: body, border: `2px solid ${C.amber}`, color: C.amber }}
            >
              Practice problems
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
