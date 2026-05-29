import type { Metadata } from "next";
import { CourseContentsPage } from "@/components/course-contents-page";
import { subjects } from "@/lib/subjects";

export const metadata: Metadata = {
  title: "Learn Statistics — Free University Course | CalcPath",
  description:
    "Learn statistics step by step. Free university-level course covering descriptive statistics, probability, distributions, hypothesis testing, ANOVA, regression, and non-parametric tests. Practice problems with full worked solutions.",
  alternates: { canonical: "https://calc-path.com/statistics" },
};

const courseJsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Statistics",
  description:
    "Free university statistics course covering descriptive statistics, probability, distributions, hypothesis testing, ANOVA, regression, and non-parametric tests. Includes practice problems with step-by-step solutions.",
  provider: {
    "@type": "Organization",
    name: "CalcPath",
    url: "https://calc-path.com",
  },
  url: "https://calc-path.com/statistics",
  educationalLevel: "University",
  inLanguage: "en",
  isAccessibleForFree: true,
  hasCourseInstance: [
    { "@type": "CourseInstance", name: "Descriptive Statistics", url: "https://calc-path.com/statistics/modules/descriptive" },
    { "@type": "CourseInstance", name: "Hypothesis Testing", url: "https://calc-path.com/statistics/modules/hypothesis-testing" },
    { "@type": "CourseInstance", name: "Linear Regression", url: "https://calc-path.com/statistics/modules/regression" },
  ],
};

export default function StatisticsHome() {
  const subject = subjects.statistics;

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
