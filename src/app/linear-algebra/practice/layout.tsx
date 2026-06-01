import type { Metadata } from "next";
import { ProgressBoundary, LinalgContentProvider, type LinalgContentData } from "@/components/scoped-providers";
import { getOptionalLAContentBundle } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "Practice Linear Algebra Problems | CalcPath",
  description:
    "Interactive linear algebra problems with step-by-step solutions. Practice vectors, matrices, systems, vector spaces, and transformations.",
};

export default async function PracticeLayout({ children }: { children: React.ReactNode }) {
  // Dual system on-ramp: opt-in via env for LA to use FileSystemContentBundle (new data)
  // while keeping legacy 100% safe when flag unset / load fails.
  // Set USE_FS_CONTENT_LA=true to enable for real /linear-algebra/practice pages.
  const bundle = await getOptionalLAContentBundle();
  const linalgData: LinalgContentData | null = bundle
    ? { topics: bundle.topics, problems: bundle.problems }
    : null;

  return (
    <LinalgContentProvider data={linalgData}>
      <ProgressBoundary>{children}</ProgressBoundary>
    </LinalgContentProvider>
  );
}
