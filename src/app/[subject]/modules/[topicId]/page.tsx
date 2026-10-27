import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChapterPage } from "@/components/chapter-page";
import { listChapterParams, loadChapter } from "@/lib/content/chapter";
import { preloadKatexFonts } from "@/lib/katex-assets";
import { JsonLd, breadcrumbJsonLd, clampDescription, learningResourceJsonLd, pageMetadata } from "@/lib/seo";
import { lastModified, topicPaths } from "@/lib/content/last-modified";
import type { Chapter } from "@/lib/content/chapter";

type Props = { params: Promise<{ subject: string; topicId: string }> };

/**
 * Every chapter is prerendered at build time from content/. A path that is
 * not a chapter is a 404, never a server render.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  return listChapterParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: slug, topicId } = await params;
  const chapter = await loadChapter(slug, topicId);
  if (!chapter) return { title: "Not Found", robots: { index: false, follow: false } };

  return pageMetadata({
    // Topic first: it is what the searcher typed.
    title: `${chapter.topic.title} — ${chapter.subject.label}`,
    description: chapterDescription(chapter),
    path: `/${slug}/modules/${topicId}`,
    type: "article",
    modifiedTime: lastModified(topicPaths(slug, topicId).chapter),
  });
}

/** The chapter abstract from index.json, cut or padded to snippet length. */
function chapterDescription(chapter: Chapter): string {
  return clampDescription(
    chapter.topic.description,
    `Definitions, theorems, proofs and worked examples in ${chapter.subject.label}, with practice problems.`,
  );
}

export default async function ChapterRoute({ params }: Props) {
  preloadKatexFonts();
  const { subject: slug, topicId } = await params;
  const chapter = await loadChapter(slug, topicId);
  if (!chapter) notFound();
  const path = `/${slug}/modules/${topicId}`;
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: chapter.subject.label, path: `/${slug}` },
            { name: chapter.topic.title, path },
          ]),
          learningResourceJsonLd({
            name: `${chapter.topic.title} — ${chapter.subject.label}`,
            description: chapterDescription(chapter),
            path,
            resourceType: "textbook chapter",
            subject: chapter.subject,
            modifiedTime: lastModified(topicPaths(slug, topicId).chapter),
          }),
        ]}
      />
      <ChapterPage chapter={chapter} />
    </>
  );
}
