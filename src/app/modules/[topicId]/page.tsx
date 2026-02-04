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

      <section className="space-y-4 rounded-3xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/30 p-8 shadow-lg dark:border-blue-900/30 dark:from-zinc-900 dark:to-blue-950/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-xl text-white shadow-md">
            📚
          </div>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">Explanation</h2>
        </div>
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
              className="space-y-3 rounded-2xl border border-purple-100 bg-gradient-to-br from-white via-purple-50/20 to-blue-50/20 p-6 shadow-md transition hover:shadow-lg dark:border-purple-900/30 dark:from-zinc-900 dark:via-purple-950/10 dark:to-blue-950/10"
            >
              <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-100">{section.title}</h3>
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

      <section className="mt-8 space-y-4 rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 p-8 shadow-lg dark:border-emerald-900/30 dark:from-zinc-900 dark:to-emerald-950/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 text-xl text-white shadow-md">
            ✏️
          </div>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-blue-400">Worked examples</h2>
        </div>
        <div className="space-y-4">
          {module.examples.map((example) => (
            <div
              key={example.title}
              className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/50 p-5 text-base shadow-sm transition hover:shadow-md dark:border-emerald-900/30 dark:from-zinc-900 dark:to-emerald-950/20"
            >
              <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">{example.title}</h3>
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

      <section className="mt-8 space-y-4 rounded-3xl border border-red-100 bg-gradient-to-br from-white to-red-50/30 p-8 shadow-lg dark:border-red-900/30 dark:from-zinc-900 dark:to-red-950/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 text-xl text-white shadow-md">
            ⚠️
          </div>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent dark:from-red-400 dark:to-orange-400">Common mistakes</h2>
        </div>
        <ul className="list-disc space-y-2 pl-5 text-base text-zinc-600 dark:text-zinc-300">
          {module.commonMistakes.map((mistake) => (
            <li key={mistake}>
              <MathText text={mistake} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 space-y-4 rounded-3xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/30 p-8 shadow-lg dark:border-blue-900/30 dark:from-zinc-900 dark:to-blue-950/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-xl text-white shadow-md">
              🎯
            </div>
            <div>
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">Practice questions</h2>
              <p className="text-base text-zinc-500">
                Start with these {moduleProblems.length} problems to reinforce the
                lesson.
              </p>
            </div>
          </div>
          <Link
            className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl hover:scale-105"
            href={`/practice/${topic.id}`}
          >
            Open practice →
          </Link>
        </div>
        <div className="space-y-3">
          {moduleProblems.slice(0, 6).map((problem, index) => (
            <div
              key={problem.id}
              className="rounded-xl border border-blue-200 bg-gradient-to-r from-white to-blue-50/50 px-5 py-4 text-base shadow-sm transition hover:shadow-md dark:border-blue-900/30 dark:from-zinc-900 dark:to-blue-950/20"
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
