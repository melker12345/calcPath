import { SubjectModulePage } from "@/components/subject-module-page";
import type { ModuleContent } from "@/lib/modules/types";
import type { Topic } from "@/lib/shared-types";
import * as statsModules from "@/lib/modules/statistics";

/**
 * PHASE 1 EVOLUTIONARY INTEGRATION — STATISTICS MODULE PAGE
 *
 * Server Component that sources topics from the new content/statistics/
 * system (via loadSubjectIndex) for correct `id`s, while keeping
 * explanations from stable legacy modules (split sources, not inert shims).
 *
 * SubjectModulePage and all its UI/chrome remain 100% untouched.
 */

export default async function StatisticsModulePage() {
  // Stable modules for explanations (from @/lib/modules/statistics split files).
  const legacyModules: ModuleContent[] = (Object.values(statsModules) as any[]).filter(
    (v): v is ModuleContent => !!v && typeof v === "object" && typeof v.topicId === "string"
  );

  // Topics from new content system via loadSubjectIndex (preferred per migration;
  // fixes empty topics from inert "@/lib/statistics-content" shim).
  let topics: Topic[] = [];
  try {
    const { loadSubjectIndex } = await import("@/lib/content/loader");
    const idx = await loadSubjectIndex("statistics");
    topics = idx.topics ?? [];
  } catch {
    // Reversible: falls back to empty (would have been broken anyway with shims).
  }

  return (
    <SubjectModulePage
      subjectSlug="statistics"
      subjectLabel="Statistics"
      modules={legacyModules}
      topics={topics}
    />
  );
}
