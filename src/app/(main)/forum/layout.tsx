import { AuthBoundary } from "@/components/scoped-providers";

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return <AuthBoundary>{children}</AuthBoundary>;
}
