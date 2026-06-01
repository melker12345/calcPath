/**
 * @deprecated Legacy compatibility shim (now inert stub).
 *
 * Historical reference only:
 *   backup-content/legacy/calculus/calculus-content.ts
 *   (and calculus-questions/ + modules/ + shared-types relatives —
 *    intentionally left non-resolvable so the archive never participates
 *    in builds)
 *
 * This shim:
 * - Exports the exact public surface (topics, problems, helpers incl.
 *   getNextSection, types) expected by remaining call sites (practice,
 *   modules, test, sitemap, feedback, layouts, local-tests, content.ts, etc.)
 * - Contains ZERO references to backup-content/ (prevents all module
 *   resolution errors and bundler pollution)
 * - Provides empty arrays + null-returning helpers (legacy UIs degrade
 *   gracefully; progress toward full migration to content/ + adapters)
 *
 * backup-content/legacy/ is now completely safe:
 *   - tsconfig already excludes it
 *   - No shim or other source imports it
 *   - Git history + raw file contents fully preserved for reference/parity
 *
 * Prefer: @/lib/content/adapters or @/lib/content/loader + shared-types.
 */
import type { Problem, ProblemType, Topic } from "@/lib/shared-types";

export type { ProblemType, Problem, Topic };

export const topics: Topic[] = [];
export const problems: Problem[] = [];

export function getModuleSectionTitle(
  topicId: string,
  section: string,
): string | null {
  return null;
}

export function getModuleSectionUrl(
  topicId: string,
  section: string,
): string | null {
  return null;
}

/** Calculus-specific: for advancing to next section in practice flow. */
export function getNextSection(
  topicId: string,
  currentSection: string,
): string | null {
  return null;
}
