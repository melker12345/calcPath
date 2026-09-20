import type { Metadata } from "next";
import Link from "next/link";
import { listAllProblemSets } from "@/lib/content/problemset-loader";

/**
 * /problem-sets — the catalogue of printable problem sets.
 *
 * Each entry is a chapter that ships a problemset.json: a question sheet meant
 * to be printed and worked on paper, with a separate solutions sheet. Nothing
 * here is graded on screen, which is the point — paper can ask for proofs,
 * sketches and find-the-error work that auto-grading cannot.
 *
 * Server Component, auto-discovered: dropping a problemset.json into a chapter
 * folder adds it here with no code change.
 */

export const metadata: Metadata = {
  title: "Problem Sets — Printable Chapter Tests | CalcPath",
  description:
    "Printable problem sets for university mathematics. Work each sheet on paper, then check your route against full worked solutions on a separate page.",
  alternates: { canonical: "https://calc-path.com/problem-sets" },
};

export default async function ProblemSetsPage() {
  const groups = await listAllProblemSets();
  const total = groups.reduce((n, g) => n + g.sets.length, 0);

  return (
    <div className="theme-bg theme-text">
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight theme-text">Problem sets</h1>
        <p className="mt-1 text-sm theme-text-muted">
          Printable chapter tests · {total} {total === 1 ? "sheet" : "sheets"}
        </p>

        <p className="mt-6 text-[15px] leading-relaxed theme-text-secondary">
          Each set is a question sheet for one chapter, written to be printed and
          worked on paper with every step shown. Nothing is graded on screen. When
          you are done, the solutions page gives the full method for every
          question so you can check your route, not just your answer.
        </p>

        {groups.length === 0 ? (
          <p className="mt-10 text-[15px] theme-text-secondary">
            No problem sets are published yet.
          </p>
        ) : (
          groups.map((group) => (
            <section key={group.subjectSlug} className="mt-10">
              <h2 className="border-b theme-border pb-1.5 text-lg font-semibold tracking-tight theme-text">
                <Link href={`/${group.subjectSlug}`} className="hover:underline">
                  {group.subjectLabel}
                </Link>
              </h2>
              <ul className="mt-2 divide-y theme-border">
                {group.sets.map((set) => (
                  <li
                    key={set.topicId}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/${set.subjectSlug}/test/${set.topicId}`}
                        className="text-[15px] font-medium theme-text hover:underline"
                      >
                        {set.title}
                      </Link>
                      <p className="mt-0.5 text-xs theme-text-muted">
                        {set.problemCount} {set.problemCount === 1 ? "question" : "questions"} · about{" "}
                        {set.minutes} min
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-4 text-sm">
                      <Link
                        href={`/${set.subjectSlug}/test/${set.topicId}`}
                        className="font-medium text-[var(--accent)] hover:underline"
                      >
                        Question sheet
                      </Link>
                      <Link
                        href={`/${set.subjectSlug}/test/${set.topicId}/answers`}
                        className="theme-text-secondary hover:underline"
                      >
                        Solutions
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}

        <p className="mt-12 border-t theme-border pt-4 text-sm theme-text-secondary">
          More sheets are being written chapter by chapter. Found a mistake in one?{" "}
          <Link href="/feedback" className="font-medium text-[var(--accent)] underline underline-offset-2">
            Tell us
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
