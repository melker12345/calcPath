"use client";

import dynamic from "next/dynamic";
import type { NavSubject } from "@/lib/subjects";
import type { ProblemSetLink, SubjectOverviewData } from "../SubjectOverviewContent";

const SubjectOverviewContent = dynamic(() => import("../SubjectOverviewContent"), { ssr: false });

export function SubjectOverviewShell({
  subject,
  realData,
  problemSets,
}: {
  subject: NavSubject;
  realData: SubjectOverviewData;
  problemSets: ProblemSetLink[];
}) {
  return (
    <SubjectOverviewContent
      subject={subject}
      realData={realData}
      problemSets={problemSets}
    />
  );
}