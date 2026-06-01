import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Statistics Modules — Free Lessons & Examples | CalcPath",
  description:
    "Free step-by-step statistics lessons covering descriptive stats, probability, distributions, inference, and regression.",
};

export default function ModulesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
