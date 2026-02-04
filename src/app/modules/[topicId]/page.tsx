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
        <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent dark:from-blue-400 dark:to-purple-400">
          {module.title}
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">{topic.description}</p>
      </div>

      {/* Main Textbook Content Card */}
      <article className="rounded-3xl border border-zinc-200 bg-white p-10 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Introduction */}
        <div className="mb-12 space-y-4">
          {module.intro.map((paragraph, idx) => (
            <p
              key={paragraph}
              className={`text-lg leading-relaxed text-zinc-700 dark:text-zinc-200 ${
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
              {idx > 0 && <hr className="mb-10 border-t-2 border-zinc-200 dark:border-zinc-700" />}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">
                  {section.title}
                </h2>
                {section.body.every((text) => text.trim().startsWith("-")) ? (
                  <ul className="ml-6 space-y-3 text-lg leading-relaxed text-zinc-700 dark:text-zinc-200">
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
                        className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-200"
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
        <hr className="my-12 border-t-2 border-zinc-200 dark:border-zinc-700" />
        <div>
          <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">
            Worked Examples
          </h2>
          <div className="space-y-8">
            {module.examples.map((example, idx) => (
              <div key={example.title} className="rounded-xl bg-blue-50/50 p-6 dark:bg-blue-950/20">
                <h3 className="mb-3 text-xl font-semibold text-blue-900 dark:text-blue-100">
                  Example {idx + 1}: {example.title}
                </h3>
                <ol className="space-y-3 pl-6 text-lg text-zinc-700 dark:text-zinc-200">
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
        <hr className="my-12 border-t-2 border-zinc-200 dark:border-zinc-700" />
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-lg dark:bg-red-900/30">
              ⚠️
            </div>
            <h2 className="text-2xl font-bold text-red-900 dark:text-red-100">
              Common Mistakes to Avoid
            </h2>
          </div>
          <ul className="ml-6 space-y-3 text-lg leading-relaxed text-zinc-700 dark:text-zinc-200">
            {module.commonMistakes.map((mistake) => (
              <li key={mistake} className="list-disc">
                <MathText text={mistake} />
              </li>
            ))}
          </ul>
        </div>
      </article>

      {/* Practice CTA Section */}
      <section className="mt-8 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-10 text-center shadow-2xl">
        <div className="mb-6">
          <h2 className="mb-3 text-3xl font-bold text-white">
            Ready to practice?
          </h2>
          <p className="text-xl text-blue-50">
            Test your understanding with {moduleProblems.length} problems on {topic.title.toLowerCase()}.
          </p>
        </div>
        <Link
          className="inline-block rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg transition hover:scale-105"
          href={`/practice/${topic.id}`}
        >
          Start practice session →
        </Link>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {moduleProblems.slice(0, 3).map((problem, index) => (
            <div
              key={problem.id}
              className="rounded-xl border border-white/30 bg-white/10 p-4 text-left backdrop-blur"
            >
              <p className="mb-2 text-xs font-semibold text-blue-100">
                Sample Question {index + 1}
              </p>
              <p className="text-sm text-white">
                <MathText text={problem.prompt} />
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
