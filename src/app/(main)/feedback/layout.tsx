import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

// Metadata lives here because page.tsx is a client component.
export const metadata: Metadata = pageMetadata({
  title: "Feedback",
  description:
    "Report a site problem or suggest an improvement. Mistakes in a chapter or question are best reported from the page itself.",
  path: "/feedback",
});

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
