"use client";

import { SubjectDashboard } from "@/components/subject-dashboard";
import { graphPaperTheme } from "@/lib/themes";
import { problems, topics } from "@/lib/calculus-content";

export default function CalculusDashboardPage() {
  return (
    <SubjectDashboard
      subjectSlug="calculus"
      theme={graphPaperTheme}
      topics={topics}
      problems={problems}
      hasTests
    />
  );
}
