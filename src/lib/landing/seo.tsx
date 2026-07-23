import type { Metadata } from "next";
import { getAvailableSubjectConfigs } from "@/lib/content/loader";

/**
 * Shared SEO + data foundation for the landing-page design variants (/1../5).
 *
 * Every variant renders identical metadata and schema.org structured data so the
 * only thing that differs between them is the visual design — a clean A/B test.
 * Keep this the single source of truth; variants must not redefine SEO logic.
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
    a: "Yes. CalcPath is completely free — every chapter, worked example, and practice problem is available with no subscription, no paywall, and no trial. It is funded by optional donations, not ads.",
  },
  {
    q: "Do I need to create an account to use CalcPath?",
    a: "No. You can read every lesson and solve every practice problem without signing up. Your progress is saved on your device automatically, and creating an account is only needed if you want to sync progress across devices.",
  },
  {
    q: "What level is the material aimed at?",
    a: "CalcPath covers first-year university and advanced high-school mathematics: single- and multivariable calculus, linear algebra, statistics, and precalculus foundations. It suits university students, self-learners, and anyone preparing for exams.",
  },
  {
    q: "Does CalcPath include practice problems with solutions?",
    a: "Yes. Every topic pairs concise explanations with practice problems that have full, step-by-step worked solutions, plus topic tests and a diagnostic to find your gaps.",
  },
  {
    q: "How is CalcPath different from other free math sites?",
    a: "CalcPath combines clear, derivation-first reference notes with an integrated practice engine and progress tracking in one place — read the theory, then immediately practise it, without switching between a textbook and a separate problem set.",
  },
];

/** Consistent metadata for a variant. `path` is the route, e.g. "/2". */
export function buildLandingMetadata(opts: {
  path: string;
  title: string;
  description: string;
}): Metadata {
  const url = `${SITE_URL}${opts.path}`;
  return {
    title: opts.title,
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
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
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
    robots: { index: true, follow: true },
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
