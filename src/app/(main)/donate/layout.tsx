import type { Metadata } from "next";
import { AuthBoundary } from "@/components/scoped-providers";

// Metadata lives here because page.tsx is a client component.
export const metadata: Metadata = {
  title: "Donate",
  description:
    "CalcPath is free and ad-free. If it helped you, an optional donation keeps the servers running and new chapters coming.",
  alternates: { canonical: "https://calc-path.com/donate" },
};

export default function DonateLayout({ children }: { children: React.ReactNode }) {
  return <AuthBoundary>{children}</AuthBoundary>;
}
