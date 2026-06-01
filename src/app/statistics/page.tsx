import type { Metadata } from "next";
import { CourseContentsPage } from "@/components/course-contents-page";
import { subjects } from "@/lib/subjects";
import type { Topic, Problem } from "@/lib/shared-types";

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

  // Evolutionary integration (home): source topics + problems for statistics home
  // from the new content/ system (via getFileSystemContentBundle, no adapter needed).
  // Modules (slim section list) kept from legacy subject for now (matches dual pattern
  // used in calculus routes). Adapter used only for full ModuleContent pages.
  // Change is tiny + try/catch; fully reversible; identical (or better) output.
  let topics: Topic[] = subject.topics;
  let problems: Problem[] = subject.problems;
  try {
    const { getFileSystemContentBundle } = await import("@/lib/content/loader");
    const bundle = await getFileSystemContentBundle("statistics");
    if (bundle.topics.length > 0) {
      topics = bundle.topics;
      problems = bundle.problems;
    }
  } catch {
    // fallback to shims (subjects + statistics-content reexport)
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
