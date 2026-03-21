import type { Metadata } from "next";
import { ThemedLayout } from "@/components/themed-layout";
import { chalkboardTheme } from "@/lib/themes";

export const metadata: Metadata = {
  title: {
    default: "Statistics — Free Step-by-Step Lessons | CalcPath",
    template: "%s | CalcPath",
  },
  description:
    "Free step-by-step statistics modules, practice problems with instant feedback. Master descriptive stats, probability, distributions, inference & regression.",
  openGraph: {
    title: "CalcPath — Learn Statistics Step by Step",
    description:
      "Free step-by-step modules, practice problems, and worked examples. Master statistics at your own pace.",
    url: "https://calc-path.com/statistics",
  },
};

export default function StatisticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemedLayout theme={chalkboardTheme} subjectSlug="statistics">
      {children}
    </ThemedLayout>
  );
}
