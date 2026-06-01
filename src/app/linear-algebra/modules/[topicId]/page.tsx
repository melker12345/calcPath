import { modules as legacyModules } from "@/lib/linalg-modules";
import * as linalgLegacy from "@/lib/linalg-content";
import { SubjectModulePage } from "@/components/subject-module-page";
import { getOptionalLAContentBundle } from "@/lib/content/loader";

/**
 * Thin server wrapper for real /linear-algebra/modules/[topicId] page.
 * Opt-in to FileSystemContentBundle topics via USE_FS_CONTENT_LA (dual system, safe).
 * modules stay legacy (structured) until MDX rendering layer added.
 */
export default async function LinearAlgebraModulePage() {
  const bundle = await getOptionalLAContentBundle();
  const topics = bundle ? bundle.topics : linalgLegacy.topics;

  return (
    <SubjectModulePage
      subjectSlug="linear-algebra"
      subjectLabel="Linear Algebra"
      modules={legacyModules}
      topics={topics}
    />
  );
}
