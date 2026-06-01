"use client";

import { useEffect, useState } from "react";
import { modules as legacyModules } from "@/lib/statistics-modules";
import { topics as legacyTopics } from "@/lib/statistics-content";
import { SubjectModulePage } from "@/components/subject-module-page";
import type { ModuleContent } from "@/lib/modules/types";
import type { Topic } from "@/lib/shared-types";

/**
 * PHASE 1 EVOLUTIONARY INTEGRATION — STATISTICS MODULE PAGE (minimal + reversible)
 *
 * Same pattern that succeeded for Calculus real route:
 * - Dynamic import of the adapter helper (no static dep on server-only loader in client bundle).
 * - Guarded try: on success, use new content/ + MDX via adapter → exact legacy shapes.
 * - Silent catch: fall back to (currently inert) shims — zero behavior change on error.
 * - SubjectModulePage + chrome untouched. Progress IDs stable by construction.
 * - Reversible: delete the 15-line useEffect block + 2 state lines + 2 final* lines → pure legacy again.
 *
 * This brings the actual production /statistics/modules/[topicId] pages live on the new data model.
 * See adapters.ts header for the full documented transition pattern.
 */

export default function StatisticsModulePage() {
  const [dynamicModules, setDynamicModules] = useState<ModuleContent[] | null>(null);
  const [dynamicTopics, setDynamicTopics] = useState<Topic[] | null>(null);

  useEffect(() => {
    // === MINIMAL, REVERSIBLE NEW-DATA-SOURCE INTEGRATION (Phase 1, Statistics) ===
    // One small block. Uses the existing adapter helper. No other files touched.
    // On success: full statistics content now flows from content/statistics/.../module.mdx + index.json
    //   through getLegacyModulesAndTopicsForSubject → identical shape → untouched SubjectModulePage.
    // On any hiccup: zero user impact (falls back to legacy shim, currently empty arrays).
    let cancelled = false;

    (async () => {
      try {
        const { getLegacyModulesAndTopicsForSubject } = await import("@/lib/content/adapters");
        const data = await getLegacyModulesAndTopicsForSubject("statistics");
        if (!cancelled && data) {
          setDynamicModules(data.modules);
          setDynamicTopics(data.topics);
        }
      } catch {
        // Silent legacy fallback is the entire point of the evolutionary pattern.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const finalModules = dynamicModules ?? legacyModules;
  const finalTopics = dynamicTopics ?? legacyTopics;

  return (
    <SubjectModulePage
      subjectSlug="statistics"
      subjectLabel="Statistics"
      modules={finalModules}
      topics={finalTopics}
    />
  );
}
