import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Practice Statistics Problems | CalcPath",
  description:
    "Interactive statistics problems with step-by-step solutions. Practice descriptive stats, probability, distributions, inference, and regression.",
};

/**
 * No providers here (matching the calculus practice layout).
 * Providers are supplied locally inside PracticeClient (the only place that needs useProgress
 * on this route). This + the dynamic import on the server page prevents the progress graph
 * from participating in the initial client chunk for the route, eliminating the recurring
 * "topics is not defined" Turbopack module evaluation error.
 */
export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
