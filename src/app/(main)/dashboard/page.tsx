import { getDashboardDataForSubject, getAvailableSubjectConfigs } from "@/lib/content/loader";
import type { Problem, Topic } from "@/lib/shared-types";
import { DashboardShell } from "./DashboardShell";

type SlimModule = { topicId: string; sections: Array<{ title: string; section?: string }> };

export default async function UnifiedDashboard() {
  // Load *lightweight* real topics/problems + module (section) structure from the new data-driven system for ALL subjects.
  // Uses auto-discovery: new subjects with only content/{slug}/ (index.json + topics) appear automatically,
  // even with zero entry in subjects.ts (metadata comes from index.json or graceful fallback).
  //
  // Perf fix for "14 subjects dashboard": was doing Promise.all( getFileSystemContentBundle (full: ALL problems + ALL mdx) + derive (which *re-did* full bundle + re-parse MDX headings) for every subject ).
  // Large subjects (algebra 48t/~400q, real-analysis 42t/353q, statistics 14t/461q, geometry, ...) caused excessive fs reads + CPU.
  //
  // Now: getDashboardDataForSubject uses:
  //  - load with mdx skipped (problems+topics only; problems list still required in full for stable-ID fidelity in getPracticeProgress/getSection...)
  //  - derive (now light mdx-only + cached)
  // + top-level lifetime caches in loader for bundles + structures.
  // Full fidelity kept: same problem IDs, same section slugs, full counts+chapters even for untouched subjects (UI shows correct 0/N and all expandables).
  // Progress, per-section, aggregates unaffected (DashboardContent + progress.ts unchanged).
  const subjectList = await getAvailableSubjectConfigs();
  const loads = await Promise.all(
    subjectList.map(async (s) => {
      const data = await getDashboardDataForSubject(s.slug).catch(() => ({
        topics: [] as Topic[],
        problems: [] as Problem[],
        modules: [] as SlimModule[],
      }));
      return { slug: s.slug, ...data };
    })
  );

  const realData: Record<string, { topics: Topic[]; problems: Problem[]; modules: SlimModule[] }> = {};
  for (const { slug, topics, problems, modules } of loads) {
    realData[slug] = { topics: topics || [], problems: problems || [], modules };
  }

  return (
    <DashboardShell realData={realData} subjectConfigs={subjectList} />
  );
}
