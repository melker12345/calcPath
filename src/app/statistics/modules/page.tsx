import { CourseContentsPage } from "@/components/course-contents-page";
import { getAvailableTopics, subjects } from "@/lib/subjects";
import type { Topic } from "@/lib/shared-types";

export default async function StatisticsModulesPage() {
  const subject = subjects.statistics;

  // Minimal evolutionary sourcing for statistics modules list page:
  // Topics from new content/statistics/ system (no adapter needed for list;
  // the adapter is used where full ModuleContent shapes are required).
  // Keeps getAvailableTopics fallback + exact same UI/behavior.
  // (Currently getAvailableTopics yields [] because statisticsModules shim is inert.)
  let displayTopics: Topic[] = getAvailableTopics(subject);
  try {
    const { getFileSystemContentBundle } = await import("@/lib/content/loader");
    const bundle = await getFileSystemContentBundle("statistics");
    if (bundle.topics.length > 0) {
      displayTopics = bundle.topics;
    }
  } catch {
    // Reversible fallback to legacy via subjects shim.
  }

  return (
    <CourseContentsPage
      title={subject.label}
      description={subject.modulesDescription}
      subjectSlug={subject.slug}
      topics={displayTopics}
    />
  );
}
