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

export default function LinearAlgebraHome() {
  const subject = subjects["linear-algebra"];

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
        topics={subject.topics}
      />
    </>
  );
}
