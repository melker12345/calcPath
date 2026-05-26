import { AuthBoundary } from "@/components/scoped-providers";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthBoundary>{children}</AuthBoundary>;
}
