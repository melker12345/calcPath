"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { BlockMath, InlineMath } from "react-katex";
import { MathText } from "@/components/math-text";
import { ModuleDoneButton } from "@/components/module-done-button";
import { ModuleSectionNav } from "@/components/module-section-nav";
import { VoteFeedback } from "@/components/vote-feedback";
import { modules } from "@/lib/linalg-modules";
import { topics } from "@/lib/linalg-content";

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function splitMath(text: string) {
  const parts: Array<{ type: "text" | "math"; value: string }> = [];
  let current = "";
  let inMath = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === "$" && i > 0 && text[i - 1] === "\\") {
      current = current.slice(0, -1) + "$";
    } else if (char === "$") {
      if (inMath) parts.push({ type: "math", value: current });
      else if (current) parts.push({ type: "text", value: current });
      current = "";
      inMath = !inMath;
    } else {
      current += char;
    }
  }

  if (current) parts.push({ type: inMath ? "math" : "text", value: current });
  return parts;
}

function isBlockMath(value: string) {
  return /\\begin\{(?:array|matrix|bmatrix|pmatrix|Bmatrix|vmatrix|Vmatrix)\}/.test(value);
}

function RichMathText({ value }: { value: string }) {
  const parts = splitMath(value);

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "text") return <span key={`${part.value}-${index}`}>{part.value}</span>;
        if (isBlockMath(part.value)) {
          return (
            <div key={`${part.value}-${index}`} className="my-3 overflow-x-auto">
              <BlockMath math={part.value} />
            </div>
          );
        }
        return <InlineMath key={`${part.value}-${index}`} math={part.value} />;
      })}
    </>
  );
}

export default function LinalgModulePage() {
  const params = useParams<{ topicId: string }>();
  const topicId = params?.topicId ?? "";
  const lessonModule = modules.find((item) => item.topicId === topicId);
  const topic = topics.find((item) => item.id === topicId);

  const navItems = useMemo(() => {
    if (!lessonModule) return [];
    return [
      { id: "intro", label: "Introduction" },
      ...lessonModule.sections.map((section) => ({
        id: toSlug(section.title),
        label: section.title,
      })),
      { id: "mistakes", label: "Common Mistakes" },
    ];
  }, [lessonModule]);

  if (!lessonModule || !topic) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-sm text-stone-600">Module not found.</p>
        <Link className="btn-secondary mt-4 inline-flex" href="/linear-algebra/modules">
          Back to modules
        </Link>
      </div>
    );
  }

  const topicIndex = topics.findIndex((t) => t.id === topicId);
  const prevTopic = topicIndex > 0 ? topics[topicIndex - 1] : null;
  const nextTopic = topicIndex < topics.length - 1 ? topics[topicIndex + 1] : null;

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 py-8 sm:px-6 sm:py-10">
      <div className="min-w-0">
        <div className="mb-6 border-b border-stone-300 pb-5 sm:mb-8">
          <Link className="text-sm text-blue-800 hover:underline" href="/linear-algebra/modules" data-no-print>
            Back to Linear Algebra contents
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
            {lessonModule.title}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-stone-700">
            {topic.description}
          </p>
        </div>

        <article>
          <div id="intro" className="mb-8 space-y-4 sm:mb-12">
            {lessonModule.intro.map((paragraph, idx) => (
              <p
                key={paragraph}
                className={`text-base leading-7 text-stone-700 ${
                  idx === 0 ? "font-medium text-stone-900 sm:text-lg" : ""
                }`}
              >
                <MathText text={paragraph} />
              </p>
            ))}
          </div>

          <div className="space-y-10">
            {lessonModule.sections.map((section, idx) => (
              <section key={section.title}>
                {idx > 0 && <hr className="mb-10 border-t border-stone-300" />}
                <h2 id={toSlug(section.title)} className="mb-4 scroll-mt-24 text-2xl font-semibold text-stone-950">
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.body.map((text) => (
                    <p key={text} className="text-base leading-7 text-stone-700">
                      <MathText text={text} />
                    </p>
                  ))}
                </div>

                {section.eli5 && section.eli5.length > 0 && (
                  <details className="print-keep-together group mt-6 border border-blue-200 bg-blue-50 module-callout">
                    <summary className="flex cursor-pointer select-none items-center gap-3 px-4 py-3 text-sm font-semibold text-blue-950 hover:bg-blue-100 dark:hover:bg-transparent [&::-webkit-details-marker]:hidden">
                      <span className="note-label text-xs font-semibold uppercase tracking-wide text-blue-700">Note</span>
                      <span>Explain it simply</span>
                      <svg className="ml-auto h-4 w-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </summary>
                    <div className="space-y-3 px-5 pb-5 pt-1">
                      {section.eli5.map((text) => (
                        <p key={text} className="text-base leading-7 text-stone-700 example-body">
                          <MathText text={text} />
                        </p>
                      ))}
                    </div>
                  </details>
                )}

                {section.examples && section.examples.length > 0 && (
                  <div className="mt-6 space-y-4">
                    {section.examples.map((example, exIdx) => (
                      <div key={example.title} className="print-keep-together border border-stone-300 bg-[#fffef8] p-5 example-card">
                        <div className="mb-3 flex items-center gap-3">
                          <span className="example-badge flex h-7 w-7 items-center justify-center border border-stone-300 bg-white text-sm font-semibold text-stone-600">
                            {exIdx + 1}
                          </span>
                          <h4 className="text-lg font-semibold text-stone-950">
                            <MathText text={example.title} />
                          </h4>
                        </div>
                        <ol className="space-y-2.5 pl-4 text-base leading-7 text-stone-700">
                          {example.steps.map((step) => (
                            <li key={step} className="list-decimal">
                              <RichMathText value={step} />
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex justify-end" data-no-print>
                  <VoteFeedback targetType="section" targetId={`linalg:${topicId}:${toSlug(section.title)}`} />
                </div>
              </section>
            ))}
          </div>

          <hr className="my-12 border-t border-stone-300" />
          <section className="print-keep-together">
            <h2 id="mistakes" className="mb-4 scroll-mt-24 text-2xl font-semibold text-stone-950">
              Common Mistakes to Avoid
            </h2>
            <ul className="ml-6 space-y-3 text-base leading-7 text-stone-700">
              {lessonModule.commonMistakes.map((mistake) => (
                <li key={mistake} className="list-disc">
                  <MathText text={mistake} />
                </li>
              ))}
            </ul>
          </section>
        </article>

        <div className="mt-10">
          <ModuleDoneButton moduleId={`linear-algebra:${topic.id}`} />
        </div>

        <nav className="mt-10 grid gap-4 border-t border-stone-300 pt-8 sm:grid-cols-2" data-no-print>
          {prevTopic ? (
            <Link href={`/linear-algebra/modules/${prevTopic.id}`} className="border border-stone-300 bg-[#fffef8] p-5 transition hover:bg-stone-100 nav-card">
              <p className="nav-label text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Previous</p>
              <p className="nav-title mt-0.5 text-base font-semibold text-stone-950">{prevTopic.title}</p>
            </Link>
          ) : <div />}
          {nextTopic ? (
            <Link href={`/linear-algebra/modules/${nextTopic.id}`} className="border border-stone-300 bg-[#fffef8] p-5 text-right transition hover:bg-stone-100">
              <p className="nav-label text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Next</p>
              <p className="nav-title mt-0.5 text-base font-semibold text-stone-950">{nextTopic.title}</p>
            </Link>
          ) : <div />}
        </nav>
      </div>

      <div data-no-print>
        <ModuleSectionNav items={navItems} />
      </div>
    </div>
  );
}
