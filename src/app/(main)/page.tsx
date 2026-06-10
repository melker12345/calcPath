import type { Metadata } from "next";
import { getAvailableSubjectConfigs } from "@/lib/content/loader";
import { LandingContent } from "@/components/landing-content";

export const metadata: Metadata = {
  title: "CalcPath",
  description:
    "Free reference notes for university mathematics (calculus, linear algebra, statistics, and more). Complete derivations, worked examples, and practice problems with solutions. Just drop content/ for new subjects.",
  alternates: { canonical: "https://calc-path.com" },
};

export default async function Home() {
  // Load via auto-discovery so landing shows newly dropped subjects (from their index.json) with no subjects.ts entry.
  const subjectConfigs = await getAvailableSubjectConfigs();
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
      {/* Background geometric pattern (light + dark variants) */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none dark:hidden"
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
        className="absolute inset-0 pointer-events-none hidden dark:block"
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
    </div>
  );
}

