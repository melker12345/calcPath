import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculus Modules — Free Lessons & Examples | CalcPath",
  description:
    "Free step-by-step calculus lessons covering limits, derivatives, integrals, series, and more. Each module includes worked examples and practice problems.",
  openGraph: {
    title: "Free Calculus Modules | CalcPath",
    description:
      "Step-by-step lessons with worked examples. Limits, derivatives, integrals, series & more.",
    url: "https://calc-path.com/calculus/modules",
  },
};

export default function ModulesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
