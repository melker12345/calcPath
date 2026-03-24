"use client";

import { SubjectDashboard } from "@/components/subject-dashboard";
import { chalkboardTheme } from "@/lib/themes";
import { problems, topics } from "@/lib/statistics-content";

export default function StatisticsDashboardPage() {
  return (
    <SubjectDashboard
      subjectSlug="statistics"
      theme={chalkboardTheme}
      topics={topics}
      problems={problems}
    />
  );
}
