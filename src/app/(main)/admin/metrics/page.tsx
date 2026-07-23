import type { Metadata } from "next";
import { AdminNav } from "@/components/admin-nav";
import { AdminMetricsPanel } from "@/components/admin-metrics-panel";

export const metadata: Metadata = {
  title: "Admin Metrics | CalcPath",
  description: "Usage metrics for CalcPath.",
};

export default function AdminMetricsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <AdminNav />
      <AdminMetricsPanel />
    </div>
  );
}
