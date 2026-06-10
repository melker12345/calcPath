"use server";

import { getAvailableSubjectConfigs } from "@/lib/content/loader";

/**
 * Server action to get the full list of subjects via auto-discovery from content/.
 * Supports new subjects dropped purely into content/ with no entry in subjects.ts.
 * Used by client components like the navbar dropdown for dynamic population.
 */
export async function getSubjectList() {
  const subjects = await getAvailableSubjectConfigs();
  return subjects.map((s) => ({
    slug: s.slug,
    label: s.label,
    icon: s.icon,
    category: s.category,
    shortDescription: s.shortDescription,
    order: s.order,
  }));
}
