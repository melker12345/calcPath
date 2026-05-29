import type { Metadata } from "next";
import { CourseContentsPage } from "@/components/course-contents-page";
import { subjects } from "@/lib/subjects";

export const metadata: Metadata = {
  title: "Learn Calculus — Free University Course | CalcPath",
  description:
    "Learn calculus step by step. Free university-level course covering limits, derivatives, integrals, sequences, series, and differential equations. Practice problems with full worked solutions.",
  alternates: { canonical: "https://calc-path.com/calculus" },
};

const courseJsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Calculus",
  description:
    "Free university calculus course covering limits, derivatives, integrals, sequences and series, multivariable calculus, and differential equations. Includes practice problems with step-by-step solutions.",
  provider: {
    "@type": "Organization",
    name: "CalcPath",
    url: "https://calc-path.com",
  },
  url: "https://calc-path.com/calculus",
  educationalLevel: "University",
  inLanguage: "en",
  isAccessibleForFree: true,
  hasCourseInstance: [
    { "@type": "CourseInstance", name: "Limits", url: "https://calc-path.com/calculus/modules/limits" },
    { "@type": "CourseInstance", name: "Derivatives", url: "https://calc-path.com/calculus/modules/derivatives" },
    { "@type": "CourseInstance", name: "Integrals", url: "https://calc-path.com/calculus/modules/integrals" },
  ],
};

export default function CalculusHome() {
  const subject = subjects.calculus;

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
