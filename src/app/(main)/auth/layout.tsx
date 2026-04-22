import { AuthBoundary } from "@/components/scoped-providers";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthBoundary>{children}</AuthBoundary>;
}
