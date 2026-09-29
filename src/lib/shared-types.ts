/**
 * The content types client components see. Hand-written (no Zod import) so
 * they stay importable from client code; src/lib/content/schema.ts re-exports
 * them and asserts that its validators produce exactly these shapes.
 */

export type ProblemType = "numeric" | "mcq";

export type Problem = {
  id: string;
  topicId: string;
  section: string;
  prompt: string;
  type: ProblemType;
  answer: string;
  choices?: string[];
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
};

export type Topic = {
  id: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
};

/** Slim subject shape for the nav and cards — safe to pass from RSC to client components. */
export type NavSubject = {
  slug: string;
  label: string;
  icon?: string;
  category?: string;
  order?: number;
  shortDescription?: string;
};
