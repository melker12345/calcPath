import type { Metadata } from "next";
import { CourseContentsPage } from "@/components/course-contents-page";
import { subjects } from "@/lib/subjects";

export const metadata: Metadata = {
  title: "Learn Linear Algebra — Free University Course | CalcPath",
  description:
    "Learn linear algebra step by step. Free university-level course covering systems of equations, vectors, matrices, determinants, vector spaces, eigenvalues, and SVD. Practice problems with full worked solutions.",
  alternates: { canonical: "https://calc-path.com/linear-algebra" },
};

const courseJsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Linear Algebra",
  description:
    "Free university linear algebra course covering systems of equations, vectors, matrices, determinants, vector spaces, orthogonality, eigenvalues, and symmetric matrices. Includes practice problems with step-by-step solutions.",
  provider: {
    "@type": "Organization",
    name: "CalcPath",
    url: "https://calc-path.com",
  },
  url: "https://calc-path.com/linear-algebra",
  educationalLevel: "University",
  inLanguage: "en",
  isAccessibleForFree: true,
  hasCourseInstance: [
    { "@type": "CourseInstance", name: "Systems of Linear Equations", url: "https://calc-path.com/linear-algebra/modules/systems" },
    { "@type": "CourseInstance", name: "Eigenvalues and Eigenvectors", url: "https://calc-path.com/linear-algebra/modules/eigenvalues" },
    { "@type": "CourseInstance", name: "Vector Spaces", url: "https://calc-path.com/linear-algebra/modules/spaces" },
  ],
};

export default async function LinearAlgebraHome() {
  const subject = subjects["linear-algebra"];

  // === TRANSITION: source topics + problems from new FileSystemContentBundle (content/ FS data)
  // for this ported subject (standardized pattern across all three homes). Uses direct loader.
  // Modules remain from legacy subjects (for expandable section previews) → mixed state supported.
  // getPracticeProgress (called inside CourseContentsPage) works seamlessly with either source
  // thanks to stable IDs from the content ports. Safe fallback keeps page working if loader changes.
  // This is the production home (/linear-algebra/) — minimal, reversible, no changes to CourseContentsPage contract.
  let topics = subject.topics;
  let problems = subject.problems;
  try {
    const { getFileSystemContentBundle } = await import("@/lib/content/loader");
    const bundle = await getFileSystemContentBundle(subject.slug);
    if (bundle?.topics?.length) topics = bundle.topics;
    if (bundle?.problems?.length) problems = bundle.problems;
  } catch {
    // Silent legacy fallback (mixed/transition safety)
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <CourseContentsPage
        title={subject.label}
        description={subject.shortDescription}
        subjectSlug={subject.slug}
        topics={topics}
        modules={subject.modules}
        problems={problems}
      />
    </>
  );
}
