import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAvailableSubjectConfigs, getDashboardDataForSubject } from "@/lib/content/loader";
import { listTopicsWithProblemSets } from "@/lib/content/problemset-loader";
import { ProgressBoundary } from "@/components/scoped-providers";
import { SubjectProgress, type SubjectProgressTopic } from "./subject-progress";

type Props = {
  params: Promise<{ subject: string }>;
};

export async function generateStaticParams() {
  const configs = await getAvailableSubjectConfigs();
  return configs.map((s) => ({ subject: s.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: slug } = await params;
  const configs = await getAvailableSubjectConfigs();
  const subject = configs.find((s) => s.slug === slug);
  if (!subject) return { title: "Not Found", robots: { index: false, follow: false } };
  return {
    title: `${subject.label} progress`,
    description: `Chapters read, practice questions answered and problem sets done in ${subject.label}.`,
    alternates: { canonical: `https://calc-path.com/dashboard/${slug}` },
    robots: { index: false, follow: true },
  };
}

/**
 * Per-subject progress: one row per chapter with read state, practice count
 * and problem-set state, expandable to per-section counts. The server sends
 * titles, counts and the question ids of this one subject (needed for exact
 * per-section counts); never question text.
 */
export default async function SubjectProgressPage({ params }: Props) {
  const { subject: slug } = await params;
  const configs = await getAvailableSubjectConfigs();
  const subject = configs.find((s) => s.slug === slug);
  if (!subject) notFound();

  const [data, problemSetTopicIds] = await Promise.all([
    getDashboardDataForSubject(slug),
    listTopicsWithProblemSets(slug),
  ]);

  const topics: SubjectProgressTopic[] = data.topics.map((t) => ({
    ...t,
    hasProblemSet: problemSetTopicIds.includes(t.id),
  }));

  return (
    <ProgressBoundary>
      <SubjectProgress
        subject={{ slug: subject.slug, label: subject.label }}
        topics={topics}
        sectionIds={data.sectionIds}
      />
    </ProgressBoundary>
  );
}
