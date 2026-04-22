import { AuthBoundary } from "@/components/scoped-providers";

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return <AuthBoundary>{children}</AuthBoundary>;
}
