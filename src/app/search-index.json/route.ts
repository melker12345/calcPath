import { buildSearchIndex } from "@/lib/search-index";

/** /search-index.json — every subject, chapter and section, for the search dialog. */
export const dynamic = "force-static";

export async function GET() {
  return Response.json(await buildSearchIndex());
}
