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
import { JsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

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
  let subjectLabel = slug;
  try {
    subjectLabel = (await loadSubjectIndex(slug)).label;
  } catch {
    // keep the slug
  }
  return pageMetadata({
    title: `${set.title} Problem Set Solutions — ${subjectLabel}`,
    description: `Full worked solutions, step by step, to every problem on the ${set.title.toLowerCase()} problem set in ${subjectLabel.toLowerCase()}.`,
    path: `/${slug}/test/${topicId}/answers`,
  });
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
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: subjectLabel, path: `/${slug}` },
          { name: set.title, path: `/${slug}/modules/${topicId}` },
          { name: "Problem set", path: `/${slug}/test/${topicId}` },
          { name: "Solutions", path: `/${slug}/test/${topicId}/answers` },
        ])}
      />
    <AnswerSheet
      subjectSlug={slug}
      subjectLabel={subjectLabel}
      topicId={topicId}
      set={set}
      totalMinutes={problemSetMinutes(set)}
    />
    </>
  );
}
