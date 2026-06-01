import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Practice Calculus Problems | CalcPath",
  description:
    "240+ interactive calculus problems with step-by-step solutions. Practice limits, derivatives, integrals, series, and differential equations.",
  openGraph: {
    title: "Practice Calculus Problems | CalcPath",
    description:
      "240+ interactive problems with instant feedback and step-by-step solutions.",
    url: "https://calc-path.com/calculus/practice",
  },
};

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  // No provider here to avoid pulling the legacy progress/shim graph into the client bundle
  // for the practice routes (the source of the recurring "topics is not defined" module evaluation error).
  // Providers are provided locally inside PracticeTopicClient (the only place that needs useProgress on this route).
  return <>{children}</>;
}

