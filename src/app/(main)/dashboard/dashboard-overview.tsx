"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useProgress } from "@/components/progress-provider";
import { ProgressTools } from "@/components/progress-tools";
import { chapterKey, countCorrectInTopic } from "@/lib/progress";

export type OverviewSubject = {
  slug: string;
  label: string;
  topics: Array<{ id: string; questionTotal: number }>;
  /** Chapter ids that ship a printable problem set. */
  problemSetTopicIds: string[];
};

type Row = {
  slug: string;
  label: string;
  chaptersRead: number;
  chapters: number;
  correct: number;
  questions: number;
  sheetsDone: number;
  sheets: number;
};

const cell = "border-b theme-border py-2 pr-2 align-top sm:pr-3";
const num = `${cell} text-right tabular-nums whitespace-nowrap`;

export function DashboardOverview({ subjects }: { subjects: OverviewSubject[] }) {
  const { progress } = useProgress();

  const rows = useMemo<Row[]>(
    () =>
      subjects.map((s) => ({
        slug: s.slug,
        label: s.label,
        chaptersRead: s.topics.filter((t) => progress.readChapters.includes(chapterKey(s.slug, t.id))).length,
        chapters: s.topics.length,
        correct: s.topics.reduce((n, t) => n + countCorrectInTopic(progress, t.id, t.questionTotal), 0),
        questions: s.topics.reduce((n, t) => n + t.questionTotal, 0),
        sheetsDone: s.problemSetTopicIds.filter((id) => progress.completedProblemSets.includes(chapterKey(s.slug, id)))
          .length,
        sheets: s.problemSetTopicIds.length,
      })),
    [subjects, progress],
  );

  const total = rows.reduce(
    (acc, r) => ({
      chaptersRead: acc.chaptersRead + r.chaptersRead,
      chapters: acc.chapters + r.chapters,
      correct: acc.correct + r.correct,
      questions: acc.questions + r.questions,
      sheetsDone: acc.sheetsDone + r.sheetsDone,
      sheets: acc.sheets + r.sheets,
    }),
    { chaptersRead: 0, chapters: 0, correct: 0, questions: 0, sheetsDone: 0, sheets: 0 },
  );
  const nothingYet = total.chaptersRead === 0 && total.correct === 0 && total.sheetsDone === 0;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="font-serif text-3xl font-semibold tracking-tight theme-text">Progress</h1>
      <p className="mt-2 max-w-2xl text-sm theme-text-secondary">
        Chapters you have marked as read, practice questions answered correctly, and problem sets
        marked as done. Saved in this browser.
        {nothingYet && " Nothing is recorded yet; it appears here as you read, practise and work sheets."}
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="text-left theme-text-muted">
              <th scope="col" className={`${cell} font-medium`}>Subject</th>
              <th scope="col" className={`${num} font-medium`}>
                <span className="sm:hidden">Read</span>
                <span className="hidden sm:inline">Chapters read</span>
              </th>
              <th scope="col" className={`${num} font-medium`}>
                <span className="sm:hidden">Correct</span>
                <span className="hidden sm:inline">Questions correct</span>
              </th>
              <th scope="col" className={`${num} font-medium`}>
                <span className="sm:hidden">Sheets</span>
                <span className="hidden sm:inline">Sheets done</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug}>
                <td className={cell}>
                  <Link href={`/dashboard/${r.slug}`} className="text-[var(--accent)] hover:underline">
                    {r.label}
                  </Link>
                </td>
                <td className={num}>
                  {r.chaptersRead} / {r.chapters}
                </td>
                <td className={num}>
                  {r.correct} / {r.questions}
                </td>
                <td className={num}>{r.sheets > 0 ? `${r.sheetsDone} / ${r.sheets}` : "—"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold theme-text">
              <td className={cell}>All subjects</td>
              <td className={num}>
                {total.chaptersRead} / {total.chapters}
              </td>
              <td className={num}>
                {total.correct} / {total.questions}
              </td>
              <td className={num}>
                {total.sheetsDone} / {total.sheets}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="mt-2 text-xs theme-text-muted">
        Question counts are auto-graded practice; they show which basics are in place, not how well a
        chapter is understood.
      </p>

      <ProgressTools />
    </main>
  );
}
