import type { Metadata } from "next";
import { ThemedLayout } from "@/components/themed-layout";
import { graphPaperTheme } from "@/lib/themes";

export const metadata: Metadata = {
  title: {
    default: "Calculus — Free Step-by-Step Lessons | CalcPath",
    template: "%s | CalcPath",
  },
  description:
    "Free step-by-step calculus modules, 360+ practice problems with instant feedback, tests, and flashcards. Master limits, derivatives, integrals & more.",
  openGraph: {
    title: "CalcPath — Learn Calculus Step by Step",
    description:
      "Free step-by-step modules, 360+ practice problems, tests, and flashcards. Master calculus at your own pace.",
    url: "https://calc-path.com/calculus",
  },
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
