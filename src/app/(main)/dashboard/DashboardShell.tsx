"use client";

import dynamic from "next/dynamic";

const DashboardContent = dynamic(() => import("./DashboardContent"), { ssr: false });

export function DashboardShell({ realData, subjectConfigs }: { realData?: any; subjectConfigs?: any }) {
  return <DashboardContent realData={realData} subjectConfigs={subjectConfigs} />;
}
