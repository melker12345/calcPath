import { getFileSystemContentBundle } from "@/lib/content/loader";
import dynamic from "next/dynamic";

const DashboardContent = dynamic(() => import("./DashboardContent"), { ssr: false });

export default async function UnifiedDashboard() {
  // Load real topics/problems from the new data-driven system so the dashboard
  // shows accurate mastery stats based on the migrated content (stable IDs ensure
  // progress carries over). The client component receives the lists and still
  // uses live useProgress + getPracticeProgress for the UI.
  const [calc, stats, la] = await Promise.all([
    getFileSystemContentBundle("calculus").catch(() => ({ topics: [], problems: [] as any[] })),
    getFileSystemContentBundle("statistics").catch(() => ({ topics: [], problems: [] as any[] })),
    getFileSystemContentBundle("linear-algebra").catch(() => ({ topics: [], problems: [] as any[] })),
  ]);

  return (
    <DashboardContent
      realData={{
        calculus: { topics: calc.topics, problems: calc.problems },
        statistics: { topics: stats.topics, problems: stats.problems },
        "linear-algebra": { topics: la.topics, problems: la.problems },
      }}
    />
  );
}
