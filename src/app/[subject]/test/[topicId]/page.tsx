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
import { preloadKatexFonts } from "@/lib/katex-assets";

import { ProblemSheet } from "@/components/problem-sheet";
import { loadSubjectIndex } from "@/lib/content/loader";
import { listAllProblemSetParams, loadProblemSet, problemSetMinutes } from "@/lib/content/problemset-loader";
import { JsonLd, breadcrumbJsonLd, clampDescription, learningResourceJsonLd, pageMetadata } from "@/lib/seo";
import { lastModified, topicPaths } from "@/lib/content/last-modified";

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
  const subjectLabel = await subjectLabelOf(slug);
  return pageMetadata({
    title: `${set.title} Problem Set — ${subjectLabel}`,
    description: sheetDescription(set.title, subjectLabel),
    path: `/${slug}/test/${topicId}`,
  });
}

const sheetDescription = (title: string, subjectLabel: string) =>
  clampDescription(
    `A printable ${subjectLabel.toLowerCase()} problem set on ${title.toLowerCase()}. Work it on paper, then check every step against the full worked solutions.`,
  );

async function subjectLabelOf(slug: string): Promise<string> {
  try {
    return (await loadSubjectIndex(slug)).label;
  } catch {
    return slug;
  }
}

export default async function ChapterTestPage({ params }: Props) {
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

  const path = `/${slug}/test/${topicId}`;
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: subjectLabel, path: `/${slug}` },
            { name: set.title, path: `/${slug}/modules/${topicId}` },
            { name: "Problem set", path },
          ]),
          learningResourceJsonLd({
            name: `${set.title} Problem Set — ${subjectLabel}`,
            description: sheetDescription(set.title, subjectLabel),
            path,
            resourceType: "problem set",
            subject: { slug, label: subjectLabel },
            modifiedTime: lastModified(topicPaths(slug, topicId).problemSet),
          }),
        ]}
      />
    <ProblemSheet
      subjectSlug={slug}
      subjectLabel={subjectLabel}
      topicId={topicId}
      set={set}
      totalMinutes={problemSetMinutes(set)}
    />
    </>
  );
}
