import { ProgressProvider } from "@/components/progress-provider";

/** Practice pages read and write local progress; nothing else is needed here. */
export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return <ProgressProvider>{children}</ProgressProvider>;
}
