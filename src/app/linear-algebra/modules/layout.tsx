import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Linear Algebra Modules — Free Lessons & Examples | CalcPath",
  description:
    "Free step-by-step linear algebra lessons covering vectors, matrices, systems, vector spaces, and linear transformations.",
};

export default function ModulesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
