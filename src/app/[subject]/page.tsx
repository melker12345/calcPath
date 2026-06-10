import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseContentsPage } from "@/components/course-contents-page";
import {
  getFileSystemContentBundle,
  deriveModuleStructureFromBundle,
  loadSubjectIndex,
  requireSubjectConfig,
} from "@/lib/content/loader";
import type { ListedSubjectConfig } from "@/lib/content/loader";
import type { Problem, Topic } from "@/lib/shared-types";

type Props = {
  params: Promise<{ subject: string }>;
};

type ModuleStructure = ListedSubjectConfig["modules"];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: slug } = await params;
  try {
    const idx = await loadSubjectIndex(slug);
    return {
      title: `Learn ${idx.label} — Free University Course | CalcPath`,
      description: idx.shortDescription,
    };
  } catch {
    return { title: "Not Found" };
  }
}

export default async function SubjectHome({ params }: Props) {
  const { subject: slug } = await params;

  let subject: ListedSubjectConfig;
  try {
    subject = await requireSubjectConfig(slug);
  } catch {
    notFound();
  }

  let topics: Topic[] = subject.topics;
  let problems: Problem[] = subject.problems;
  let modules: ModuleStructure = subject.modules;
  try {
    const bundle = await getFileSystemContentBundle(slug);
    if (bundle?.topics?.length) topics = bundle.topics;
    if (bundle?.problems?.length) problems = bundle.problems;
    const derived = await deriveModuleStructureFromBundle(slug);
    if (derived.length) modules = derived;
  } catch {
    // graceful: keep empty lists from index-only config
  }

  let courseJsonLd: Record<string, unknown> | null = null;
  try {
    const idx = await loadSubjectIndex(slug);
    const cdesc = idx.courseDescription || idx.shortDescription || `A free course on ${idx.label}.`;
    courseJsonLd = {
      "@context": "https://schema.org",
      "@type": "Course",
      name: idx.label,
      description: cdesc,
      provider: { "@type": "Organization", name: "CalcPath", url: "https://calc-path.com" },
      url: `https://calc-path.com/${slug}`,
      educationalLevel: "University",
      inLanguage: "en",
      isAccessibleForFree: true,
    };
  } catch {
    // omit ld+json when index is unavailable
  }

  return (
    <>
      {courseJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }} />
      )}
      <CourseContentsPage
        title={subject.label}
        description={subject.shortDescription}
        subjectSlug={subject.slug}
        topics={topics}
        modules={modules}
        problems={problems}
      />
    </>
  );
}