import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChapterPage } from "@/components/chapter-page";
import { listChapterParams, loadChapter } from "@/lib/content/chapter";
import "katex/dist/katex.min.css";

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

  const title = `${chapter.subject.label} — ${chapter.topic.title}`;
  const description =
    chapter.topic.description ||
    `${chapter.topic.title}: definitions, theorems, worked examples and practice in ${chapter.subject.label}.`;
  const canonical = `https://calc-path.com/${slug}/modules/${topicId}`;
  return {
    // The parent [subject] layout's title template appends " | CalcPath".
    title,
    description,
    alternates: { canonical },
    // Full openGraph block: metadata shallow-merge means a partial override
    // would drop the root's images/siteName/type/locale entirely.
    openGraph: {
      title: `${title} | CalcPath`,
      description,
      url: canonical,
      siteName: "CalcPath",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "CalcPath — Learn math step by step" }],
      type: "article",
      locale: "en_US",
    },
  };
}

export default async function ChapterRoute({ params }: Props) {
  const { subject: slug, topicId } = await params;
  const chapter = await loadChapter(slug, topicId);
  if (!chapter) notFound();
  return <ChapterPage chapter={chapter} />;
}
