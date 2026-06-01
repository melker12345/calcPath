/**
 * Shared types for all module content (Calculus, Linear Algebra, Statistics).
 * These were previously defined inside src/lib/modules.ts
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
