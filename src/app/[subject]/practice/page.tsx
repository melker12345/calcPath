import { notFound } from "next/navigation";
import { SubjectPracticePage } from "@/components/subject-practice-page";
import { getDashboardDataForSubject, requireSubjectConfig } from "@/lib/content/loader";

type Props = { params: Promise<{ subject: string }> };

export default async function PracticeIndex({ params }: Props) {
  const { subject: slug } = await params;

  let subject;
  try {
    subject = await requireSubjectConfig(slug);
  } catch {
    notFound();
  }

  const data = await getDashboardDataForSubject(slug).catch(() => ({
    topics: [] as Awaited<ReturnType<typeof getDashboardDataForSubject>>["topics"],
    problems: [] as Awaited<ReturnType<typeof getDashboardDataForSubject>>["problems"],
    modules: [],
  }));

  return (
    <SubjectPracticePage
      subjectSlug={slug}
      subjectLabel={subject.label}
      topics={data.topics}
      problems={data.problems}
    />
  );
}