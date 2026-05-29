import { SubjectPracticePage } from "@/components/subject-practice-page";
import { subjects } from "@/lib/subjects";

export default function StatisticsPracticePage() {
  const subject = subjects.statistics;

  return (
    <SubjectPracticePage
      subjectSlug={subject.slug}
      subjectLabel={subject.label}
      topics={subject.topics}
      problems={subject.problems}
    />
  );
}
