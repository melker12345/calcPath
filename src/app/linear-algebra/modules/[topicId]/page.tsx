"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { MathText } from "@/components/math-text";
import { VoteFeedback } from "@/components/vote-feedback";
import { modules } from "@/lib/linalg-modules";
import { problems, topics } from "@/lib/linalg-content";

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const accent = "#3372A2";
const accentLight = "#5b9fd4";
const text = "#e2e8f0";
const muted = "rgba(226,232,240,0.6)";
const border = "rgba(51,114,162,0.25)";

export default function LinalgModulePage() {
  const params = useParams<{ topicId: string }>();
  const topicId = params?.topicId ?? "";
  const module = modules.find((item) => item.topicId === topicId);
  const topic = topics.find((item) => item.id === topicId);

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

  if (!module || !topic) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-sm" style={{ color: muted }}>Module not found.</p>
        <Link className="btn-linalg-secondary mt-4 inline-flex" href="/linear-algebra/modules">
          Back to modules
        </Link>
      </div>
    );
  }

  const moduleProblems = problems.filter(
    (problem) => problem.topicId === topic.id,
  );

  const topicIndex = topics.findIndex((t) => t.id === topicId);
  const prevTopic = topicIndex > 0 ? topics[topicIndex - 1] : null;
  const nextTopic = topicIndex < topics.length - 1 ? topics[topicIndex + 1] : null;

  return (
    <div className="mx-auto flex w-full max-w-4xl justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full">
        <div className="mb-6 space-y-3 sm:mb-8">
          <Link className="text-sm font-medium hover:underline" href="/linear-algebra/modules" data-no-print style={{ color: accentLight }}>
            ← Back to modules
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold sm:text-3xl md:text-4xl" style={{ color: text }}>
              {module.title}
            </h1>
            <div className="relative" data-no-print>
              <button
                type="button"
                onClick={() => { setShowPrintModal((v) => !v); setPrintStep("choose"); }}
                className="rounded-xl p-2 transition hover:opacity-80"
                style={{ color: muted }}
                title="Print module"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.552c.377.046.752.097 1.126.153A2.212 2.212 0 0 1 18 8.653v4.097A2.25 2.25 0 0 1 15.75 15h-.75v.75c0 .966-.784 1.75-1.75 1.75h-6.5A1.75 1.75 0 0 1 5 15.75V15h-.75A2.25 2.25 0 0 1 2 12.75V8.653c0-1.082.775-2.034 1.874-2.198.374-.056.75-.107 1.126-.153V2.75ZM13.5 4V2.75a.25.25 0 0 0-.25-.25h-6.5a.25.25 0 0 0-.25.25V4h7ZM6.5 15.75v-3.5h7v3.5a.25.25 0 0 1-.25.25h-6.5a.25.25 0 0 1-.25-.25Zm-1-6a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                </svg>
              </button>
              {showPrintModal && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => { setShowPrintModal(false); setPrintStep("choose"); }} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-xl bg-white p-3 shadow-xl" style={{ border: `2px solid ${border}` }}>
                    {printStep === "choose" ? (
                      <>
                        <p className="mb-2 text-xs font-semibold text-zinc-500">Print this module</p>
                        <button type="button" onClick={() => { setShowPrintModal(false); setPrintStep("choose"); setPrintMode("text"); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs">📄</span>
                          Text only
                        </button>
                        <button type="button" onClick={() => setPrintStep("count")} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs">📝</span>
                          Text + Questions
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => setPrintStep("choose")} className="mb-2 text-xs font-medium text-blue-600 hover:text-blue-800">← Back</button>
                        <p className="mb-2 text-xs font-semibold text-zinc-500">How many questions? ({moduleProblems.length} available)</p>
                        {[1, 3, 5, moduleProblems.length].map((n) => (
                          <button key={n} type="button" onClick={() => { setShowPrintModal(false); setPrintStep("choose"); setPrintQuestionCount(n); setPrintMode("questions"); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
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
          <p className="text-lg" style={{ color: muted }}>{topic.description}</p>
        </div>

        <article className="rounded-2xl p-5 shadow-xl sm:rounded-3xl sm:p-10" style={{ background: "rgba(255,255,255,0.04)", border: `2px solid ${border}` }}>
          <div className="mb-8 space-y-4 sm:mb-12">
            {module.intro.map((paragraph, idx) => (
              <p key={paragraph} className={`text-base leading-relaxed sm:text-lg ${idx === 0 ? "text-lg font-medium sm:text-xl" : ""}`} style={{ color: text }}>
                <MathText text={paragraph} />
              </p>
            ))}
          </div>

          <div className="space-y-10">
            {module.sections.map((section, idx) => (
              <div key={section.title}>
                {idx > 0 && <hr className="mb-10" style={{ borderColor: border }} />}
                <div>
                  <h2 id={toSlug(section.title)} className="mb-4 scroll-mt-24 text-xl font-bold sm:text-2xl" style={{ color: text }}>{section.title}</h2>
                  <div className="space-y-4">
                    {section.body.map((t) => (
                      <p key={t} className="text-lg leading-relaxed" style={{ color: text }}><MathText text={t} /></p>
                    ))}
                  </div>

                  {section.eli5 && section.eli5.length > 0 && (
                    <details className="print-keep-together group mt-6 rounded-2xl" style={{ border: `2px solid rgba(51,114,162,0.2)`, background: "rgba(51,114,162,0.06)" }}>
                      <summary className="flex cursor-pointer select-none items-center gap-3 px-5 py-3.5 text-sm font-semibold [&::-webkit-details-marker]:hidden" style={{ color: accentLight }}>
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg text-base transition-transform group-open:rotate-12" style={{ background: "rgba(51,114,162,0.15)" }}>💡</span>
                        <span>Explain it simply</span>
                        <svg className="ml-auto h-4 w-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </summary>
                      <div className="space-y-3 px-5 pb-5 pt-1">
                        {section.eli5.map((t) => (
                          <p key={t} className="text-base leading-relaxed" style={{ color: text }}><MathText text={t} /></p>
                        ))}
                      </div>
                    </details>
                  )}

                  {section.examples && section.examples.length > 0 && (
                    <div className="mt-6 space-y-4">
                      {section.examples.map((example, exIdx) => (
                        <div key={example.title} className="print-keep-together rounded-xl p-5" style={{ border: `2px solid rgba(51,114,162,0.2)`, background: "rgba(51,114,162,0.06)" }}>
                          <div className="mb-3 flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold" style={{ background: "rgba(51,114,162,0.2)", color: accentLight }}>{exIdx + 1}</span>
                            <h4 className="text-lg font-semibold" style={{ color: accentLight }}><MathText text={example.title} /></h4>
                          </div>
                          <ol className="space-y-2.5 pl-4 text-base leading-relaxed" style={{ color: text }}>
                            {example.steps.map((step) => (
                              <li key={step} className="list-decimal"><MathText text={step} /></li>
                            ))}
                          </ol>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end" data-no-print>
                    <VoteFeedback targetType="section" targetId={`linalg:${topicId}:${toSlug(section.title)}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <hr className="my-12" style={{ borderColor: border }} />
          <div className="print-keep-together">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg text-lg" style={{ background: "rgba(239,68,68,0.15)" }}>⚠️</div>
              <h2 className="text-2xl font-bold" style={{ color: "#fca5a5" }}>Common Mistakes to Avoid</h2>
            </div>
            <ul className="ml-6 space-y-3 text-lg leading-relaxed" style={{ color: text }}>
              {module.commonMistakes.map((mistake) => (
                <li key={mistake} className="list-disc"><MathText text={mistake} /></li>
              ))}
            </ul>
          </div>
        </article>

        {/* Print-only worksheet */}
        {printMode === "questions" && printQuestionCount > 0 && (
          <section className="hidden print-only mt-8">
            <h2 className="mb-6 text-xl font-bold">Practice Questions — {topic.title}</h2>
            <ol className="list-decimal space-y-8 pl-6">
              {moduleProblems.slice(0, printQuestionCount).map((problem) => (
                <li key={problem.id} className="print-keep-together">
                  <div className="mb-2"><MathText text={problem.prompt} /></div>
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

        <nav className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2" data-no-print>
          {prevTopic ? (
            <Link href={`/linear-algebra/modules/${prevTopic.id}`} className="group rounded-2xl p-5 transition-all hover:shadow-md sm:rounded-3xl sm:p-6" style={{ background: "rgba(255,255,255,0.04)", border: `2px solid ${border}` }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: accent }}>Previous</p>
              <p className="mt-0.5 text-base font-bold sm:text-lg" style={{ color: text }}>{prevTopic.title}</p>
            </Link>
          ) : <div />}
          {nextTopic ? (
            <Link href={`/linear-algebra/modules/${nextTopic.id}`} className="group rounded-2xl p-5 text-right transition-all hover:shadow-md sm:rounded-3xl sm:p-6" style={{ background: "rgba(255,255,255,0.04)", border: `2px solid ${border}` }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: accent }}>Next</p>
              <p className="mt-0.5 text-base font-bold sm:text-lg" style={{ color: text }}>{nextTopic.title}</p>
            </Link>
          ) : <div />}
        </nav>
      </div>
    </div>
  );
}
