import type { Metadata } from "next";
import { AuthBoundary } from "@/components/scoped-providers";

// Metadata lives here because page.tsx is a client component.
export const metadata: Metadata = {
  title: "Feedback",
  description:
    "Tell us what to improve — report a mistake, request a topic, or share what worked. Feedback shapes what CalcPath builds next.",
  alternates: { canonical: "https://calc-path.com/feedback" },
};

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return <AuthBoundary>{children}</AuthBoundary>;
}
