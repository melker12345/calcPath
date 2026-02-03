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
        <p className="text-sm text-zinc-500">Module not found.</p>
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
        <Link className="text-base font-medium text-emerald-600" href="/modules">
          ← Back to modules
        </Link>
        <h1 className="text-4xl font-semibold">{module.title}</h1>
        <p className="text-base text-zinc-500">{topic.description}</p>
      </div>

      <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-2xl font-semibold">Explanation</h2>
        <div>
          {module.intro.map((paragraph) => (
            <p
              key={paragraph}
              className="text-base text-zinc-600 dark:text-zinc-300"
            >
              <MathText text={paragraph} />
            </p>
          ))}
        </div>
        <div className="mt-6 space-y-4">
          {module.sections.map((section) => (
            <div
              key={section.title}
              className="space-y-3 rounded-xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-5 shadow-sm dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-900"
            >
              <h3 className="text-xl font-semibold">{section.title}</h3>
              {section.body.every((text) => text.trim().startsWith("-")) ? (
                <ul className="list-disc space-y-2 pl-5 text-base text-zinc-600 dark:text-zinc-300">
                  {section.body.map((text) => (
                    <li key={text}>
                      <MathText text={text.replace(/^-\s*/, "")} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div>
                  {section.body.map((text) => (
                    <p
                      key={text}
                      className="text-base text-zinc-600 dark:text-zinc-300"
                    >
                      <MathText text={text} />
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 space-y-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-2xl font-semibold">Worked examples</h2>
        <div className="space-y-4">
          {module.examples.map((example) => (
            <div
              key={example.title}
              className="rounded-xl border border-zinc-200 p-5 text-base dark:border-zinc-800"
            >
              <h3 className="text-lg font-semibold">{example.title}</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-4 text-zinc-600 dark:text-zinc-300">
                {example.steps.map((step) => (
                  <li key={step}>
                    <MathText text={step} />
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 space-y-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-2xl font-semibold">Common mistakes</h2>
        <ul className="list-disc space-y-2 pl-5 text-base text-zinc-600 dark:text-zinc-300">
          {module.commonMistakes.map((mistake) => (
            <li key={mistake}>
              <MathText text={mistake} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 space-y-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Practice questions</h2>
            <p className="text-base text-zinc-500">
              Start with these {moduleProblems.length} problems to reinforce the
              lesson.
            </p>
          </div>
          <Link className="btn-primary" href={`/practice/${topic.id}`}>
            Open practice
          </Link>
        </div>
        <div className="space-y-3">
          {moduleProblems.slice(0, 6).map((problem, index) => (
            <div
              key={problem.id}
              className="rounded-lg border border-zinc-200 px-4 py-3 text-base dark:border-zinc-800"
            >
              <p className="text-xs text-zinc-500">Question {index + 1}</p>
              <p className="font-medium">
                <MathText text={problem.prompt} />
              </p>
            </div>
          ))}
        </div>
        <p className="text-sm text-zinc-500">
          Full practice is available in the practice section.
        </p>
      </section>
    </div>
  );
}
