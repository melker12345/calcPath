import type { Metadata } from "next";
import { ThemedLayout } from "@/components/themed-layout";
import { blueprintTheme } from "@/lib/themes";

export const metadata: Metadata = {
  title: {
    default: "Learn Linear Algebra — Free University Course | CalcPath",
    template: "%s | CalcPath",
  },
  description:
    "Learn linear algebra for free. Step-by-step modules covering vectors, matrices, systems of equations, vector spaces, eigenvalues, and more. Practice problems with worked solutions.",
  keywords: [
    "learn linear algebra",
    "linear algebra course",
    "university linear algebra",
    "free linear algebra course",
    "linear algebra practice problems",
    "matrices and vectors",
    "eigenvalues eigenvectors",
    "systems of equations",
    "step by step linear algebra",
    "linear algebra help",
    "introduction to linear algebra",
  ],
  openGraph: {
    title: "Learn Linear Algebra for Free — Step-by-Step | CalcPath",
    description:
      "Free university linear algebra course. Vectors, matrices, eigenvalues, and more — with practice problems and full worked solutions.",
    url: "https://calc-path.com/linear-algebra",
  },
  alternates: { canonical: "https://calc-path.com/linear-algebra" },
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
