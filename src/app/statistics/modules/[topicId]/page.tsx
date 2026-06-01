"use client";

import { modules } from "@/lib/statistics-modules";
import { topics } from "@/lib/statistics-content";
import { SubjectModulePage } from "@/components/subject-module-page";

export default function StatisticsModulePage() {
  return (
    <SubjectModulePage
      subjectSlug="statistics"
      subjectLabel="Statistics"
      modules={modules}
      topics={topics}
    />
  );
}
