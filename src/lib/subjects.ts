/**
 * Client-safe subject types.
 *
 * Canonical metadata lives in `content/{slug}/index.json`. Server code should use
 * `getAvailableSubjectConfigs()` / `loadSubjectIndex()` from `@/lib/content/loader`.
 *
 * This file stays importable from client components (no server-only deps).
 */

import type { Problem, Topic } from "@/lib/shared-types";

export type SubjectSlug = string;

type SubjectModule = {
  topicId: string;
  sections: Array<{
    title: string;
    section?: string;
  }>;
};

/** Full subject shape used by pages that also load topics/problems from the loader. */
export type SubjectConfig = {
  slug: SubjectSlug;
  label: string;
  shortDescription: string;
  modulesDescription: string;
  icon: string;
  order: number;
  topics: Topic[];
  problems: Problem[];
  modules: SubjectModule[];
  topicCount?: number;
  category?: string;
};

/** Slim nav/card shape — safe to pass from RSC into client components. */
export type NavSubject = {
  slug: string;
  label: string;
  icon?: string;
  category?: string;
  order?: number;
  shortDescription?: string;
};
