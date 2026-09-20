import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDashboardDataForSubject, getAvailableSubjectConfigs } from "@/lib/content/loader";
import { listTopicsWithProblemSets } from "@/lib/content/problemset-loader";
import type { Problem, Topic } from "@/lib/shared-types";
import { SubjectOverviewShell } from "./SubjectOverviewShell";

type SlimModule = { topicId: string; sections: Array<{ title: string; section?: string }> };

type Props = {
  params: Promise<{ subject: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: slug } = await params;
  const configs = await getAvailableSubjectConfigs();
  const subject = configs.find((s) => s.slug === slug);
  if (!subject) return { title: "Not Found" };
  return {
    title: `${subject.label} Progress — Dashboard | CalcPath`,
    description: `Your practice progress and printable problem sets for ${subject.label}.`,
  };
}

export default async function SubjectOverviewPage({ params }: Props) {
  const { subject: slug } = await params;

  const [subjectConfigs, data, problemSetTopicIds] = await Promise.all([
    getAvailableSubjectConfigs(),
    getDashboardDataForSubject(slug).catch(() => null),
    listTopicsWithProblemSets(slug),
  ]);

  const subject = subjectConfigs.find((s) => s.slug === slug);
  if (!subject || !data) notFound();

  const realData: { topics: Topic[]; problems: Problem[]; modules: SlimModule[] } = {
    topics: data.topics ?? [],
    problems: data.problems ?? [],
    modules: data.modules ?? [],
  };

  // Printable sheets for this subject, in chapter order, with the chapter title
  // for the panel. Resolved here because problemset-loader is server-only.
  const titleById = new Map(realData.topics.map((t) => [t.id, t.title]));
  const problemSets = problemSetTopicIds
    .map((topicId) => ({ topicId, title: titleById.get(topicId) ?? topicId }))
    .sort((a, b) => {
      const ia = realData.topics.findIndex((t) => t.id === a.topicId);
      const ib = realData.topics.findIndex((t) => t.id === b.topicId);
      return (ia === -1 ? Infinity : ia) - (ib === -1 ? Infinity : ib);
    });

  return (
    <SubjectOverviewShell
      subject={{
        slug: subject.slug,
        label: subject.label,
        icon: subject.icon,
        category: subject.category,
        order: subject.order,
      }}
      realData={realData}
      problemSets={problemSets}
    />
  );
}