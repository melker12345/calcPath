import type { Metadata } from "next";
import { ThemedLayout } from "@/components/themed-layout";
import { blueprintTheme } from "@/lib/themes";

export const metadata: Metadata = {
  title: {
    default: "Linear Algebra — Free Step-by-Step Lessons | CalcPath",
    template: "%s | CalcPath",
  },
  description:
    "Free step-by-step linear algebra modules, practice problems with instant feedback. Master vectors, matrices, systems, vector spaces & transformations.",
  openGraph: {
    title: "CalcPath — Learn Linear Algebra Step by Step",
    description:
      "Free step-by-step modules, practice problems, and worked examples. Master linear algebra at your own pace.",
    url: "https://calc-path.com/linear-algebra",
  },
};

export default function LinearAlgebraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemedLayout theme={blueprintTheme} subjectSlug="linear-algebra">
      {children}
    </ThemedLayout>
  );
}
