/**
 * The printable question sheet for one chapter: /[subject]/test/[topicId].
 *
 * A Server Component with no client JavaScript. Everything the page does —
 * numbering, maths, the per-question answer reveal — is HTML and CSS, because
 * the page's real destination is a sheet of A4.
 *
 * Auto-discovered: the route exists exactly when
 * content/{subject}/topics/{topicId}/problemset.json does. There is no flag to
 * set and no per-subject data file to hand-write (which is what the old
 * src/lib/test-questions.ts required, and why only calculus ever had tests).
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "katex/dist/katex.min.css";

import { ProblemSheet } from "@/components/problem-sheet";
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
    title: `${set.title} — Printable Chapter Test`,
    description: `A printable problem sheet for ${set.title}. Work it on paper; full worked solutions on a separate page.`,
    alternates: { canonical: `https://calc-path.com/${slug}/test/${topicId}` },
  };
}

export default async function ChapterTestPage({ params }: Props) {
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
    <ProblemSheet
      subjectSlug={slug}
      subjectLabel={subjectLabel}
      topicId={topicId}
      set={set}
      totalMinutes={problemSetMinutes(set)}
    />
  );
}
