/**
 * Client-safe subject types and optional code-only overrides.
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
  hasTests: boolean;
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

/**
 * Optional overrides when index.json is absent or you need a code-only tweak.
 * All 14 shipped subjects are fully defined in content index.json files — keep this empty.
 */
export const subjects: Record<SubjectSlug, SubjectConfig> = {};

export const subjectList: SubjectConfig[] = Object.values(subjects).sort(
  (a, b) => a.order - b.order
);

/** @deprecated Use `loadSubjectIndex` / `requireSubjectConfig` from the content loader on the server. */
export function getSubject(slug: SubjectSlug): SubjectConfig | undefined {
  void slug;
  return undefined;
}

export function getOrderedSubjects(): SubjectConfig[] {
  return [...subjectList];
}

export function getAvailableTopics(subject: SubjectConfig) {
  return [...(subject.topics || [])];
}