import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseContentsPage } from "@/components/course-contents-page";
import {
  getAvailableSubjectConfigs,
  getFileSystemContentBundle,
  deriveModuleStructureFromBundle,
  loadSubjectIndex,
} from "@/lib/content/loader";
import type { SubjectIndex } from "@/lib/content/schema";
import { listTopicsWithProblemSets } from "@/lib/content/problemset-loader";
import { renderMathText } from "@/lib/content/render-math";
import { JsonLd, breadcrumbJsonLd, clampDescription, pageMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ subject: string }>;
};

/** Every subject page is built at deploy time; unknown slugs are 404s. */
export async function generateStaticParams() {
  const subjects = await getAvailableSubjectConfigs();
  return subjects.map((s) => ({ subject: s.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: slug } = await params;
  try {
    const idx = await loadSubjectIndex(slug);
    return pageMetadata({
      title: `Learn ${idx.label} — Free University Course`,
      description: clampDescription(
        idx.shortDescription,
        `Textbook chapters with proofs and worked examples, graded practice and printable problem sets.`,
      ),
      path: `/${slug}`,
      keywords: idx.keywords,
    });
  } catch {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }
}

export default async function SubjectHome({ params }: Props) {
  const { subject: slug } = await params;

  let idx: SubjectIndex;
  try {
    idx = await loadSubjectIndex(slug);
  } catch {
    notFound();
  }

  const [bundle, modules, problemSetTopicIds] = await Promise.all([
    getFileSystemContentBundle(slug),
    deriveModuleStructureFromBundle(slug),
    // Chapters with a printable sheet, so the contents page can link to it.
    listTopicsWithProblemSets(slug),
  ]);

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: idx.label,
    description: idx.courseDescription || idx.shortDescription || `A free course on ${idx.label}.`,
    provider: { "@type": "Organization", name: "CalcPath", url: "https://calc-path.com" },
    url: `https://calc-path.com/${slug}`,
    educationalLevel: "University",
    inLanguage: "en",
    isAccessibleForFree: true,
  };

  return (
    <>
      <JsonLd data={[courseJsonLd, breadcrumbJsonLd([{ name: idx.label, path: `/${slug}` }])]} />
      <CourseContentsPage
        title={idx.label}
        description={idx.shortDescription}
        subjectSlug={slug}
        topics={bundle.topics}
        modules={modules.map((m) => ({
          ...m,
          sections: m.sections.map((s) => ({ ...s, titleHtml: renderMathText(s.title) })),
        }))}
        // The contents page only counts questions per chapter, so only the
        // two fields it reads cross to the client.
        problems={bundle.problems.map((p) => ({ id: p.id, topicId: p.topicId }))}
        problemSetTopicIds={problemSetTopicIds}
      />
    </>
  );
}
