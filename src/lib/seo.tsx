import type { Metadata } from "next";

/**
 * One place for every page's search metadata and structured data.
 *
 * `pageMetadata` builds the title, description, self-canonical, Open Graph and
 * Twitter blocks together, so no page can inherit the root layout's og:url or
 * fall out of step with its own canonical (Next.js metadata is shallow-merged:
 * a page that sets `alternates` but not `openGraph` keeps the root's
 * og:url "https://calc-path.com", which is wrong for every page but "/").
 *
 * Titles are absolute: the layouts' "%s | CalcPath" templates are not applied,
 * so the suffix is added exactly once, here.
 */

export const SITE_URL = "https://calc-path.com";
export const SITE_NAME = "CalcPath";

// The ?v= busts the caches of share scrapers when the image changes; the
// source is design/og-image.svg (rsvg-convert -w 1200 -h 630).
const OG_IMAGE = { url: "/og-image.png?v=2", width: 1200, height: 630, alt: "CalcPath — free university mathematics" };

/** Search engines show about 155 characters of a description. */
const DESCRIPTION_MAX = 158;
const DESCRIPTION_MIN = 70;

/**
 * Cut a long description at a sentence or clause boundary near the limit, and
 * pad a one-line tagline with what every chapter page offers. The chapter
 * abstracts in content/<subject>/index.json run from a short tagline to a
 * whole paragraph; both read badly as a search snippet.
 */
export function clampDescription(text: string, padding?: string): string {
  let s = text.replace(/\s+/g, " ").trim();
  if (s.length < DESCRIPTION_MIN && padding) s = `${s.replace(/[.;:]?$/, ".")} ${padding}`.trim();
  if (s.length <= DESCRIPTION_MAX) return s;
  const head = s.slice(0, DESCRIPTION_MAX);
  for (const sep of [". ", "; ", ": "]) {
    const k = head.lastIndexOf(sep);
    if (k >= DESCRIPTION_MIN) return head.slice(0, k + 1).trim();
  }
  const k = head.lastIndexOf(" ");
  return (k >= DESCRIPTION_MIN ? head.slice(0, k) : head).replace(/[,;:(\s]+$/, "") + "…";
}

export type PageMetadataInput = {
  /** Title without the site suffix; " | CalcPath" is appended here. */
  title: string;
  description: string;
  /** Site-relative path, e.g. "/calculus/modules/derivatives". */
  path: string;
  /** Open Graph object type: "article" for a chapter, otherwise "website". */
  type?: "website" | "article";
  /** ISO date of the last content change; emitted as article:modified_time. */
  modifiedTime?: string;
  robots?: Metadata["robots"];
  keywords?: string[];
};

export function pageMetadata(input: PageMetadataInput): Metadata {
  const url = `${SITE_URL}${input.path === "/" ? "" : input.path}`;
  const title = `${input.title} | ${SITE_NAME}`;
  const description = input.description.replace(/\s+/g, " ").trim();
  const meta: Metadata = {
    title: { absolute: title },
    description,
    alternates: { canonical: url || `${SITE_URL}/` },
    openGraph: {
      title,
      description,
      url: url || `${SITE_URL}/`,
      siteName: SITE_NAME,
      images: [OG_IMAGE],
      locale: "en_US",
      ...(input.type === "article"
        ? { type: "article", ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}) }
        : { type: "website" }),
    },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
  };
  if (input.robots) meta.robots = input.robots;
  if (input.keywords?.length) meta.keywords = input.keywords;
  return meta;
}

// ---------------------------------------------------------------------------
// Structured data
// ---------------------------------------------------------------------------

export type Crumb = { name: string; path: string };

export const PUBLISHER = { "@type": "Organization", "@id": `${SITE_URL}/#org`, name: SITE_NAME, url: SITE_URL };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "CalcPath", path: "/" }, ...crumbs].map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path === "/" ? "/" : c.path}`,
    })),
  };
}

export type LearningResourceInput = {
  name: string;
  description: string;
  path: string;
  /** schema.org learningResourceType, e.g. "textbook chapter", "practice problems", "problem set". */
  resourceType: string;
  /** The subject this belongs to; emitted as isPartOf a Course and as `about`. */
  subject: { slug: string; label: string };
  modifiedTime?: string;
};

export function learningResourceJsonLd(r: LearningResourceInput) {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: r.name,
    description: r.description,
    url: `${SITE_URL}${r.path}`,
    learningResourceType: r.resourceType,
    educationalLevel: "University",
    inLanguage: "en",
    isAccessibleForFree: true,
    about: { "@type": "Thing", name: r.subject.label },
    isPartOf: { "@type": "Course", name: r.subject.label, url: `${SITE_URL}/${r.subject.slug}` },
    publisher: PUBLISHER,
    ...(r.modifiedTime ? { dateModified: r.modifiedTime } : {}),
  };
}

/** Inline JSON-LD; `</` is escaped so no content can close the script tag. */
export function JsonLd({ data }: { data: unknown | unknown[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/<\//g, "<\\/") }}
        />
      ))}
    </>
  );
}
