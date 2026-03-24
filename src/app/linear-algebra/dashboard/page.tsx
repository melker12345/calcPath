"use client";

import { SubjectDashboard } from "@/components/subject-dashboard";
import { blueprintTheme } from "@/lib/themes";
import { problems, topics } from "@/lib/linalg-content";

export default function LinearAlgebraDashboardPage() {
  return (
    <SubjectDashboard
      subjectSlug="linear-algebra"
      theme={blueprintTheme}
      topics={topics}
      problems={problems}
    />
  );
}
