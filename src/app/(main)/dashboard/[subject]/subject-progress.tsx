"use client";

import Link from "next/link";
import { useState } from "react";
import { useProgress } from "@/lib/use-progress";
import { chapterKey, countCorrectIn } from "@/lib/progress";
import type { DashboardTopic } from "@/lib/content/loader";

export type SubjectProgressTopic = Omit<DashboardTopic, "sections"> & {
  hasProblemSet: boolean;
  sections: Array<DashboardTopic["sections"][number] & { titleHtml: string }>;
};

const cell = "border-b theme-border py-2 pr-2 align-top sm:pr-3";
const num = `${cell} text-right tabular-nums whitespace-nowrap`;
const toggle = "border px-2 py-0.5 text-xs whitespace-nowrap";
const toggleOn = `${toggle} border-[var(--accent)] text-[var(--accent)]`;
const toggleOff = `${toggle} theme-border theme-text-secondary`;

export function SubjectProgress({
  subject,
  topics,
  sectionIds,
}: {
  subject: { slug: string; label: string };
  topics: SubjectProgressTopic[];
  sectionIds: Record<string, Record<string, string[]>>;
}) {
  const { progress, toggleChapterRead, toggleProblemSetDone } = useProgress();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const allIds = (topicId: string) => Object.values(sectionIds[topicId] ?? {}).flat();

  const chaptersRead = topics.filter((t) => progress.readChapters.includes(chapterKey(subject.slug, t.id))).length;
  const questionTotal = topics.reduce((n, t) => n + t.questionTotal, 0);
  const correctTotal = topics.reduce((n, t) => n + countCorrectIn(progress, allIds(t.id)), 0);
  const sheets = topics.filter((t) => t.hasProblemSet);
  const sheetsDone = sheets.filter((t) => progress.completedProblemSets.includes(chapterKey(subject.slug, t.id))).length;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <nav className="text-sm theme-text-muted">
        <Link prefetch={false} href="/dashboard" className="hover:underline">
          Progress
        </Link>
        <span className="mx-2">/</span>
        <span className="theme-text">{subject.label}</span>
      </nav>
      <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight theme-text">{subject.label}</h1>
      <p className="mt-2 text-sm theme-text-secondary">
        {chaptersRead} / {topics.length} chapters read · {correctTotal} / {questionTotal} questions correct
        {sheets.length > 0 && ` · ${sheetsDone} / ${sheets.length} problem sets done`}
        {" · "}
        <Link prefetch={false} href={`/${subject.slug}`} className="text-[var(--accent)] hover:underline">
          Contents
        </Link>
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="text-left theme-text-muted">
              <th scope="col" className={`${cell} w-8 font-medium`}>#</th>
              <th scope="col" className={`${cell} font-medium`}>Chapter</th>
              <th scope="col" className={`${cell} font-medium`}>Read</th>
              <th scope="col" className={`${num} font-medium`}>Practice</th>
              <th scope="col" className={`${cell} font-medium`}>
                <span className="sm:hidden">Sheet</span>
                <span className="hidden sm:inline">Problem set</span>
              </th>
            </tr>
          </thead>
          {topics.map((t, index) => {
            const key = chapterKey(subject.slug, t.id);
            const read = progress.readChapters.includes(key);
            const done = progress.completedProblemSets.includes(key);
            const correct = countCorrectIn(progress, allIds(t.id));
            const expanded = !!open[t.id];
            const hasSections = t.sections.length > 0;
            return (
              <tbody key={t.id}>
                <tr>
                  <td className={`${cell} tabular-nums theme-text-muted`}>{index + 1}</td>
                  <td className={cell}>
                    <Link prefetch={false} href={`/${subject.slug}/modules/${t.id}`} className="theme-text hover:underline">
                      {t.title}
                    </Link>
                    {hasSections && (
                      <button
                        type="button"
                        onClick={() => setOpen((prev) => ({ ...prev, [t.id]: !prev[t.id] }))}
                        aria-expanded={expanded}
                        className="ml-2 text-xs theme-text-muted hover:underline"
                      >
                        {expanded ? "hide sections" : `${t.sections.length} sections`}
                      </button>
                    )}
                  </td>
                  <td className={cell}>
                    <button
                      type="button"
                      onClick={() => toggleChapterRead(key)}
                      aria-pressed={read}
                      className={read ? toggleOn : toggleOff}
                    >
                      {read ? "read ✓" : "mark read"}
                    </button>
                  </td>
                  <td className={num}>
                    {t.questionTotal > 0 ? (
                      <Link prefetch={false} href={`/${subject.slug}/practice/${t.id}`} className="hover:underline">
                        {correct} / {t.questionTotal}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={cell}>
                    {t.hasProblemSet ? (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleProblemSetDone(key)}
                          aria-pressed={done}
                          className={done ? toggleOn : toggleOff}
                        >
                          {done ? "done ✓" : "mark done"}
                        </button>
                        <Link prefetch={false}
                          href={`/${subject.slug}/test/${t.id}`}
                          className="ml-2 inline-block text-xs text-[var(--accent)] hover:underline"
                        >
                          open
                        </Link>
                      </>
                    ) : (
                      <span className="theme-text-muted">—</span>
                    )}
                  </td>
                </tr>
                {expanded &&
                  t.sections.map((s, sIdx) => {
                    const ids = sectionIds[t.id]?.[s.slug] ?? [];
                    const sectionCorrect = countCorrectIn(progress, ids);
                    return (
                      <tr key={s.slug} className="theme-text-secondary">
                        <td className={`${cell} tabular-nums theme-text-muted`}>
                          {index + 1}.{sIdx + 1}
                        </td>
                        <td className={`${cell} pl-4`}>
                          <Link prefetch={false} href={`/${subject.slug}/modules/${t.id}#${s.slug}`} className="hover:underline">
                            <span dangerouslySetInnerHTML={{ __html: s.titleHtml }} />
                          </Link>
                        </td>
                        <td className={cell} />
                        <td className={num}>
                          {s.total > 0 ? (
                            <Link prefetch={false}
                              href={`/${subject.slug}/practice/${t.id}?section=${encodeURIComponent(s.slug)}`}
                              className="hover:underline"
                            >
                              {sectionCorrect} / {s.total}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className={cell} />
                      </tr>
                    );
                  })}
              </tbody>
            );
          })}
        </table>
      </div>
      <p className="mt-2 text-xs theme-text-muted">
        Practice counts unique questions answered correctly. Read and done marks are yours to set.
      </p>
    </div>
  );
}
