import type { Metadata } from "next";
import { AdminFeedbackPanel } from "@/components/admin-feedback-panel";

export const metadata: Metadata = {
  title: "Reports | CalcPath",
  description: "Reports filed from chapters, questions and the feedback page.",
  robots: { index: false, follow: false },
};

export default function AdminFeedbackPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <AdminFeedbackPanel />
    </div>
  );
}
