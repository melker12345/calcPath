import type { Metadata } from "next";
import { preloadKatexFonts } from "@/lib/katex-assets";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deriveModuleStructureFromBundle,
  getDiscoveredSubjectSlugs,
  getFileSystemContentBundle,
  loadSubjectIndex,
} from "@/lib/content/loader";
import { renderMathText } from "@/lib/content/render-math";
import { GenericPracticeExperience } from "@/components/generic-practice-experience";
import { hasProblemSet } from "@/lib/content/problemset-loader";
import { renderProblem } from "@/lib/content/render-practice";
import { PracticeErrorBoundary } from "@/components/practice/PracticeErrorBoundary";
import { JsonLd, breadcrumbJsonLd, learningResourceJsonLd, pageMetadata } from "@/lib/seo";
import { lastModified, topicPaths } from "@/lib/content/last-modified";

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
  return pageMetadata({
    title: `${topicTitle} Practice Problems — ${subjectLabel}`,
    description: practiceDescription(subjectLabel, topicTitle),
    path: `/${slug}/practice/${topicId}`,
  });
}

const practiceDescription = (subjectLabel: string, topicTitle: string) =>
  `Free ${subjectLabel.toLowerCase()} practice problems on ${topicTitle.toLowerCase()}, graded instantly, each with a hint and a full step-by-step solution.`;

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
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
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
      </div>
    );
  }

  // The next chapter in subject order, for the "all solved" state.
  const orderedTopics = [...bundle.topics].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  const currentIdx = orderedTopics.findIndex((t) => t.id === topicId);
  const nextTopic = currentIdx >= 0 && currentIdx < orderedTopics.length - 1 ? orderedTopics[currentIdx + 1] : null;

  const path = `/${subjectSlug}/practice/${topicId}`;
  const hasSheet = await hasProblemSet(subjectSlug, topicId);
  return (
    <>
    <PracticeErrorBoundary subjectSlug={subjectSlug} topicId={topicId}>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: bundle.config.label, path: `/${subjectSlug}` },
            { name: topic.title, path: `/${subjectSlug}/modules/${topicId}` },
            { name: "Practice", path },
          ]),
          learningResourceJsonLd({
            name: `${topic.title} Practice Problems — ${bundle.config.label}`,
            description: practiceDescription(bundle.config.label, topic.title),
            path,
            resourceType: "practice problems",
            subject: { slug: subjectSlug, label: bundle.config.label },
            modifiedTime: lastModified(topicPaths(subjectSlug, topicId).practice),
          }),
        ]}
      />
      <GenericPracticeExperience
        subjectSlug={subjectSlug}
        topic={topic}
        problems={topicProblems.map(renderProblem)}
        subjectLabel={bundle.config.label}
        nextTopic={nextTopic ? { id: nextTopic.id, title: nextTopic.title } : undefined}
        hasProblemSet={hasSheet}
      />
    </PracticeErrorBoundary>
    <PracticeSummary
      subjectSlug={subjectSlug}
      subjectLabel={bundle.config.label}
      topic={topic}
      problems={topicProblems}
      sections={(await deriveModuleStructureFromBundle(subjectSlug)).find((m) => m.topicId === topicId)?.sections ?? []}
      hasProblemSet={hasSheet}
    />
    </>
  );
}

/**
 * What this practice set contains, rendered on the server so that the page
 * says something to a reader (and a crawler) before any question is answered:
 * the count per section in chapter order, the difficulty split, and where
 * the chapter and the printable sheet are. The interactive part above knows
 * all this only after hydration.
 */
function PracticeSummary({
  subjectSlug,
  subjectLabel,
  topic,
  problems,
  sections,
  hasProblemSet,
}: {
  subjectSlug: string;
  subjectLabel: string;
  topic: { id: string; title: string; description: string };
  problems: Array<{ section: string; difficulty: string }>;
  sections: Array<{ title: string; section?: string }>;
  hasProblemSet: boolean;
}) {
  const bySection = new Map<string, number>();
  for (const p of problems) bySection.set(p.section, (bySection.get(p.section) ?? 0) + 1);
  const rows = sections
    .filter((s) => s.section && bySection.has(s.section))
    .map((s) => ({ slug: s.section!, title: s.title, count: bySection.get(s.section!)! }));
  const count = (d: string) => problems.filter((p) => p.difficulty === d).length;
  return (
    <section aria-labelledby="practice-summary" className="mx-auto max-w-3xl px-4 pb-12 pt-6 sm:px-6">
      <h2 id="practice-summary" className="text-lg font-semibold theme-text">
        About these {problems.length} questions
      </h2>
      <p className="mt-2 text-sm theme-text-secondary sm:text-base">
        {topic.description} This set covers the chapter{" "}
        <Link prefetch={false} href={`/${subjectSlug}/modules/${topic.id}`} className="underline underline-offset-2">
          {topic.title}
        </Link>{" "}
        in {subjectLabel}: {count("easy")} easy, {count("medium")} medium and {count("hard")} hard questions, each graded
        instantly with a hint and a full step-by-step solution. Progress is saved in this browser only.
      </p>
      {rows.length > 0 && (
        <ul className="mt-3 text-sm theme-text-secondary sm:text-base">
          {rows.map((r) => (
            <li key={r.slug}>
              <Link
                prefetch={false}
                href={`/${subjectSlug}/modules/${topic.id}#${r.slug}`}
                className="underline underline-offset-2"
                dangerouslySetInnerHTML={{ __html: renderMathText(r.title) }}
              />{" "}
              — {r.count} {r.count === 1 ? "question" : "questions"}
            </li>
          ))}
        </ul>
      )}
      {hasProblemSet && (
        <p className="mt-3 text-sm theme-text-secondary sm:text-base">
          For work on paper there is a{" "}
          <Link prefetch={false} href={`/${subjectSlug}/test/${topic.id}`} className="underline underline-offset-2">
            printable problem set
          </Link>{" "}
          with separate worked solutions.
        </p>
      )}
    </section>
  );
}
