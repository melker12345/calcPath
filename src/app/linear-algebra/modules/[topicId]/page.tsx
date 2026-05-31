"use client";

import { modules } from "@/lib/linalg-modules";
import { topics } from "@/lib/linalg-content";
import { SubjectModulePage } from "@/components/subject-module-page";

export default function LinearAlgebraModulePage() {
  return (
    <SubjectModulePage
      subjectSlug="linear-algebra"
      subjectLabel="Linear Algebra"
      modules={modules}
      topics={topics}
    />
  );
}
