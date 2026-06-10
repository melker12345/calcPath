import { notFound } from "next/navigation";
import { CourseContentsPage } from "@/components/course-contents-page";
import { getFileSystemContentBundle, requireSubjectConfig } from "@/lib/content/loader";
import type { Topic } from "@/lib/shared-types";

type Props = { params: Promise<{ subject: string }> };

export default async function SubjectModulesPage({ params }: Props) {
  const { subject: slug } = await params;

  let subject;
  try {
    subject = await requireSubjectConfig(slug);
  } catch {
    notFound();
  }

  let displayTopics: Topic[] = subject.topics;
  try {
    const bundle = await getFileSystemContentBundle(slug);
    if (bundle.topics.length) displayTopics = bundle.topics;
  } catch {
    // keep index-only topics (empty)
  }

  return (
    <CourseContentsPage
      title={subject.label}
      description={subject.modulesDescription}
      subjectSlug={subject.slug}
      topics={displayTopics}
      modules={subject.modules}
    />
  );
}