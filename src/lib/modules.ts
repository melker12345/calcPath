// NOTE: The src/lib/modules/ tree (per-subject data files for explanations and section structure)
// has been fully retired and moved (via git mv) to backup-content/legacy/modules/, then the entire backup-content/legacy/ archive
// was deleted on 2026-06-03 after migration complete (see git history / NOTES.md for two.md details + sign-off).
// History preserved in git (this comment kept for git history reference); inspect old files with `git show <backup-commit-sha>:backup-content/legacy/modules/...`.
// The rich content now lives exclusively in content/*/topics/*/module.mdx (parsed via adapters + deriveModuleStructureFromBundle).
// This file now only re-exports the stable types (for compat/test consumers; legacy shims and test/shim consumers fully retired) and an empty modules array.
// Dev-only registerLegacyImport for this shim has been removed as part of final subject-topics + modules retirement.
// (The registration for the last static shim @/lib/subject-topics is gone with file deletion.)

/**
 * Shared types for module content shapes (Calculus, Linear Algebra, Statistics).
 * These originated from the retired src/lib/modules/ data tree (archived to backup-content/legacy/modules/ then deleted after full migration on 2026-06-03; see git history).
 * Kept here for stable import path used by adapters, pages, and tests (legacy shims fully retired).
 * Primary architecture no longer depends on these for data (use FileSystemContentBundle + derive).
 */

export type WorkedExample = {
  title: string;
  steps: string[];
};

export type ModuleSection = {
  title: string;
  /**
   * Stable slug used for progress tracking and deep links.
   * MUST match the `section` field on the corresponding questions exactly
   * (e.g. "squeeze", "lhopital", "chain", "gauss", "confidence-intervals").
   * When present, the dashboard and practice pages can show accurate per-section progress.
   */
  section?: string;
  body: string[];
  /** Optional "Explain Like I'm 5" — simpler, intuition-based explanation */
  eli5?: string[];
  /** Inline worked examples for this section (1-2 detailed examples) */
  examples?: WorkedExample[];
};

export type ModuleContent = {
  topicId: string;
  title: string;
  intro: string[];
  sections: ModuleSection[];
  examples: {
    title: string;
    steps: string[];
  }[];
  commonMistakes: string[];
};

// Empty (legacy consumers retired post full migration; kept for type/export compat only).
export const modules: ModuleContent[] = [];
