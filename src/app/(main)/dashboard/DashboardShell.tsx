"use client";

import dynamic from "next/dynamic";
import type { NavSubject } from "@/lib/subjects";
import type { DashboardRealData } from "./DashboardContent";

const DashboardContent = dynamic(() => import("./DashboardContent"), { ssr: false });

export function DashboardShell({
  realData,
  subjectConfigs,
}: {
  realData?: DashboardRealData;
  subjectConfigs?: NavSubject[];
}) {
  return <DashboardContent realData={realData} subjectConfigs={subjectConfigs} />;
}