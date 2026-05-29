import { CourseContentsPage } from "@/components/course-contents-page";
import { getAvailableTopics, subjects } from "@/lib/subjects";

export default function ModulesPage() {
  const subject = subjects.calculus;

  return (
    <CourseContentsPage
      title={subject.label}
      description={subject.modulesDescription}
      subjectSlug={subject.slug}
      topics={getAvailableTopics(subject)}
    />
  );
}
