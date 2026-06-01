/**
 * Content Loader (Initial Stub)
 *
 * Long-term goal: Load all content from a data directory (JSON + MDX).
 * Short-term goal: Provide a bridge while we migrate.
 *
 * For now this is mostly a placeholder + validation harness.
 */

import { z } from "zod";
import {
  ProblemSchema,
  TopicSchema,
  ModuleContentSchema,
  SubjectBundleSchema,
  type SubjectBundle,
} from "./schema";

/**
 * Temporary adapter: takes our existing in-memory TypeScript content
 * and validates it against the new schema.
 *
 * This will be replaced once we have real data files.
 */
export function validateSubjectBundle(raw: unknown): SubjectBundle {
  return SubjectBundleSchema.parse(raw);
}

/**
 * Placeholder for the future real loader.
 * Eventually this will:
 * - Read from `content/` directory at build time
 * - Validate every subject bundle
 * - Return typed data for generic pages
 */
export async function loadAllContent(): Promise<Record<string, SubjectBundle>> {
  // TODO: Implement real loader
  throw new Error("Dynamic content loader not implemented yet");
}
