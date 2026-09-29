/**
 * The solutions sheet: /[subject]/test/[topicId]/answers.
 *
 * Deliberately a separate URL rather than a toggle, so the question sheet can
 * be printed with no solutions anywhere on it. Here the solutions ARE the
 * content — they carry no `.answer-reveal` class, so they print normally.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { preloadKatexFonts } from "@/lib/katex-assets";

import { AnswerSheet } from "@/components/problem-sheet";
import { loadSubjectIndex } from "@/lib/content/loader";
import { listAllProblemSetParams, loadProblemSet, problemSetMinutes } from "@/lib/content/problemset-loader";

type Props = {
  params: Promise<{ subject: string; topicId: string }>;
};

/** Every sheet is prerendered at build; there is no on-demand rendering. */
export async function generateStaticParams() {
  return listAllProblemSetParams();
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: slug, topicId } = await params;
  const set = await loadProblemSet(slug, topicId);
  if (!set) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }
  return {
    title: `${set.title} — Solutions`,
    description: `Full worked solutions to the ${set.title} problem sheet.`,
    alternates: { canonical: `https://calc-path.com/${slug}/test/${topicId}/answers` },
  };
}

export default async function ChapterTestAnswersPage({ params }: Props) {
  preloadKatexFonts();
  const { subject: slug, topicId } = await params;

  const set = await loadProblemSet(slug, topicId);
  if (!set) {
    notFound();
  }

  let subjectLabel = slug;
  try {
    subjectLabel = (await loadSubjectIndex(slug)).label;
  } catch {
    notFound();
  }

  return (
    <AnswerSheet
      subjectSlug={slug}
      subjectLabel={subjectLabel}
      topicId={topicId}
      set={set}
      totalMinutes={problemSetMinutes(set)}
    />
  );
}
