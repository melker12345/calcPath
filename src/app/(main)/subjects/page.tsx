import { getAvailableSubjectConfigs } from "@/lib/content/loader";
import { SubjectCard } from "@/components/subject-card";

export default async function SubjectsPage() {
  const subjectList = await getAvailableSubjectConfigs();
  const sorted = [...subjectList].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight theme-text">All subjects</h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed theme-text-secondary">
          Free, self-contained math courses. Read the chapters or jump
          straight into practice.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((subject) => (
          <SubjectCard
            key={subject.slug}
            subject={{
              slug: subject.slug,
              label: subject.label,
              icon: subject.icon,
              shortDescription: subject.shortDescription,
              category: subject.category,
              topicCount: subject.topicCount,
            }}
          />
        ))}
      </div>

      {sorted.length === 0 && (
        <p className="text-sm theme-text-muted">No subjects found.</p>
      )}
    </div>
  );
}
