import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDashboardDataForSubject, getAvailableSubjectConfigs } from "@/lib/content/loader";
import { hasDiagnosticFile } from "@/lib/content/diagnostic-loader";
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
    description: `Your practice progress and prerequisite readiness for ${subject.label}.`,
  };
}

export default async function SubjectOverviewPage({ params }: Props) {
  const { subject: slug } = await params;

  const [subjectConfigs, data, diagnosticAvailable] = await Promise.all([
    getAvailableSubjectConfigs(),
    getDashboardDataForSubject(slug).catch(() => null),
    hasDiagnosticFile(slug),
  ]);

  const subject = subjectConfigs.find((s) => s.slug === slug);
  if (!subject || !data) notFound();

  const realData: { topics: Topic[]; problems: Problem[]; modules: SlimModule[] } = {
    topics: data.topics ?? [],
    problems: data.problems ?? [],
    modules: data.modules ?? [],
  };

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
      hasDiagnostic={diagnosticAvailable}
    />
  );
}