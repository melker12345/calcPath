import type { Metadata } from "next";
import { getAvailableSubjectConfigs } from "@/lib/content/loader";

/**
 * Shared SEO + data foundation for the home page ("/") and the remaining
 * landing design references (/1, /3, /4, /5). The former variant /2 won the
 * comparison and now *is* the home page, so its route is gone.
 *
 * Every page here renders identical metadata and schema.org structured data so
 * the only thing that differs between them is the visual design. The references
 * stay viewable but are noindex'd and canonicalize to "/" so they never compete
 * with the real homepage in search; only "/" itself is indexable.
 * Keep this the single source of truth; the references must not redefine SEO logic.
 */

export const SITE_URL = "https://calc-path.com";

export type LandingSubject = {
  slug: string;
  label: string;
  icon?: string;
  shortDescription: string;
  category?: string | null;
  topicCount: number;
};

export type LandingData = {
  subjects: LandingSubject[];
  subjectCount: number;
  totalChapters: number;
  primary: LandingSubject | null;
  subjectNames: string;
};

/** Loads and normalises the subject catalogue used by every landing variant. */
export async function getLandingData(): Promise<LandingData> {
  const raw = await getAvailableSubjectConfigs();
  const subjects: LandingSubject[] = [...raw]
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
    .map((s) => ({
      slug: s.slug,
      label: s.label,
      icon: s.icon,
      shortDescription: s.shortDescription,
      category: s.category,
      topicCount: s.topicCount ?? 0,
    }));

  const totalChapters = subjects.reduce((sum, s) => sum + s.topicCount, 0);
  const primary =
    subjects.find((s) => s.slug === "calculus") ?? subjects[0] ?? null;

  return {
    subjects,
    subjectCount: subjects.length,
    totalChapters,
    primary,
    subjectNames: subjects.map((s) => s.label).join(", "),
  };
}

export const LANDING_FAQ: Array<{ q: string; a: string }> = [
  {
    q: "Is CalcPath free?",
    a: "Yes. CalcPath is completely free — every chapter, worked example, practice problem and problem set is available with no subscription, no paywall and no advertising.",
  },
  {
    q: "Do I need to create an account to use CalcPath?",
    a: "No. There are no accounts. You can read every chapter and solve every practice problem without signing up; your progress is saved in your browser, and you can export it as a file to move it to another device.",
  },
  {
    q: "What level is the material aimed at?",
    a: "CalcPath covers first-year university and advanced high-school mathematics: single- and multivariable calculus, linear algebra, statistics, and precalculus foundations. It suits university students, self-learners, and anyone preparing for exams.",
  },
  {
    q: "Does CalcPath include practice problems with solutions?",
    a: "Yes. Every topic pairs concise explanations with practice problems that have full, step-by-step worked solutions, plus printable problem sets to work on paper.",
  },
  {
    q: "How is CalcPath different from other free math sites?",
    a: "CalcPath combines clear, derivation-first reference notes with an integrated practice engine and progress tracking in one place — read the theory, then immediately practise it, without switching between a textbook and a separate problem set.",
  },
];

/**
 * Consistent metadata for the landing page and its design references.
 * `path` is the route: "/" for the real landing page, "/1", "/3", "/4", "/5"
 * for the kept design references.
 *
 * Those references are near-identical copies of the homepage kept viewable for
 * design comparison. They must NOT compete with the homepage in search: every
 * one of them canonicalizes to "https://calc-path.com/" and carries robots
 * noindex,follow. Only the real landing page ("/") self-canonicalizes and is
 * indexable. Any path other than "/" is treated as a reference.
 */
export function buildLandingMetadata(opts: {
  path: string;
  title: string;
  description: string;
}): Metadata {
  const isCanonicalHome = opts.path === "/";
  // Variants point their canonical (and og:url) at the homepage.
  const canonicalUrl = `${SITE_URL}/`;
  return {
    // Absolute: landing titles carry their own branding, so the root layout's
    // "%s | CalcPath" template must not append a second "| CalcPath".
    title: { absolute: opts.title },
    description: opts.description,
    keywords: [
      "free university math courses",
      "learn calculus online free",
      "learn linear algebra online free",
      "learn statistics online free",
      "calculus practice problems with solutions",
      "linear algebra practice problems",
      "step by step math solutions",
      "university mathematics",
      "free math learning platform",
      "math exam preparation",
      "self study mathematics",
      "worked examples calculus",
    ],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: canonicalUrl,
      siteName: "CalcPath",
      images: [
        { url: "/og-image.png", width: 1200, height: 630, alt: "CalcPath — learn university math free" },
      ],
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: ["/og-image.png"],
    },
    robots: isCanonicalHome
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

/** schema.org @graph: EducationalOrganization + ItemList(Course) + FAQPage. */
export function buildLandingJsonLd(data: LandingData) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": `${SITE_URL}/#org`,
        name: "CalcPath",
        url: SITE_URL,
        description:
          "CalcPath is a free platform for learning university mathematics, combining clear reference chapters with practice problems and full step-by-step solutions.",
        sameAs: [] as string[],
      },
      {
        "@type": "ItemList",
        name: "Free university mathematics courses on CalcPath",
        itemListElement: data.subjects.map((s, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Course",
            name: s.label,
            description: s.shortDescription,
            url: `${SITE_URL}/${s.slug}`,
            provider: { "@id": `${SITE_URL}/#org` },
            educationalLevel: "University",
            isAccessibleForFree: true,
            inLanguage: "en",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              category: "Free",
            },
          },
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: LANDING_FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

/** Inlines JSON-LD. Safe: only JSON.stringify output, no user input interpolated. */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
