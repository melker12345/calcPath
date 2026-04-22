import { ProgressBoundary } from "@/components/scoped-providers";

export default function TestLayout({ children }: { children: React.ReactNode }) {
  return <ProgressBoundary>{children}</ProgressBoundary>;
}
