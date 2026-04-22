import type { Metadata } from "next";
import { ProgressBoundary } from "@/components/scoped-providers";

export const metadata: Metadata = {
  title: "Practice Linear Algebra Problems | CalcPath",
  description:
    "Interactive linear algebra problems with step-by-step solutions. Practice vectors, matrices, systems, vector spaces, and transformations.",
};

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return <ProgressBoundary>{children}</ProgressBoundary>;
}
