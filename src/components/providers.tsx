"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/components/auth-provider";
import { ProgressProvider } from "@/components/progress-provider";
import { AchievementEmblems } from "@/components/achievement-emblems";

function EmblemsWrapper() {
  const pathname = usePathname();
  // Hide on test pages to avoid distraction
  if (pathname?.startsWith("/calculus/test/")) return null;
  return <AchievementEmblems />;
}

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <ProgressProvider>
      <EmblemsWrapper />
      {children}
    </ProgressProvider>
  </AuthProvider>
);
