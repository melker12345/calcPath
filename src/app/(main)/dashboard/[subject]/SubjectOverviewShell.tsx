"use client";

import dynamic from "next/dynamic";
import type { NavSubject } from "@/lib/subjects";
import type { SubjectOverviewData } from "../SubjectOverviewContent";

const SubjectOverviewContent = dynamic(() => import("../SubjectOverviewContent"), { ssr: false });

export function SubjectOverviewShell({
  subject,
  realData,
  hasDiagnostic,
}: {
  subject: NavSubject;
  realData: SubjectOverviewData;
  hasDiagnostic: boolean;
}) {
  return (
    <SubjectOverviewContent
      subject={subject}
      realData={realData}
      hasDiagnostic={hasDiagnostic}
    />
  );
}