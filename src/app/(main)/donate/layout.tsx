import { AuthBoundary } from "@/components/scoped-providers";

export default function DonateLayout({ children }: { children: React.ReactNode }) {
  return <AuthBoundary>{children}</AuthBoundary>;
}
