import { AuthProvider } from "@/components/auth-provider";
import { ProgressProvider } from "@/components/progress-provider";

/**
 * Layout for all /x/[subject]/practice/* routes in the dynamic content area.
 *
 * Provides the contexts that the shared GenericPracticeExperience depends on
 * (Auth for user progress scoping + Progress for attempts/completion).
 *
 * This lets the fully data-driven /x/ practice pages actually work without
 * the "useProgress must be used within ProgressProvider" crash.
 */
export default function XPracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProgressProvider>{children}</ProgressProvider>
    </AuthProvider>
  );
}

