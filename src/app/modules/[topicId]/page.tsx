"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { MathText } from "@/components/math-text";
import { modules } from "@/lib/modules";
import { problems, topics } from "@/lib/content";

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
        <Link className="btn-secondary mt-4 inline-flex" href="/modules">
          Back to modules
        </Link>
      </div>
    );
  }

  const moduleProblems = problems.filter(
    (problem) => problem.topicId === topic.id,
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl justify-center gap-4 px-4 py-8 sm:gap-6 sm:px-6 sm:py-12">
      {/* Main content */}
      <div className="w-full max-w-4xl">
      <div className="mb-6 space-y-3 sm:mb-8">
        <Link className="text-sm font-medium text-orange-600 hover:text-orange-800 sm:text-base" href="/modules">
          ← Back to modules
        </Link>
        <h1 className="text-2xl font-extrabold text-zinc-900 sm:text-3xl md:text-4xl">
          {module.title}
        </h1>
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
                  <details className="group mt-6 rounded-2xl border-2 border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50">
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
                      <div key={example.title} className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
                        <div className="mb-3 flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-200 text-sm font-bold text-amber-800">
                            {exIdx + 1}
                          </span>
                          <h4 className="text-lg font-semibold text-amber-900">
                            {example.title}
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
              </div>
            </div>
          ))}
        </div>

        {/* Common Mistakes */}
        <hr className="my-12 border-t-2 border-orange-100" />
        <div>
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
      <section className="mt-6 rounded-2xl border-2 border-orange-100 bg-white p-5 shadow-lg sm:mt-8 sm:rounded-3xl sm:p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="practice-preview" className="scroll-mt-24 text-xl font-bold text-zinc-900 sm:text-2xl">
              Worked Practice Problems (5 examples)
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Study these solved examples to understand the techniques. Then head to Practice to try problems on your own.
            </p>
          </div>
          <Link className="btn-primary" href={`/practice/${topic.id}`}>
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

      {/* Practice CTA Section */}
      <section className="mt-6 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 p-6 text-center shadow-2xl sm:mt-8 sm:rounded-3xl sm:p-10">
        <div className="mb-4 sm:mb-6">
          <h2 className="mb-2 text-2xl font-bold text-white sm:mb-3 sm:text-3xl">
            Ready to practice?
          </h2>
          <p className="text-base text-orange-100 sm:text-xl">
            Test your understanding with {moduleProblems.length} problems on {topic.title.toLowerCase()}.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Link
            className="w-full rounded-full bg-white px-6 py-3 text-base font-semibold text-orange-600 shadow-lg transition hover:scale-105 sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
            href={`/practice/${topic.id}`}
          >
            Start practice →
          </Link>
          <Link
            className="w-full rounded-full border-2 border-white/40 bg-white/10 px-6 py-3 text-base font-semibold text-white shadow-lg backdrop-blur-sm transition hover:bg-white/15 hover:scale-105 sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
            href={`/test/${topic.id}`}
          >
            Take 20-question test →
          </Link>
        </div>
      </section>
      </div>

      {/* Scrollspy sidebar */}
      <div className="hidden xl:block w-8 shrink-0">
        <SectionNav items={navItems} activeId={activeId} />
      </div>
    </div>
  );
}
