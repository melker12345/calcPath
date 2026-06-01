import { SubjectModulePage } from "@/components/subject-module-page";
import { getFileSystemContentBundle } from "@/lib/content/loader";
import type { ModuleContent } from "@/lib/modules/types";
import type { Topic } from "@/lib/shared-types";
import * as linalgModules from "@/lib/modules/linear-algebra";

/**
 * Thin server wrapper for real /linear-algebra/modules/[topicId] page.
 * Opt-in to FileSystemContentBundle topics via USE_FS_CONTENT_LA (dual system, safe).
 * modules stay legacy (structured) until MDX rendering layer added.
 */
export default async function LinearAlgebraModulePage() {
  // Stable explanations sourced from the split legacy sources under
  // src/lib/modules/linear-algebra (the individual *Module exports).
  const legacyModules: ModuleContent[] = (Object.values(linalgModules) as any[]).filter(
    (v): v is ModuleContent => !!v && typeof v === "object" && typeof v.topicId === "string"
  );

  // Topics from new content system (getFileSystemContentBundle) for correct ids.
  let topics: Topic[] = [];
  try {
    const bundle = await getFileSystemContentBundle("linear-algebra");
    if (bundle?.topics?.length) {
      topics = bundle.topics;
    }
  } catch {
    // fallback (empty topics would cause "not found" anyway)
  }

  return (
    <SubjectModulePage
      subjectSlug="linear-algebra"
      subjectLabel="Linear Algebra"
      modules={legacyModules}
      topics={topics}
    />
  );
}
