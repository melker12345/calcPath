import Link from "next/link";

const heading = "var(--font-inter), system-ui, -apple-system, sans-serif";
const body = "var(--font-inter), system-ui, -apple-system, sans-serif";

const subjects = [
  {
    slug: "calculus",
    title: "Calculus",
    icon: "∫",
    description:
      "Limits, derivatives, integrals, series, differential equations, and more. 8 modules with 360+ practice problems — each solved step by step.",
    modules: 8,
    problems: "360+",
    available: true,
    accentColor: "#dc2626",
    bgColor: "#f8fafc",
    bgPattern: `linear-gradient(#93c5fd33 1px, transparent 1px), linear-gradient(90deg, #93c5fd33 1px, transparent 1px)`,
    bgSize: "20px 20px",
  },
  {
    slug: "statistics",
    title: "Statistics",
    icon: "σ",
    description:
      "Descriptive statistics, probability, distributions, hypothesis testing, regression, and more. Coming soon.",
    modules: null,
    problems: null,
    available: false,
    accentColor: "#fde68a",
    bgColor: "#1a3a2a",
    bgPattern: "none",
    bgSize: "auto",
  },
  {
    slug: "linear-algebra",
    title: "Linear Algebra",
    icon: "->",
    description:
      "Linear algebra is a fundamental branch of mathematics focusing on the study of vectors, vector spaces, and linear transformations, typically represented by matrices",
    modules: 4,
    problems: 120,
    available: false,
    accentColor: "#3372A2", // #3372A2
    bgColor: "#1a3a2a", // #B4D9FF
    bgPattern: "none",
    bgSize: "auto",
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
    accentColor: "#AC21FC", // #3372A2
    bgColor: "#1a3a2a", // #B4D9FF
    bgPattern: "none",
    bgSize: "auto",
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
              const borderStyle = { borderColor: subject.available ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.04)" };

              const inner = (
                <>
                  {/* Themed mini-preview background */}
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundColor: subject.bgColor,
                      backgroundImage: subject.bgPattern,
                      backgroundSize: subject.bgSize,
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
                          color: subject.slug === "statistics" ? "#122a1f" : "#fff",
                        }}
                      >
                        {subject.icon}
                      </span>
                      <div>
                        <h3 className="text-xl font-bold text-zinc-900 sm:text-2xl" style={{ fontFamily: heading }}>
                          {subject.title}
                        </h3>
                        {!subject.available && (
                          <span className="inline-block rounded-full bg-zinc-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                            Coming soon
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed text-zinc-600" style={{ fontFamily: body }}>
                      {subject.description}
                    </p>

                    {subject.available && subject.modules && (
                      <div className="mt-5 flex items-center gap-6">
                        <div>
                          <span className="text-2xl font-bold text-zinc-900">{subject.modules}</span>
                          <span className="ml-1 text-xs text-zinc-500">modules</span>
                        </div>
                        <div className="h-6 w-px bg-zinc-200" />
                        <div>
                          <span className="text-2xl font-bold text-zinc-900">{subject.problems}</span>
                          <span className="ml-1 text-xs text-zinc-500">problems</span>
                        </div>
                      </div>
                    )}

                    {subject.available && (
                      <div className="mt-6">
                        <span
                          className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition group-hover:brightness-110"
                          style={{ background: subject.accentColor }}
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
                <Link key={subject.slug} href={`/${subject.slug}`} className={classes} style={borderStyle}>
                  {inner}
                </Link>
              ) : (
                <div key={subject.slug} className={classes} style={borderStyle}>
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
