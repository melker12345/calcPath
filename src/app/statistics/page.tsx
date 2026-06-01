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

export default async function StatisticsHome() {
  const subject = subjects.statistics;

  // === TRANSITION: source topics + problems from new FileSystemContentBundle (content/ FS data)
  // for this ported subject. Uses direct loader (now supports statistics fully).
  // Modules remain from legacy subjects (for expandable section previews) → mixed state supported.
  // getPracticeProgress (called inside CourseContentsPage) works seamlessly with either source
  // thanks to stable IDs from the content ports. Safe fallback keeps page working if loader changes.
  // This is the production home (/statistics/) — minimal, reversible, no changes to CourseContentsPage contract.
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
