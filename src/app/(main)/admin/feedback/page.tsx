import type { Metadata } from "next";
import { AdminFeedbackPanel } from "@/components/admin-feedback-panel";

export const metadata: Metadata = {
  title: "Admin Feedback | CalcPath",
  description: "Admin feedback triage inbox for CalcPath.",
};

export default function AdminFeedbackPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <AdminFeedbackPanel />
    </div>
  );
}
