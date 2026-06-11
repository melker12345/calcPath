"use client";

import dynamic from "next/dynamic";
import type { NavSubject } from "@/lib/subjects";
import type { DashboardRealData } from "./DashboardContent";

const DashboardContent = dynamic(() => import("./DashboardContent"), { ssr: false });

export type DiagnosticSubjectMeta = { slug: string; label: string; order: number };

export function DashboardShell({
  realData,
  subjectConfigs,
  diagnosticSubjects,
}: {
  realData?: DashboardRealData;
  subjectConfigs?: NavSubject[];
  diagnosticSubjects?: DiagnosticSubjectMeta[];
}) {
  return (
    <DashboardContent
      realData={realData}
      subjectConfigs={subjectConfigs}
      diagnosticSubjects={diagnosticSubjects}
    />
  );
}