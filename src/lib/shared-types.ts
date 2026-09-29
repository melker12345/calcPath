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

/**
 * A practice question with every piece of mathematics already typeset on the
 * server (src/lib/content/render-practice.ts), so the practice page ships no
 * KaTeX JavaScript. `html.choices[i]` corresponds to `choices[i]`. The raw
 * explanation stays on the server: the client only needs its typeset steps.
 */
/** A question without its explanation text: what the practice client is given. */
export type ProblemCore = Omit<Problem, "explanation">;

export type RenderedProblem = ProblemCore & {
  html: {
    prompt: string;
    choices?: string[];
    steps: string[];
    finalAnswer: string;
    hint: string;
  };
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
