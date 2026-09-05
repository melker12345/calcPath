import { getAvailableSubjectConfigs } from "@/lib/content/loader";
import {
  JsonLd,
  buildLandingJsonLd,
  buildLandingMetadata,
  getLandingData,
} from "@/lib/landing/seo";
import { LandingContent } from "@/components/landing-content";
import { SiteUpdateModal } from "@/components/site-update-modal";
import { DevNotice } from "@/components/dev-notice";

// Rich landing metadata from the shared helper (path "/" => self-canonical,
// indexable; the /1../5 design variants get canonical "/" + noindex instead).
export const metadata = buildLandingMetadata({
  path: "/",
  title: "CalcPath — Free University Math: Calculus, Linear Algebra & Statistics",
  description:
    "Learn university mathematics free with CalcPath: clear derivation-first chapters, worked examples, and practice problems with full step-by-step solutions for calculus, linear algebra, statistics and more. No account required.",
});

export default async function Home() {
  // Load via auto-discovery so landing shows newly dropped subjects (from their index.json) with no subjects.ts entry.
  const subjectConfigs = await getAvailableSubjectConfigs();
  // Structured data (EducationalOrganization + Course ItemList + FAQPage),
  // shared with the /1../5 design variants. The org node reuses the same @id
  // as the root layout's Organization node so crawlers merge them.
  const landingData = await getLandingData();
  // Pass slim data (client component receives serializable props).
  const slimSubjects = subjectConfigs.map((s) => ({
    slug: s.slug,
    label: s.label,
    icon: s.icon,
    shortDescription: s.shortDescription,
    category: s.category,
    topicCount: s.topicCount,
  }));
  const topicCount = subjectConfigs.reduce((sum, s) => sum + (s.topicCount ?? 0), 0);

  return (
    <div className="relative min-h-screen">
      <JsonLd data={buildLandingJsonLd(landingData)} />

      {/* Background geometric pattern (light + dark variants) */}
      <div
        aria-hidden
        className="landing-bg-layer absolute inset-0 pointer-events-none dark:hidden"
        style={{
          backgroundColor: "#f8fafc",
          opacity: 0.45,
          backgroundImage: `
            linear-gradient(30deg, #64748b33 12%, transparent 12.5%, transparent 87%, #64748b33 87.5%, #64748b33),
            linear-gradient(150deg, #64748b33 12%, transparent 12.5%, transparent 87%, #64748b33 87.5%, #64748b33),
            linear-gradient(30deg, #64748b33 12%, transparent 12.5%, transparent 87%, #64748b33 87.5%, #64748b33),
            linear-gradient(150deg, #64748b33 12%, transparent 12.5%, transparent 87%, #64748b33 87.5%, #64748b33),
            linear-gradient(60deg, #64748b22 25%, transparent 25.5%, transparent 75%, #64748b22 75%, #64748b22),
            linear-gradient(60deg, #64748b22 25%, transparent 25.5%, transparent 75%, #64748b22 75%, #64748b22)
          `,
          backgroundSize: "100px 175px",
          backgroundPosition: "0 0, 0 0, 50px 87.5px, 50px 87.5px, 0 0, 50px 87.5px",
        }}
      />

      <div
        aria-hidden
        className="landing-bg-layer absolute inset-0 pointer-events-none hidden dark:block"
        style={{
          backgroundColor: "#0f172a",
          opacity: 0.38,
          backgroundImage: `
            linear-gradient(30deg, #64748b33 12%, transparent 12.5%, transparent 87%, #64748b33 87.5%, #64748b33),
            linear-gradient(150deg, #64748b33 12%, transparent 12.5%, transparent 87%, #64748b33 87.5%, #64748b33),
            linear-gradient(30deg, #64748b33 12%, transparent 12.5%, transparent 87%, #64748b33 87.5%, #64748b33),
            linear-gradient(150deg, #64748b33 12%, transparent 12.5%, transparent 87%, #64748b33 87.5%, #64748b33),
            linear-gradient(60deg, #64748b22 25%, transparent 25.5%, transparent 75%, #64748b22 75%, #64748b22),
            linear-gradient(60deg, #64748b22 25%, transparent 25.5%, transparent 75%, #64748b22 75%, #64748b22)
          `,
          backgroundSize: "100px 175px",
          backgroundPosition: "0 0, 0 0, 50px 87.5px, 50px 87.5px, 0 0, 50px 87.5px",
        }}
      />

      {/* One-section-at-a-time parallax stage (wheel-driven, 5 centered 500px sections).
          Content legibility scrim lives inside LandingContent so it shares the stage bounds. */}
      <LandingContent
        subjects={slimSubjects}
        subjectCount={subjectConfigs.length}
        topicCount={topicCount}
      />

      {/* One-time "do you prefer the new version?" prompt — records a vote the
          admin inbox tallies as +Yes / -No (target_type "site-version"). */}
      <SiteUpdateModal />

      {/* Dismissible bottom-left "in development" notice pointing critique to /feedback. */}
      <DevNotice />
    </div>
  );
}

