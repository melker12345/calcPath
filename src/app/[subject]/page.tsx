import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseContentsPage } from "@/components/course-contents-page";
import { getSubject } from "@/lib/subjects";
import { getFileSystemContentBundle, deriveModuleStructureFromBundle, loadSubjectIndex } from "@/lib/content/loader";

type Props = {
  params: Promise<{ subject: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: slug } = await params;
  const subject = getSubject(slug);
  if (subject) {
    return {
      title: `Learn ${subject.label} — Free University Course | CalcPath`,
      description: subject.shortDescription,
    };
  }
  // Support auto-discovered subjects (no entry in subjects.ts): check via loader (index.json exists).
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
  let subject = getSubject(slug);
  if (!subject) {
    // Support pure discovered subjects via loader success (index.json present) even with no subjects.ts entry.
    try {
      const idx = await loadSubjectIndex(slug);
      // Build a minimal config shape for the chrome (topics etc overridden from bundle below).
      subject = {
        slug: idx.slug,
        label: idx.label,
        shortDescription: idx.shortDescription,
        modulesDescription: idx.modulesDescription,
        icon: idx.icon,
        order: idx.order,
        hasTests: idx.hasTests,
        topics: [],
        problems: [],
        modules: [],
      } as any;
    } catch {
      notFound();
    }
  }

  // Load from new content/ bundle (like the original subjects do)
  let topics = (subject as any).topics || [];
  let problems = (subject as any).problems || [];
  let modules = (subject as any).modules || [];
  try {
    const bundle = await getFileSystemContentBundle(slug);
    if (bundle?.topics?.length) topics = bundle.topics;
    if (bundle?.problems?.length) problems = bundle.problems;
    const derived = await deriveModuleStructureFromBundle(slug);
    if (derived.length) modules = derived as any;
  } catch {
    // fallback to the (empty for new) from subjects.ts or index
  }

  if (!subject) notFound();

  const label = (subject as any).label;
  const shortDesc = (subject as any).shortDescription;

  // Data-driven Course JSON-LD (structured data) for all subjects.
  // Pulled from the loaded subjectIndex (which now carries optional courseDescription etc from index.json).
  // For the original 3: rich values come from their index.json (e.g. calculus has the detailed one).
  // For new subjects: basic good default using label + shortDescription.
  // No more slug === "calculus" (or other) special cases.
  let courseJsonLd: any = null;
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
    // If no index.json at all, omit ld+json (graceful; rare once content-driven)
  }

  return (
    <>
      {courseJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }} />
      )}
      <CourseContentsPage
        title={label}
        description={shortDesc}
        subjectSlug={(subject as any).slug}
        topics={topics}
        modules={modules}
        problems={problems}
      />
    </>
  );
}
