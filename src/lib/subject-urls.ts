/**
 * Centralized subject URL helpers.
 * Use these instead of template literals with hardcoded slugs so we can
 * change routing strategy (e.g. future sub-paths) in one place.
 */
export function getSubjectPath(slug: string): string {
  return `/${slug}`;
}

export function getModulesPath(slug: string, topicId?: string): string {
  return topicId ? `/${slug}/modules/${topicId}` : getSubjectPath(slug);
}

export function getPracticePath(slug: string, topicId?: string): string {
  return topicId ? `/${slug}/practice/${topicId}` : `/${slug}/practice`;
}

export function getTestPath(slug: string, topicId?: string): string {
  return topicId ? `/${slug}/test/${topicId}` : `/${slug}/test`;
}

export function getSectionHref(slug: string, topicId: string, section?: string): string {
  const base = getModulesPath(slug, topicId);
  return section ? `${base}#${section}` : base;
}

// Back-compat for the few places that still need the old branded strings for the main three.
export const LEGACY_SUBJECTS = ["calculus", "linear-algebra", "statistics"] as const;
