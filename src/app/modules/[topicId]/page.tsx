"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MathText } from "@/components/math-text";
import { modules } from "@/lib/modules";
import { problems, topics } from "@/lib/content";

export default function ModulePage() {
  const params = useParams<{ topicId: string }>();
  const topicId = params?.topicId ?? "";
  const module = modules.find((item) => item.topicId === topicId);
  const topic = topics.find((item) => item.id === topicId);

  if (!module || !topic) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
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
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <div className="mb-8 space-y-3">
        <Link className="text-base font-medium text-orange-600 hover:text-orange-800" href="/modules">
          ← Back to modules
        </Link>
        <h1 className="text-4xl font-extrabold text-zinc-900">
          {module.title}
        </h1>
        <p className="text-lg text-zinc-600">{topic.description}</p>
      </div>

      {/* Main Textbook Content Card */}
      <article className="rounded-3xl border-2 border-orange-100 bg-white p-10 shadow-xl">
        {/* Introduction */}
        <div className="mb-12 space-y-4">
          {module.intro.map((paragraph, idx) => (
            <p
              key={paragraph}
              className={`text-lg leading-relaxed text-zinc-700 ${
                idx === 0 ? "text-xl font-medium" : ""
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
                <h2 className="mb-4 text-2xl font-bold text-zinc-900">
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
              </div>
            </div>
          ))}
        </div>

        {/* Worked Examples */}
        <hr className="my-12 border-t-2 border-orange-100" />
        <div>
          <h2 className="mb-6 text-2xl font-bold text-zinc-900">
            Worked Examples
          </h2>
          <div className="space-y-8">
            {module.examples.map((example, idx) => (
              <div key={example.title} className="rounded-xl bg-amber-50 p-6">
                <h3 className="mb-3 text-xl font-semibold text-zinc-900">
                  Example {idx + 1}: {example.title}
                </h3>
                <ol className="space-y-3 pl-6 text-lg text-zinc-700">
                  {example.steps.map((step) => (
                    <li key={step} className="list-decimal">
                      <MathText text={step} />
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>

        {/* Common Mistakes */}
        <hr className="my-12 border-t-2 border-orange-100" />
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-lg">
              ⚠️
            </div>
            <h2 className="text-2xl font-bold text-red-800">
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
      <section className="mt-8 rounded-3xl border-2 border-orange-100 bg-white p-8 shadow-lg">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">
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
              <div className="mb-4 flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-400 text-lg font-bold text-white shadow">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                    Problem {index + 1}
                  </p>
                  <p className="mt-1 text-xl font-semibold text-zinc-900">
                    <MathText text={problem.prompt} />
                  </p>
                </div>
              </div>

              {/* Step-by-step solution */}
              <div className="ml-14 border-l-4 border-emerald-200 bg-white/70 rounded-r-xl p-5">
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
      <section className="mt-8 rounded-3xl bg-gradient-to-r from-orange-500 to-rose-500 p-10 text-center shadow-2xl">
        <div className="mb-6">
          <h2 className="mb-3 text-3xl font-bold text-white">
            Ready to practice?
          </h2>
          <p className="text-xl text-orange-100">
            Test your understanding with {moduleProblems.length} problems on {topic.title.toLowerCase()}.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            className="inline-block rounded-full bg-white px-8 py-4 text-lg font-semibold text-orange-600 shadow-lg transition hover:scale-105"
            href={`/practice/${topic.id}`}
          >
            Start practice →
          </Link>
          <Link
            className="inline-block rounded-full border-2 border-white/40 bg-white/10 px-8 py-4 text-lg font-semibold text-white shadow-lg backdrop-blur-sm transition hover:bg-white/15 hover:scale-105"
            href={`/test/${topic.id}`}
          >
            Take 20-question test →
          </Link>
        </div>
      </section>
    </div>
  );
}
