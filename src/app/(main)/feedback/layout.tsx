import type { Metadata } from "next";

// Metadata lives here because page.tsx is a client component.
export const metadata: Metadata = {
  title: "Feedback",
  description:
    "Report a site problem or suggest an improvement. Mistakes in a chapter or question are best reported from the page itself.",
  alternates: { canonical: "https://calc-path.com/feedback" },
};

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
