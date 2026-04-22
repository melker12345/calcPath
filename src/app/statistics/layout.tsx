import type { Metadata } from "next";
import { AuthBoundary } from "@/components/scoped-providers";
import { ThemedLayout } from "@/components/themed-layout";
import { subjectBodyFont, subjectHeadingFont } from "@/lib/subject-fonts";
import { chalkboardTheme } from "@/lib/themes";

export const metadata: Metadata = {
  title: {
    default: "Learn Statistics — Free University Course | CalcPath",
    template: "%s | CalcPath",
  },
  description:
    "Learn statistics for free. Step-by-step modules covering descriptive statistics, probability, distributions, hypothesis testing, regression, and more. Practice problems with worked solutions.",
  keywords: [
    "learn statistics",
    "statistics course",
    "university statistics",
    "free statistics course",
    "statistics practice problems",
    "probability and statistics",
    "hypothesis testing",
    "regression analysis",
    "step by step statistics",
    "statistics help",
    "introductory statistics",
  ],
  openGraph: {
    title: "Learn Statistics for Free — Step-by-Step | CalcPath",
    description:
      "Free university statistics course. Probability, distributions, hypothesis testing, regression, and more — with practice problems and full worked solutions.",
    url: "https://calc-path.com/statistics",
  },
  alternates: { canonical: "https://calc-path.com/statistics" },
};

export default function StatisticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${subjectHeadingFont.variable} ${subjectBodyFont.variable}`}>
      <AuthBoundary>
        <ThemedLayout theme={chalkboardTheme} subjectSlug="statistics">
          {children}
        </ThemedLayout>
      </AuthBoundary>
    </div>
  );
}
