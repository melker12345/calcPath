import { getDiscoveredSubjectSlugs, getFileSystemContentBundle } from "@/lib/content/loader";
import { buildReportData } from "@/lib/server/report-snapshot";

/**
 * /report-data/<subject>/<topicId>.json — what a report against that chapter
 * snapshots (src/lib/reports.ts ReportData). Written at build time for the
 * feedback worker, which reads it from the static assets; the worker refuses
 * these paths to the public.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

type Params = { subject: string; file: string };

export async function generateStaticParams(): Promise<Params[]> {
  const out: Params[] = [];
  for (const subject of await getDiscoveredSubjectSlugs()) {
    const bundle = await getFileSystemContentBundle(subject);
    for (const t of bundle.topics) out.push({ subject, file: `${t.id}.json` });
  }
  return out;
}

export async function GET(_request: Request, { params }: { params: Promise<Params> }) {
  const { subject, file } = await params;
  const data = await buildReportData(subject, file.replace(/\.json$/, ""));
  if (!data) return new Response("Not found", { status: 404 });
  return Response.json(data);
}
