"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { MathText } from "@/components/math-text";
import { VoteFeedback } from "@/components/vote-feedback";
import { modules } from "@/lib/modules";
import { problems, topics } from "@/lib/calculus-content";

/* ── FAQ data per topic (SEO-targeted questions people actually Google) ── */
const topicFaqs: Record<string, { q: string; a: string }[]> = {
  limits: [
    { q: "What is a limit in calculus?", a: "A limit describes the value a function approaches as its input gets closer to a specific point. Limits are the foundation of both derivatives and integrals." },
    { q: "How do you evaluate a limit?", a: "Start with direct substitution. If that gives an indeterminate form like 0/0, try factoring, rationalizing, or applying L'Hôpital's rule." },
    { q: "What is L'Hôpital's rule?", a: "L'Hôpital's rule states that if a limit gives 0/0 or ∞/∞, you can differentiate the numerator and denominator separately and re-evaluate the limit." },
  ],
  derivatives: [
    { q: "What is a derivative in calculus?", a: "A derivative measures how fast a function is changing at any given point. Geometrically, it equals the slope of the tangent line to the curve at that point." },
    { q: "What is the chain rule?", a: "The chain rule differentiates composite functions. If y = f(g(x)), then dy/dx = f'(g(x)) · g'(x). It's essential for nested functions." },
    { q: "What is the power rule?", a: "The power rule states that the derivative of x^n is n·x^(n-1). It's the most commonly used differentiation rule in calculus." },
  ],
  applications: [
    { q: "What is optimization in calculus?", a: "Optimization uses derivatives to find the maximum or minimum value of a function. Common applications include maximizing area, minimizing cost, and finding shortest paths." },
    { q: "What are related rates problems?", a: "Related rates problems involve finding how fast one quantity is changing given the rate of change of another related quantity, using implicit differentiation with respect to time." },
    { q: "How do you find critical points?", a: "Set the first derivative equal to zero and solve. Critical points are where the function may have a local maximum, minimum, or inflection point." },
  ],
  integrals: [
    { q: "What is an integral in calculus?", a: "An integral computes the accumulated area under a curve. Definite integrals give a numerical value, while indefinite integrals give a family of antiderivative functions." },
    { q: "What is u-substitution?", a: "U-substitution is an integration technique where you replace part of the integrand with a new variable u to simplify the expression into a standard form you can integrate." },
    { q: "What is the difference between definite and indefinite integrals?", a: "A definite integral has upper and lower bounds and evaluates to a number (the net area). An indefinite integral has no bounds and gives a general antiderivative plus a constant C." },
  ],
  series: [
    { q: "What is a series in calculus?", a: "A series is the sum of the terms of a sequence. An infinite series adds up infinitely many terms and may converge to a finite value or diverge to infinity." },
    { q: "How do you test if a series converges?", a: "Common convergence tests include the ratio test, comparison test, integral test, alternating series test, and the nth-term divergence test." },
    { q: "What is a Taylor series?", a: "A Taylor series represents a function as an infinite sum of terms calculated from the function's derivatives at a single point. A Maclaurin series is a Taylor series centered at x = 0." },
  ],
  "differential-equations": [
    { q: "What is a differential equation?", a: "A differential equation is an equation that relates a function to one or more of its derivatives. Solving it means finding the function that satisfies the equation." },
    { q: "What is a separable differential equation?", a: "A separable differential equation can be rewritten so all terms involving y are on one side and all terms involving x are on the other. Both sides are then integrated independently." },
    { q: "What is exponential growth and decay?", a: "Exponential growth and decay are modeled by dy/dt = ky. The solution is y = y₀·e^(kt), where k > 0 means growth and k < 0 means decay." },
  ],
};

/* ── slug helper ── */
function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* ── Scrollspy sidebar ── */
function SectionNav({
  items,
  activeId,
}: {
  items: { id: string; label: string }[];
  activeId: string;
}) {
  return (
    <nav className="sticky top-24 self-start hidden xl:block" aria-label="Table of contents">
      <div className="relative flex flex-col items-center">
        {/* Vertical line */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-0.5 bg-orange-200/60"
          style={{
            top: 0,
            height: `${(items.length - 1) * 40}px`,
          }}
        />
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="group relative flex items-center"
              style={{ height: 40 }}
              title={item.label}
            >
              {/* Node */}
              <div
                className={`relative z-10 h-3 w-3 rounded-full border-2 transition-all duration-200 ${
                  isActive
                    ? "border-orange-500 bg-orange-500 scale-125 shadow-md shadow-orange-200"
                    : "border-orange-300 bg-white group-hover:border-orange-400 group-hover:bg-orange-100"
                }`}
              />
              {/* Tooltip — to the right of the node */}
              <div
                className={`pointer-events-none absolute left-full ml-4 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg transition-all duration-200 ${
                  isActive
                    ? "bg-orange-500 text-white opacity-100 translate-x-0"
                    : "bg-zinc-800 text-white opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                }`}
              >
                {item.label}
                {/* Arrow pointing left */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 right-full h-0 w-0 border-y-4 border-y-transparent border-r-4 ${
                    isActive ? "border-r-orange-500" : "border-r-zinc-800"
                  }`}
                />
              </div>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

export default function ModulePage() {
  const params = useParams<{ topicId: string }>();
  const topicId = params?.topicId ?? "";
  const module = modules.find((item) => item.topicId === topicId);
  const topic = topics.find((item) => item.id === topicId);

  /* Build nav items from module content */
  const navItems = useMemo(() => {
    if (!module) return [];
    const items: { id: string; label: string }[] = [
      { id: "intro", label: "Introduction" },
    ];
    module.sections.forEach((s) => {
      items.push({ id: toSlug(s.title), label: s.title });
    });
    items.push({ id: "mistakes", label: "Common Mistakes" });
    items.push({ id: "practice-preview", label: "Practice Problems" });
    return items;
  }, [module]);

  /* Print */
  const [printMode, setPrintMode] = useState<"text" | "questions" | null>(null);
  const [printQuestionCount, setPrintQuestionCount] = useState(0);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printStep, setPrintStep] = useState<"choose" | "count">("choose");

  useEffect(() => {
    if (!printMode) return;
    const frame = requestAnimationFrame(() => {
      window.print();
      setPrintMode(null);
      setPrintQuestionCount(0);
    });
    return () => cancelAnimationFrame(frame);
  }, [printMode]);

  /* Track which section is in view */
  const [activeId, setActiveId] = useState("intro");
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();

    const headings = navItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    if (headings.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );

    headings.forEach((el) => observerRef.current!.observe(el));
  }, [navItems]);

  useEffect(() => {
    // Small delay to let DOM render
    const timeout = setTimeout(setupObserver, 200);
    return () => {
      clearTimeout(timeout);
      observerRef.current?.disconnect();
    };
  }, [setupObserver]);

  if (!module || !topic) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-sm text-zinc-600">Module not found.</p>
        <Link className="btn-secondary mt-4 inline-flex" href="/calculus/modules">
          Back to modules
        </Link>
      </div>
    );
  }

  const moduleProblems = problems.filter(
    (problem) => problem.topicId === topic.id,
  );

  /* Prev / Next topic for internal linking */
  const topicIndex = topics.findIndex((t) => t.id === topicId);
  const prevTopic = topicIndex > 0 ? topics[topicIndex - 1] : null;
  const nextTopic = topicIndex < topics.length - 1 ? topics[topicIndex + 1] : null;

  /* FAQ data for this topic */
  const faqs = topicFaqs[topicId] ?? [];

  /* FAQ JSON-LD for structured data */
  const faqJsonLd = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  } : null;

  return (
    <>
    {faqJsonLd && (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    )}
    <div className="mx-auto flex w-full max-w-7xl justify-center gap-4 px-4 py-8 sm:gap-6 sm:px-6 sm:py-12">
      {/* Main content */}
      <div className="w-full max-w-4xl">
      <div className="mb-6 space-y-3 sm:mb-8">
        <Link className="text-sm font-medium text-orange-600 hover:text-orange-800 sm:text-base" href="/calculus/modules" data-no-print>
          ← Back to modules
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-zinc-900 sm:text-3xl md:text-4xl">
            {module.title}
          </h1>
          <div className="relative" data-no-print>
            <button
              type="button"
              onClick={() => { setShowPrintModal((v) => !v); setPrintStep("choose"); }}
              className="rounded-xl p-2 text-zinc-400 transition hover:bg-orange-50 hover:text-orange-600"
              title="Print module"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.552c.377.046.752.097 1.126.153A2.212 2.212 0 0 1 18 8.653v4.097A2.25 2.25 0 0 1 15.75 15h-.75v.75c0 .966-.784 1.75-1.75 1.75h-6.5A1.75 1.75 0 0 1 5 15.75V15h-.75A2.25 2.25 0 0 1 2 12.75V8.653c0-1.082.775-2.034 1.874-2.198.374-.056.75-.107 1.126-.153V2.75ZM13.5 4V2.75a.25.25 0 0 0-.25-.25h-6.5a.25.25 0 0 0-.25.25V4h7ZM6.5 15.75v-3.5h7v3.5a.25.25 0 0 1-.25.25h-6.5a.25.25 0 0 1-.25-.25Zm-1-6a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
              </svg>
            </button>

            {showPrintModal && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => { setShowPrintModal(false); setPrintStep("choose"); }} />
                <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border-2 border-orange-100 bg-white p-3 shadow-xl">
                  {printStep === "choose" ? (
                    <>
                      <p className="mb-2 text-xs font-semibold text-zinc-500">Print this module</p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPrintModal(false);
                          setPrintStep("choose");
                          setPrintMode("text");
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-zinc-700 transition hover:bg-orange-50"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-xs">📄</span>
                        Text only
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrintStep("count")}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-zinc-700 transition hover:bg-orange-50"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-xs">📝</span>
                        Text + Questions
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setPrintStep("choose")}
                        className="mb-2 text-xs font-medium text-orange-600 hover:text-orange-800"
                      >
                        ← Back
                      </button>
                      <p className="mb-2 text-xs font-semibold text-zinc-500">
                        How many questions? ({moduleProblems.length} available)
                      </p>
                      {[1, 3, 5, moduleProblems.length].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => {
                            setShowPrintModal(false);
                            setPrintStep("choose");
                            setPrintQuestionCount(n);
                            setPrintMode("questions");
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-700 transition hover:bg-orange-50"
                        >
                          {n === moduleProblems.length ? `All (${n})` : n}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <p className="text-lg text-zinc-600">{topic.description}</p>
      </div>

      {/* Main Textbook Content Card */}
      <article className="rounded-2xl border-2 border-orange-100 bg-white p-5 shadow-xl sm:rounded-3xl sm:p-10">
        {/* Introduction */}
        <div id="intro" className="mb-8 space-y-4 sm:mb-12">
          {module.intro.map((paragraph, idx) => (
            <p
              key={paragraph}
              className={`text-base leading-relaxed text-zinc-700 sm:text-lg ${
                idx === 0 ? "text-lg font-medium sm:text-xl" : ""
              }`}
            >
              <MathText text={paragraph} />
            </p>
          ))}
        </div>

        {/* Core Content Sections */}
        <div className="space-y-10">
          {module.sections.map((section, idx) => (
            <div key={section.title}>
              {idx > 0 && <hr className="mb-10 border-t-2 border-orange-100" />}
              <div>
                <h2 id={toSlug(section.title)} className="mb-4 scroll-mt-24 text-xl font-bold text-zinc-900 sm:text-2xl">
                  {section.title}
                </h2>
                {section.body.every((text) => text.trim().startsWith("-")) ? (
                  <ul className="ml-6 space-y-3 text-lg leading-relaxed text-zinc-700">
                    {section.body.map((text) => (
                      <li key={text} className="list-disc">
                        <MathText text={text.replace(/^-\s*/, "")} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="space-y-4">
                    {section.body.map((text) => (
                      <p
                        key={text}
                        className="text-lg leading-relaxed text-zinc-700"
                      >
                        <MathText text={text} />
                      </p>
                    ))}
                  </div>
                )}

                {/* ELI5 expandable */}
                {section.eli5 && section.eli5.length > 0 && (
                  <details className="print-keep-together group mt-6 rounded-2xl border-2 border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50">
                    <summary className="flex cursor-pointer select-none items-center gap-3 px-5 py-3.5 text-sm font-semibold text-sky-700 transition-colors hover:text-sky-900 [&::-webkit-details-marker]:hidden">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-base transition-transform group-open:rotate-12">
                        💡
                      </span>
                      <span>Explain it simply</span>
                      <svg className="ml-auto h-4 w-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </summary>
                    <div className="space-y-3 px-5 pb-5 pt-1">
                      {section.eli5.map((text) => (
                        <p
                          key={text}
                          className="text-base leading-relaxed text-sky-900"
                        >
                          <MathText text={text} />
                        </p>
                      ))}
                    </div>
                  </details>
                )}

                {/* Inline worked examples */}
                {section.examples && section.examples.length > 0 && (
                  <div className="mt-6 space-y-4">
                    {section.examples.map((example, exIdx) => (
                      <div key={example.title} className="print-keep-together rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
                        <div className="mb-3 flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-200 text-sm font-bold text-amber-800">
                            {exIdx + 1}
                          </span>
                          <h4 className="text-lg font-semibold text-amber-900">
                            <MathText text={example.title} />
                          </h4>
                        </div>
                        <ol className="space-y-2.5 pl-4 text-base leading-relaxed text-zinc-700">
                          {example.steps.map((step) => (
                            <li key={step} className="list-decimal marker:text-amber-400 marker:font-semibold">
                              <MathText text={step} />
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex justify-end" data-no-print>
                  <VoteFeedback targetType="section" targetId={`${topicId}:${toSlug(section.title)}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Common Mistakes */}
        <hr className="my-12 border-t-2 border-orange-100" />
        <div className="print-keep-together">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-lg">
              ⚠️
            </div>
            <h2 id="mistakes" className="scroll-mt-24 text-2xl font-bold text-red-800">
              Common Mistakes to Avoid
            </h2>
          </div>
          <ul className="ml-6 space-y-3 text-lg leading-relaxed text-zinc-700">
            {module.commonMistakes.map((mistake) => (
              <li key={mistake} className="list-disc">
                <MathText text={mistake} />
              </li>
            ))}
          </ul>
        </div>
      </article>

      {/* Free preview questions with detailed solutions */}
      <section className="mt-6 rounded-2xl border-2 border-orange-100 bg-white p-5 shadow-lg sm:mt-8 sm:rounded-3xl sm:p-8" data-no-print>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="practice-preview" className="scroll-mt-24 text-xl font-bold text-zinc-900 sm:text-2xl">
              Worked Practice Problems (5 examples)
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Study these solved examples to understand the techniques. Then head to Practice to try problems on your own.
            </p>
          </div>
          <Link className="btn-primary" href={`/calculus/practice/${topic.id}`}>
            Practice on your own →
          </Link>
        </div>

        <div className="space-y-6">
          {moduleProblems.slice(0, 5).map((problem, index) => (
            <div
              key={problem.id}
              className="rounded-2xl border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-6"
            >
              {/* Question header */}
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-400 text-lg font-bold text-white shadow">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                    Problem {index + 1}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-zinc-900 sm:text-xl">
                    <MathText text={problem.prompt} />
                  </p>
                </div>
              </div>

              {/* Step-by-step solution */}
              <div className="border-l-4 border-emerald-200 bg-white/70 rounded-r-xl pl-4 pr-4 pt-4 pb-4 sm:ml-14 sm:p-5">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-sm">
                    ✓
                  </div>
                  <h4 className="font-bold text-emerald-800">
                    Step-by-Step Solution
                  </h4>
                </div>
                <div className="space-y-3">
                  {(() => {
                    // Parse steps from the explanation
                    const parts = problem.explanation.split(/Step \d+:\s*/);
                    const steps = parts.filter(Boolean).map((step) => {
                      // Remove "Final answer:" suffix from the last step
                      return step.replace(/\s*Final answer:.*$/, "").trim();
                    });
                    return steps.map((step, stepIdx) => (
                      <div key={stepIdx} className="flex gap-3">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                          {stepIdx + 1}
                        </span>
                        <p className="flex-1 text-base leading-relaxed text-zinc-700">
                          <MathText text={step} />
                        </p>
                      </div>
                    ));
                  })()}
                </div>

                {/* Final answer highlight */}
                <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                  <p className="text-base font-semibold text-emerald-800">
                    Final Answer:{" "}
                    <span className="text-lg">
                      <MathText
                        text={
                          problem.explanation.match(/Final answer:\s*(.+?)\.?$/)?.[1] ||
                          `$${problem.answer}$`
                        }
                      />
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Print-only worksheet (hidden on screen) */}
      {printMode === "questions" && printQuestionCount > 0 && (
        <section className="hidden print-only mt-8">
          <h2 className="mb-6 text-xl font-bold">Practice Questions — {topic.title}</h2>
          <ol className="list-decimal space-y-8 pl-6">
            {moduleProblems.slice(0, printQuestionCount).map((problem) => (
              <li key={problem.id} className="print-keep-together">
                <div className="mb-2">
                  <MathText text={problem.prompt} />
                </div>
                {problem.type === "mcq" && problem.choices && (
                  <div className="mt-2 space-y-1 pl-4">
                    {problem.choices.map((choice, ci) => (
                      <div key={ci} className="flex items-baseline gap-2">
                        <span className="font-medium">{String.fromCharCode(65 + ci)}.</span>
                        <MathText text={choice} />
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <section className="mt-6 rounded-2xl border-2 border-orange-100 bg-white p-5 shadow-lg sm:mt-8 sm:rounded-3xl sm:p-8" data-no-print>
          <h2 className="mb-6 text-xl font-bold text-zinc-900 sm:text-2xl">
            Frequently asked questions about {topic.title.toLowerCase()}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group rounded-xl border-2 border-orange-100 bg-orange-50/50">
                <summary className="flex cursor-pointer select-none items-center justify-between px-5 py-4 text-base font-semibold text-zinc-900 [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <svg className="ml-3 h-4 w-4 flex-shrink-0 text-orange-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-base leading-relaxed text-zinc-700">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Practice CTA Section */}
      

      {/* Prev / Next topic navigation */}
      <nav className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2" aria-label="Previous and next topics" data-no-print>
        {prevTopic ? (
          <Link
            href={`/calculus/modules/${prevTopic.id}`}
            className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border-2 border-orange-100/80 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-orange-200 hover:shadow-[0_8px_24px_-4px_rgba(249,115,22,0.12)] sm:rounded-3xl sm:p-6"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100/80 text-2xl font-bold text-orange-500 transition-colors group-hover:bg-orange-200/80 group-hover:text-orange-600">
              ‹
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-500">Previous</p>
              <p className="mt-0.5 truncate text-base font-bold text-zinc-900 group-hover:text-orange-700 sm:text-lg">{prevTopic.title}</p>
              <p className="mt-0.5 line-clamp-2 text-sm text-zinc-500">{prevTopic.description}</p>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {nextTopic ? (
          <Link
            href={`/calculus/modules/${nextTopic.id}`}
            className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border-2 border-orange-100/80 bg-white p-5 text-right shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-orange-200 hover:shadow-[0_8px_24px_-4px_rgba(249,115,22,0.12)] sm:rounded-3xl sm:p-6"
          >
            <div className="order-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100/80 text-2xl font-bold text-orange-500 transition-colors group-hover:bg-orange-200/80 group-hover:text-orange-600">
              ›
            </div>
            <div className="order-1 min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-500">Next</p>
              <p className="mt-0.5 truncate text-base font-bold text-zinc-900 group-hover:text-orange-700 sm:text-lg">{nextTopic.title}</p>
              <p className="mt-0.5 line-clamp-2 text-sm text-zinc-500">{nextTopic.description}</p>
            </div>
          </Link>
        ) : (
          <div />
        )}
      </nav>
      </div>

      {/* Scrollspy sidebar */}
      <div className="hidden xl:block w-8 shrink-0" data-no-print>
        <SectionNav items={navItems} activeId={activeId} />
      </div>
    </div>
    </>
  );
}
