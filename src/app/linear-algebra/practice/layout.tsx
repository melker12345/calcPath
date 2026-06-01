import type { Metadata } from "next";
import { LinalgContentProvider, type LinalgContentData } from "@/components/scoped-providers";
import { getFileSystemContentBundle } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "Practice Linear Algebra Problems | CalcPath",
  description:
    "Interactive linear algebra problems with step-by-step solutions. Practice vectors, matrices, systems, vector spaces, and transformations.",
};

export default async function PracticeLayout({ children }: { children: React.ReactNode }) {
  // Dual system: try new FileSystemContentBundle for LA practice data.
  let linalgData: LinalgContentData | null = null;
  try {
    const bundle = await getFileSystemContentBundle("linear-algebra");
    if (bundle) {
      linalgData = { topics: bundle.topics, problems: bundle.problems };
    }
  } catch {
    // fallback to legacy (null)
  }

  return (
    <LinalgContentProvider data={linalgData}>
      {children}
    </LinalgContentProvider>
  );
}
