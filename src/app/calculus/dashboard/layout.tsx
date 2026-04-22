import { ProgressBoundary } from "@/components/scoped-providers";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ProgressBoundary>{children}</ProgressBoundary>;
}
