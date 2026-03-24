import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Practice Statistics Problems | CalcPath",
  description:
    "Interactive statistics problems with step-by-step solutions. Practice descriptive stats, probability, distributions, inference, and regression.",
};

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
