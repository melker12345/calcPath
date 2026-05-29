"use client";

import { SubjectDashboard } from "@/components/subject-dashboard";
import { subjects } from "@/lib/subjects";

export default function LinearAlgebraDashboardPage() {
  const subject = subjects["linear-algebra"];

  return (
    <SubjectDashboard
      subjectSlug={subject.slug}
      topics={subject.topics}
      problems={subject.problems}
      hasTests={subject.hasTests}
    />
  );
}
