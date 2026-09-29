import type { Metadata } from "next";
import { getAvailableSubjectConfigs, getDashboardDataForSubject } from "@/lib/content/loader";
import { listTopicsWithProblemSets } from "@/lib/content/problemset-loader";
import { DashboardOverview, type OverviewSubject } from "./dashboard-overview";

// Personal page: nothing here is worth indexing, and crawlers see empty counts.
export const metadata: Metadata = {
  title: "Progress",
  description: "Chapters read, practice questions answered correctly and problem sets done, for every subject.",
  alternates: { canonical: "https://calc-path.com/dashboard" },
  robots: { index: false, follow: true },
};

/**
 * The progress overview. The server sends titles and counts only — per
 * subject, a list of {chapter id, question total} and the ids of chapters
 * that have a printable sheet. The counts of what the learner has done come
 * from the progress stored in their browser.
 */
export default async function DashboardPage() {
  const configs = await getAvailableSubjectConfigs();
  const sorted = [...configs].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  const subjects: OverviewSubject[] = await Promise.all(
    sorted.map(async (s) => {
      const [data, problemSetTopicIds] = await Promise.all([
        getDashboardDataForSubject(s.slug).catch(() => ({ topics: [], sectionIds: {} })),
        listTopicsWithProblemSets(s.slug),
      ]);
      return {
        slug: s.slug,
        label: s.label,
        topics: data.topics.map((t) => ({ id: t.id, questionTotal: t.questionTotal })),
        problemSetTopicIds,
      };
    }),
  );

  return <DashboardOverview subjects={subjects} />;
}
