import Link from "next/link";
import type { SubjectIndex } from "@/lib/content/schema";
import type { SubjectConfig } from "@/lib/subjects"; // for compat during transition

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

/**
 * Reusable, generic breadcrumbs component for subject-level chrome and navigation.
 *
 * Designed to be driven by data from the new content system:
 * - `SubjectIndex` (preferred for data-driven from content/{slug}/index.json via loadSubjectIndex)
 * - `FileSystemContentBundle` (via its .config + topics)
 * - Or legacy SubjectConfig
 *
 * Keeps the "chrome" (top nav context) consistent and generic across subjects.
 * No hardcoded subject strings inside.
 *
 * Usage (data-driven example):
 *   const index = await loadSubjectIndex('linear-algebra');
 *   <SubjectBreadcrumbs subjectIndex={index} currentTopicTitle="Vectors..." />
 *
 * Or manual:
 *   <SubjectBreadcrumbs items={[{label:'Contents', href:'/'}, {label: 'Linear Algebra', href:'/linear-algebra'}]} />
 */
export function SubjectBreadcrumbs({
  items,
  subjectIndex,
  subjectConfig,
  subjectSlug,
  subjectLabel,
  currentTopicTitle,
  baseHref = "/",
  baseLabel = "Contents",
}: {
  /** Fully manual control (highest precedence) */
  items?: BreadcrumbItem[];
  /** Preferred: drive directly from new content SubjectIndex (topics list etc available too) */
  subjectIndex?: SubjectIndex;
  /** Legacy compat during migration */
  subjectConfig?: SubjectConfig;
  /** Fallback manual slug/label (when not passing full index/config) */
  subjectSlug?: string;
  subjectLabel?: string;
  currentTopicTitle?: string;
  baseHref?: string;
  baseLabel?: string;
}) {
  // Derive from provided data source (index > config > fallbacks)
  const derivedSlug = subjectIndex?.slug ?? subjectConfig?.slug ?? subjectSlug;
  const derivedLabel = subjectIndex?.label ?? subjectConfig?.label ?? subjectLabel;

  let crumbs: BreadcrumbItem[];

  if (items && items.length > 0) {
    crumbs = items;
  } else {
    crumbs = [
      { label: baseLabel, href: baseHref },
    ];
    if (derivedLabel && derivedSlug) {
      crumbs.push({ label: derivedLabel, href: `/${derivedSlug}` });
    } else if (derivedLabel) {
      crumbs.push({ label: derivedLabel });
    }
    if (currentTopicTitle) {
      crumbs.push({ label: currentTopicTitle });
    }
  }

  if (crumbs.length === 0) return null;

  return (
    <p className="text-sm theme-text-muted">
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <span key={idx}>
            {crumb.href && !isLast ? (
              <Link
                href={crumb.href}
                className="text-blue-700 hover:underline dark:text-[var(--accent)]"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className={isLast ? "theme-text" : ""}>{crumb.label}</span>
            )}
            {!isLast && " / "}
          </span>
        );
      })}
    </p>
  );
}

/**
 * Helper: build standard subject home breadcrumb items from index data.
 * Useful for CourseContentsPage and subject home chrome.
 */
export function getSubjectHomeBreadcrumbs(indexOrConfig: SubjectIndex | SubjectConfig): BreadcrumbItem[] {
  const slug = (indexOrConfig as any).slug;
  const label = (indexOrConfig as any).label;
  return [
    { label: "Contents", href: "/" },
    { label, href: `/${slug}` },
  ];
}

/**
 * Helper pattern: derive from FileSystemContentBundle (for when using full bundle in generic pages).
 * (Bundle.config has the SubjectConfig shape)
 */
export function getBreadcrumbsFromBundle(
  bundle: { config: { slug: string; label: string } },
  currentTopicTitle?: string
): BreadcrumbItem[] {
  const base = getSubjectHomeBreadcrumbs(bundle.config as any);
  if (currentTopicTitle) {
    return [...base, { label: currentTopicTitle }];
  }
  return base;
}
