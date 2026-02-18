import Link from "next/link";

const curriculum = [
  {
    id: "limits",
    number: "I",
    title: "Limits & Continuity",
    desc: "What does it mean for a function to approach a value? Build intuition for limits through direct substitution, factoring, the squeeze theorem, and L'Hôpital's rule. Understand continuity and what happens when it breaks.",
  },
  {
    id: "derivatives",
    number: "II",
    title: "Derivatives",
    desc: "The derivative measures instantaneous rate of change. Learn the power rule, product and quotient rules, chain rule, and implicit differentiation. Understand what a derivative means geometrically and physically.",
  },
  {
    id: "applications",
    number: "III",
    title: "Applications of Derivatives",
    desc: "Put derivatives to work. Solve optimization problems, related rates, and curve sketching. Analyze motion and understand how derivatives describe the world around us.",
  },
  {
    id: "integrals",
    number: "IV",
    title: "Integrals",
    desc: "Integration is the reverse of differentiation — and much more. Compute definite and indefinite integrals using substitution, integration by parts, and the Fundamental Theorem of Calculus.",
  },
  {
    id: "series",
    number: "V",
    title: "Series & Sequences",
    desc: "When does an infinite sum have a finite value? Study convergence tests, geometric and telescoping series, power series, and the Taylor and Maclaurin expansions that underpin modern mathematics.",
  },
  {
    id: "differential-equations",
    number: "VI",
    title: "Differential Equations",
    desc: "Equations involving derivatives model growth, decay, and change. Learn to solve separable and first-order linear equations, and see how differential equations describe real phenomena.",
  },
];

const homeFaqs = [
  { q: "What background do I need?", a: "Algebra and basic trigonometry. If you're comfortable with functions, factoring, and solving equations, you're ready to start." },
  { q: "Is this free?", a: "All modules — lessons, explanations, and worked examples — are free with no account required. Practice problems and tests require a Pro subscription." },
  { q: "How is this different from a textbook?", a: "You get the same rigor, but with instant feedback. Every practice problem checks your answer immediately and walks through the solution step by step." },
  { q: "What topics are covered?", a: "Limits, derivatives, applications of derivatives, integrals, series & sequences, and differential equations. This covers a standard Calculus I–II curriculum." },
  { q: "Can I try the practice problems first?", a: "Yes. You can solve 5 interactive problems right now — no account needed. Visit the practice sampler to try it." },
  { q: "Who made this?", a: "CalcPath is an independent project built to make calculus more accessible. Every explanation is written to build understanding, not just get you through an exam." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homeFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export default function Home() {
  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
    />
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <section className="relative mx-auto max-w-4xl px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28 md:pt-36">
        <div className="text-center">
          <p className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-orange-600/80 sm:mb-6 sm:text-base">
            A structured approach to calculus
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-zinc-900 sm:text-5xl md:text-6xl lg:text-7xl">
            Understand calculus,{" "}
            <span className="bg-gradient-to-r from-orange-600 to-rose-500 bg-clip-text text-transparent">
              don't just memorize it
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 sm:mt-8 sm:text-xl">
            Six topic modules with clear explanations, worked examples, and
            240+ practice problems — each with step-by-step solutions.
            Built for students who want to actually learn the material.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/modules"
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-zinc-800 sm:px-8 sm:py-4 sm:text-lg"
            >
              Start reading
            </Link>
            <Link
              href="/try"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-7 py-3.5 text-base font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 sm:px-8 sm:py-4 sm:text-lg"
            >
              Try a practice problem
            </Link>
          </div>
        </div>
      </section>

      {/* ── Sample problem ── */}
      <section className="border-y border-zinc-100 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-[0.2em] text-zinc-400">
            What learning looks like
          </p>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 shadow-sm">
            {/* Problem */}
            <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-5 sm:px-8 sm:py-6">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Limits — Problem 4
              </p>
              <p className="text-lg font-semibold text-zinc-900 sm:text-xl">
                Compute: lim(x→4) of (x² − 16) / (x − 4)
              </p>
            </div>

            {/* Solution */}
            <div className="px-6 py-5 sm:px-8 sm:py-6">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Step-by-step solution
              </p>
              <ol className="space-y-3 text-base text-zinc-700">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                    1
                  </span>
                  <span>Direct substitution gives 0/0 — an indeterminate form. We need to simplify.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                    2
                  </span>
                  <span>Factor the numerator: x² − 16 = (x − 4)(x + 4)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                    3
                  </span>
                  <span>Cancel the common factor (x − 4), leaving lim(x→4) of (x + 4)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                    4
                  </span>
                  <span>Substitute x = 4: 4 + 4 = <strong className="text-zinc-900">8</strong></span>
                </li>
              </ol>
              <div className="mt-5 rounded-lg bg-emerald-50 px-4 py-3">
                <p className="text-sm font-semibold text-emerald-800">
                  Answer: <span className="text-base">8</span>
                </p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Every problem includes a full walkthrough like this.{" "}
            <Link href="/modules/limits" className="font-medium text-orange-600 hover:text-orange-700">
              Read the Limits module →
            </Link>
          </p>
        </div>
      </section>

      {/* ── Curriculum ── */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
            Curriculum
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-zinc-500 sm:text-lg">
            Six modules covering a standard Calculus I–II sequence.
            Each includes a lesson, worked examples, and practice problems.
          </p>
        </div>

        <div className="space-y-0">
          {curriculum.map((topic, i) => (
            <Link
              key={topic.id}
              href={`/modules/${topic.id}`}
              className={`group flex gap-5 py-7 transition hover:bg-orange-50/40 sm:gap-8 sm:py-8 ${
                i < curriculum.length - 1 ? "border-b border-zinc-100" : ""
              }`}
            >
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-100 font-serif text-lg font-bold text-zinc-400 transition group-hover:bg-orange-100 group-hover:text-orange-600 sm:h-14 sm:w-14 sm:text-xl">
                {topic.number}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-zinc-900 group-hover:text-orange-800 sm:text-xl">
                  {topic.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-500 sm:text-base">
                  {topic.desc}
                </p>
              </div>
              <span className="hidden flex-shrink-0 self-center text-zinc-300 transition group-hover:translate-x-1 group-hover:text-orange-400 sm:block">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Approach ── */}
      <section className="border-y border-zinc-100 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              How we teach
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-zinc-500 sm:text-lg">
              Not shortcuts. Not tricks. Understanding.
            </p>
          </div>

          <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {[
              {
                title: "Intuition before formulas",
                desc: "Each module starts by building understanding of why a concept works before showing the formal machinery. You learn the idea, then the technique.",
              },
              {
                title: "Worked examples throughout",
                desc: "Every section includes detailed examples solved step by step. You see the thinking process, not just the answer.",
              },
              {
                title: "Immediate feedback",
                desc: "Practice problems tell you if you're right or wrong instantly. When you're wrong, you get hints first — then the full solution when you need it.",
              },
              {
                title: "Difficulty that progresses",
                desc: "Problems go from straightforward to challenging within each topic. Easy problems build confidence; hard problems build depth.",
              },
            ].map((item, i) => (
              <div key={i}>
                <h3 className="mb-2 text-base font-bold text-zinc-900 sm:text-lg">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500 sm:text-base">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight text-zinc-900 sm:mb-12 sm:text-4xl">
          Questions
        </h2>
        <div className="divide-y divide-zinc-100">
          {homeFaqs.map((faq, i) => (
            <details key={i} className="group py-5">
              <summary className="flex cursor-pointer select-none items-center justify-between text-base font-semibold text-zinc-900 [&::-webkit-details-marker]:hidden sm:text-lg">
                {faq.q}
                <svg className="ml-4 h-4 w-4 flex-shrink-0 text-zinc-400 transition-transform group-open:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </summary>
              <p className="mt-3 text-base leading-relaxed text-zinc-500">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Closing ── */}
      <section className="border-t border-zinc-100 bg-zinc-50 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
            Start with the first module
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-zinc-500 sm:text-lg">
            Begin with Limits & Continuity. Read at your own pace, then
            practice when you're ready.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/modules/limits"
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-zinc-800 sm:px-8 sm:py-4 sm:text-lg"
            >
              Read Limits & Continuity
            </Link>
            <Link
              href="/try"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-7 py-3.5 text-base font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 sm:px-8 sm:py-4 sm:text-lg"
            >
              Try a practice problem
            </Link>
          </div>
        </div>
      </section>

    </div>
    </>
  );
}
