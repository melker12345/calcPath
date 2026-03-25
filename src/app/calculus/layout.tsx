import type { Metadata } from "next";
import { ThemedLayout } from "@/components/themed-layout";
import { graphPaperTheme } from "@/lib/themes";

export const metadata: Metadata = {
  title: {
    default: "Learn Calculus — Free University Course | CalcPath",
    template: "%s | CalcPath",
  },
  description:
    "Learn calculus for free. Step-by-step modules covering limits, derivatives, integrals, sequences, series, and multivariable calculus. 360+ practice problems with worked solutions.",
  keywords: [
    "learn calculus",
    "calculus course",
    "university calculus",
    "calculus I",
    "calculus II",
    "calculus III",
    "free calculus course",
    "calculus practice problems",
    "limits derivatives integrals",
    "step by step calculus",
    "calculus help",
  ],
  openGraph: {
    title: "Learn Calculus for Free — Step-by-Step | CalcPath",
    description:
      "Free university calculus course. Limits, derivatives, integrals, and more — with 360+ practice problems and full worked solutions.",
    url: "https://calc-path.com/calculus",
  },
  alternates: { canonical: "https://calc-path.com/calculus" },
};

export default function CalculusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemedLayout theme={graphPaperTheme} subjectSlug="calculus">
      {children}
    </ThemedLayout>
  );
}
