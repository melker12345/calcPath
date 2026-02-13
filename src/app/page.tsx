import Link from "next/link";

const topics = [
  {
    id: "limits",
    title: "Limits & Continuity",
    desc: "Direct substitution, L'Hôpital's rule, squeeze theorem, and continuity.",
    problems: 40,
    icon: "lim",
  },
  {
    id: "derivatives",
    title: "Derivatives",
    desc: "Power rule, chain rule, product & quotient rules, implicit differentiation.",
    problems: 40,
    icon: "dy/dx",
  },
  {
    id: "applications",
    title: "Applications of Derivatives",
    desc: "Optimization, related rates, curve sketching, and motion problems.",
    problems: 40,
    icon: "f′(x)",
  },
  {
    id: "integrals",
    title: "Integrals",
    desc: "Definite & indefinite integrals, u-substitution, integration by parts.",
    problems: 40,
    icon: "∫",
  },
  {
    id: "series",
    title: "Series & Sequences",
    desc: "Convergence tests, geometric series, Taylor & Maclaurin series.",
    problems: 40,
    icon: "∑",
  },
  {
    id: "differential-equations",
    title: "Differential Equations",
    desc: "Separable equations, first-order linear, exponential growth & decay.",
    problems: 40,
    icon: "dy/dt",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 md:py-28">
        <div className="flex flex-col items-center text-center">
          <h1 className="mb-5 max-w-3xl text-3xl font-extrabold leading-tight text-orange-950 sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
            Learn calculus{" "}
            <span className="relative">
              <span className="relative z-10 bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
                step&nbsp;by&nbsp;step
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" preserveAspectRatio="none">
                <path d="M0,8 Q50,0 100,8 T200,8" fill="none" stroke="url(#grad)" strokeWidth="4" strokeLinecap="round" />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#f43f5e" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          <p className="mb-8 max-w-xl text-base text-orange-800 sm:mb-10 sm:text-xl">
            Free modules with worked examples. 240+ practice problems with
            instant feedback and full solutions. From limits to differential
            equations.
          </p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <Link
              href="/try"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-6 py-3.5 text-base font-bold text-white shadow-xl shadow-orange-200 transition hover:scale-105 hover:shadow-2xl sm:px-8 sm:py-4 sm:text-lg"
            >
              Try 5 free problems
            </Link>
            <Link
              href="/modules"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-base font-bold text-orange-800 shadow-lg transition hover:shadow-xl sm:px-8 sm:py-4 sm:text-lg"
            >
              Browse free modules
            </Link>
          </div>
        </div>

        {/* Decorative math symbols */}
        <div className="absolute left-10 top-32 hidden text-6xl opacity-20 md:block">∑</div>
        <div className="absolute right-10 top-40 hidden text-5xl opacity-20 md:block">∫</div>
        <div className="absolute bottom-20 left-20 hidden text-4xl opacity-20 md:block">∂</div>
      </section>

      {/* ── How it works ── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        <h2 className="mb-8 text-center text-2xl font-extrabold text-orange-950 sm:mb-12 sm:text-4xl">
          How CalcPath works
        </h2>

        <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
          {[
            {
              step: "1",
              title: "Read the module",
              desc: "Each topic has a free lesson with intuition-first explanations and worked examples.",
              color: "from-orange-100 to-amber-100 border-orange-200",
            },
            {
              step: "2",
              title: "Practice problems",
              desc: "Solve 40 problems per topic. Get instant feedback, hints, and full step-by-step solutions.",
              color: "from-rose-100 to-pink-100 border-rose-200",
            },
            {
              step: "3",
              title: "Test yourself",
              desc: "Take a 20-question test per topic to confirm mastery. Track your progress over time.",
              color: "from-violet-100 to-purple-100 border-violet-200",
            },
          ].map((item) => (
            <div
              key={item.step}
              className={`rounded-2xl border-2 ${item.color} bg-gradient-to-br p-5 shadow-lg sm:rounded-3xl sm:p-8`}
            >
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-500 text-lg font-bold text-white shadow-sm sm:h-12 sm:w-12 sm:text-xl">
                {item.step}
              </span>
              <h3 className="mb-2 text-lg font-bold text-orange-900 sm:text-xl">{item.title}</h3>
              <p className="text-sm text-orange-700 sm:text-base">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Topics covered ── */}
      <section className="bg-white py-12 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="mb-3 text-2xl font-extrabold text-orange-950 sm:mb-4 sm:text-4xl">
              6 calculus topics, 240+ problems
            </h2>
            <p className="mx-auto max-w-2xl text-base text-orange-700 sm:text-lg">
              Every topic includes a free module with lesson content and worked
              examples. Practice problems and tests are available with Pro.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {topics.map((topic) => (
              <Link
                key={topic.id}
                href={`/modules/${topic.id}`}
                className="group rounded-2xl border-2 border-orange-100 bg-white p-5 shadow-md transition hover:border-orange-200 hover:shadow-lg sm:rounded-3xl sm:p-6"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-50 to-rose-50 text-sm font-bold text-orange-700">
                    {topic.icon}
                  </span>
                  <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">
                    {topic.problems} problems
                  </span>
                </div>
                <h3 className="mb-1 text-lg font-bold text-orange-900 group-hover:text-orange-700 sm:text-xl">
                  {topic.title}
                </h3>
                <p className="text-sm text-orange-700">{topic.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Free vs Pro ── */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
        <h2 className="mb-8 text-center text-2xl font-extrabold text-orange-950 sm:mb-12 sm:text-4xl">
          Free to start, Pro when you're ready
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Free */}
          <div className="rounded-2xl border-2 border-orange-100 bg-white p-6 shadow-lg sm:rounded-3xl sm:p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700">
              Free forever
            </div>
            <p className="mb-1 text-4xl font-extrabold text-orange-900">$0</p>
            <p className="mb-6 text-sm text-orange-600">No credit card needed</p>
            <ul className="space-y-3 text-sm text-zinc-700">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-500">✓</span>
                All 6 module lessons with full explanations
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-500">✓</span>
                Worked examples in every module
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-500">✓</span>
                5 preview practice problems per topic
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-500">✓</span>
                "Explain it simply" breakdowns
              </li>
            </ul>
            <Link
              href="/modules"
              className="mt-6 block rounded-2xl border-2 border-orange-200 bg-white px-6 py-3 text-center font-bold text-orange-700 transition hover:bg-orange-50"
            >
              Start learning free
            </Link>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-rose-50 p-6 shadow-lg sm:rounded-3xl sm:p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-1.5 text-sm font-bold text-white shadow-sm">
              Pro
            </div>
            <p className="mb-1 text-4xl font-extrabold text-orange-900">
              $8<span className="text-lg font-semibold text-orange-600">/mo</span>
            </p>
            <p className="mb-6 text-sm text-orange-600">Cancel anytime</p>
            <ul className="space-y-3 text-sm text-zinc-700">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-500">✓</span>
                Everything in Free
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-500">✓</span>
                <strong>240+ practice problems</strong> with step-by-step solutions
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-500">✓</span>
                20-question tests per topic
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-500">✓</span>
                Progress dashboard & analytics
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-500">✓</span>
                Flashcards & learning paths
              </li>
            </ul>
            <Link
              href="/pricing"
              className="mt-6 block rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-6 py-3 text-center font-bold text-white shadow-md transition hover:shadow-lg"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </section>

      {/* ── What you get (concrete features) ── */}
      <section className="bg-white py-12 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-10 text-center text-2xl font-extrabold text-orange-950 sm:mb-14 sm:text-4xl">
            Built for how you actually learn calculus
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {[
              {
                title: "Instant right/wrong feedback",
                desc: "Submit an answer and know immediately if you're correct. No waiting, no answer keys to flip to.",
                bg: "bg-amber-50",
              },
              {
                title: "Step-by-step solutions",
                desc: "Every problem has a full walkthrough. See exactly how to get from the question to the answer.",
                bg: "bg-rose-50",
              },
              {
                title: "Hints before the answer",
                desc: "Stuck? Get a hint that nudges you in the right direction before revealing the full solution.",
                bg: "bg-violet-50",
              },
              {
                title: "Math input keypad",
                desc: "Type fractions, exponents, trig functions, and more with our built-in math keyboard. No LaTeX needed.",
                bg: "bg-orange-50",
              },
              {
                title: "Progress tracking",
                desc: "See which problems you've mastered and which need more work. Pick up right where you left off.",
                bg: "bg-pink-50",
              },
              {
                title: "Flashcard review",
                desc: "Review key formulas and concepts with flashcards. Great for exam prep and quick refreshers.",
                bg: "bg-emerald-50",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`rounded-2xl ${feature.bg} p-5 sm:rounded-3xl sm:p-8`}
              >
                <h3 className="mb-2 text-lg font-bold text-orange-900 sm:text-xl">
                  {feature.title}
                </h3>
                <p className="text-sm text-orange-700 sm:text-base">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 p-8 text-center shadow-2xl sm:rounded-3xl sm:p-12 md:rounded-[2.5rem] md:p-16">
          <h2 className="mb-3 text-2xl font-extrabold text-white sm:mb-4 sm:text-4xl md:text-5xl">
            Start with 5 free problems
          </h2>
          <p className="mb-6 text-base text-orange-100 sm:mb-8 sm:text-xl">
            No sign-up required. Instant feedback. Step-by-step solutions.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/try"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-base font-bold text-orange-600 shadow-xl transition hover:scale-105 sm:px-10 sm:py-4 sm:text-lg"
            >
              Try it free
            </Link>
            <Link
              href="/auth"
              className="inline-flex items-center justify-center rounded-2xl border-2 border-white/30 px-8 py-3.5 text-base font-bold text-white transition hover:bg-white/10 sm:px-10 sm:py-4 sm:text-lg"
            >
              Sign up
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
