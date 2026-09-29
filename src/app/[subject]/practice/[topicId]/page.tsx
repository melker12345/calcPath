import type { Metadata } from "next";
import { preloadKatexFonts } from "@/lib/katex-assets";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDiscoveredSubjectSlugs,
  getFileSystemContentBundle,
  loadSubjectIndex,
} from "@/lib/content/loader";
import { GenericPracticeExperience } from "@/components/generic-practice-experience";
import { hasProblemSet } from "@/lib/content/problemset-loader";
import { renderProblem } from "@/lib/content/render-practice";
import { PracticeErrorBoundary } from "@/components/practice/PracticeErrorBoundary";

interface Props {
  params: Promise<{ subject: string; topicId: string }>;
}

/**
 * Every chapter's practice page is prerendered at build time, first question
 * included. The optional `?section=` and `?focus=` query parameters are read
 * on the client after mount (inside GenericPracticeExperience), so the route
 * never touches searchParams and never bails out to client-side rendering.
 */
export const dynamicParams = false;

export async function generateStaticParams(): Promise<Array<{ subject: string; topicId: string }>> {
  const slugs = await getDiscoveredSubjectSlugs();
  const params: Array<{ subject: string; topicId: string }> = [];
  for (const subject of slugs) {
    try {
      const idx = await loadSubjectIndex(subject);
      for (const topic of idx.topics) params.push({ subject, topicId: topic.id });
    } catch {
      // A subject without a readable index has no practice pages.
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: slug, topicId } = await params;
  const canonical = `https://calc-path.com/${slug}/practice/${topicId}`;
  let subjectLabel = slug;
  let topicTitle = topicId;
  try {
    const idx = await loadSubjectIndex(slug);
    subjectLabel = idx.label;
    const topic = idx.topics.find((t) => t.id === topicId);
    if (topic) topicTitle = topic.title;
  } catch {
    // minimal fallback
  }
  const title = `${topicTitle} Practice Problems — ${subjectLabel}`;
  const description = `Free ${subjectLabel.toLowerCase()} practice problems on ${topicTitle.toLowerCase()}, with instant feedback and full step-by-step solutions.`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | CalcPath`,
      description,
      url: canonical,
      siteName: "CalcPath",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "CalcPath — Learn math step by step" }],
      type: "website",
      locale: "en_US",
    },
  };
}

export default async function PracticePage({ params }: Props) {
  preloadKatexFonts();
  const { subject: subjectSlug, topicId } = await params;

  let bundle;
  try {
    bundle = await getFileSystemContentBundle(subjectSlug);
  } catch {
    notFound();
  }

  const topic = bundle.topics.find((t) => t.id === topicId);
  if (!topic) notFound();

  const topicProblems = bundle.problems.filter((p) => p.topicId === topicId);

  if (topicProblems.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold theme-text">{topic.title}</h1>
        <p className="mt-3 text-base theme-text-secondary">
          No practice questions are available for this chapter yet.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link prefetch={false} href={`/${subjectSlug}/modules/${topicId}`} className="btn-primary">
            Read the chapter
          </Link>
          <Link prefetch={false} href={`/${subjectSlug}`} className="btn-secondary">
            All {bundle.config.label} chapters
          </Link>
        </div>
      </main>
    );
  }

  // The next chapter in subject order, for the "all solved" state.
  const orderedTopics = [...bundle.topics].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  const currentIdx = orderedTopics.findIndex((t) => t.id === topicId);
  const nextTopic = currentIdx >= 0 && currentIdx < orderedTopics.length - 1 ? orderedTopics[currentIdx + 1] : null;

  return (
    <PracticeErrorBoundary subjectSlug={subjectSlug} topicId={topicId}>
      <GenericPracticeExperience
        subjectSlug={subjectSlug}
        topic={topic}
        problems={topicProblems.map(renderProblem)}
        subjectLabel={bundle.config.label}
        nextTopic={nextTopic ? { id: nextTopic.id, title: nextTopic.title } : undefined}
        hasProblemSet={await hasProblemSet(subjectSlug, topicId)}
      />
    </PracticeErrorBoundary>
  );
}
