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

      {/* Solid paper sheet between the geometric background pattern and the content.
          Looks like a physical sheet of paper (solid background + subtle lift shadow for depth).
          Centered the same way as the text sections.
          Sized wide and tall enough to contain the full section content (including the tall last one)
          so nothing bleeds outside the paper area. The geometric pattern shows around the paper edges. */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '1000px',
          height: '650px',
          zIndex: 0,
          backgroundColor: 'var(--bg)',
          boxShadow: '0 10px 30px -8px rgba(0, 0, 0, 0.12), 0 4px 12px -4px rgba(0, 0, 0, 0.08)',
        }}
      />

      {/* One-section-at-a-time parallax stage (wheel-driven, 4 centered 500px sections) */}
      <LandingContent subjects={slimSubjects} />
    </div>
  );
}

