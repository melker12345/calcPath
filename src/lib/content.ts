// Legacy shim — all content has moved to calculus-content.ts.
// Prefer importing directly from @/lib/calculus-content.
export {
  topics,
  problems,
  learningPaths,
  getModuleSectionTitle,
  getModuleSectionUrl,
} from "./calculus-content";
export type { ProblemType, Problem, Topic, LearningPath } from "./shared-types";
