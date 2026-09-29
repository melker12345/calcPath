import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

/**
 * Contents / Subject / Chapter breadcrumbs. Pass `items` for full control, or
 * the subject slug and label (and the current chapter title) to build the
 * standard trail.
 */
export function SubjectBreadcrumbs({
  items,
  subjectSlug,
  subjectLabel,
  currentTopicTitle,
  baseHref = "/",
  baseLabel = "Contents",
}: {
  items?: BreadcrumbItem[];
  subjectSlug?: string;
  subjectLabel?: string;
  currentTopicTitle?: string;
  baseHref?: string;
  baseLabel?: string;
}) {
  let crumbs: BreadcrumbItem[];
  if (items && items.length > 0) {
    crumbs = items;
  } else {
    crumbs = [{ label: baseLabel, href: baseHref }];
    if (subjectLabel && subjectSlug) crumbs.push({ label: subjectLabel, href: `/${subjectSlug}` });
    else if (subjectLabel) crumbs.push({ label: subjectLabel });
    if (currentTopicTitle) crumbs.push({ label: currentTopicTitle });
  }
  if (crumbs.length === 0) return null;

  return (
    <p className="text-sm theme-text-muted">
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <span key={idx}>
            {crumb.href && !isLast ? (
              <Link href={crumb.href} className="text-[var(--accent)] hover:underline">
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
