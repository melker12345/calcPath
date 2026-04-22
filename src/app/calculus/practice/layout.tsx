import type { Metadata } from "next";
import { ProgressBoundary } from "@/components/scoped-providers";

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
  return <ProgressBoundary>{children}</ProgressBoundary>;
}
