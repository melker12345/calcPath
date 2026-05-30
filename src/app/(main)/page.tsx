import type { Metadata } from "next";
import { LandingContent } from "@/components/landing-content";

export const metadata: Metadata = {
  title: "CalcPath",
  description:
    "Free reference notes for university mathematics: Calculus, Linear Algebra, and Statistics. Complete derivations, worked examples, and practice problems with solutions.",
  alternates: { canonical: "https://calc-path.com" },
};

export default function Home() {
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

      {/* One-section-at-a-time parallax stage (wheel-driven, 4 centered 500px sections) */}
      <LandingContent />
    </div>
  );
}

