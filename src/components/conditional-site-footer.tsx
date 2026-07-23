"use client";

import { usePathname } from "next/navigation";

/** Hides the site footer on the immersive home landing (full-viewport wheel experience). */
export function ConditionalSiteFooter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <>{children}</>;
}