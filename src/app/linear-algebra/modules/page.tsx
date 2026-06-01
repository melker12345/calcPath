import { CourseContentsPage } from "@/components/course-contents-page";
import { getAvailableTopics, subjects } from "@/lib/subjects";
import { getOptionalLAContentBundle } from "@/lib/content/loader";

/**
 * Thin wrapper for real /linear-algebra/modules (index). Supports optional FS bundle for LA.
 */
export default async function LinalgModulesPage() {
  const subject = subjects["linear-algebra"];
  const bundle = await getOptionalLAContentBundle();
  const displayTopics = bundle ? bundle.topics : getAvailableTopics(subject);

  return (
    <CourseContentsPage
      title={subject.label}
      description={subject.modulesDescription}
      subjectSlug={subject.slug}
      topics={displayTopics}
    />
  );
}
