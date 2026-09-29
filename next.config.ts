import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

type Redirect = {
  source: string;
  destination: string;
  permanent: boolean;
  has?: Array<{ type: "query"; key: string; value: string }>;
};

type TopicRedirect = { chapterId: string; section: string; subject?: string };

function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return null;
  }
}

/**
 * Where chapters that no longer exist went, as permanent redirects decided at
 * build time. Chapters and practice pages are static HTML, so the old ids must
 * be resolved here rather than by a server at request time.
 *
 * - content/<subject>/legacy-topic-redirects.json   old chapter → new chapter
 *   (+ landing section; `subject` when it moved to another subject)
 * - content/<subject>/legacy-section-redirects.json old chapter + section →
 *   new chapter, for subjects whose chapters were split; only a ?section=
 *   practice link carries the section, a #fragment never reaches the server.
 */
function legacyContentRedirects(): Redirect[] {
  const contentRoot = path.join(process.cwd(), "content");
  const out: Redirect[] = [];
  let subjects: string[] = [];
  try {
    subjects = fs
      .readdirSync(contentRoot, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return out;
  }

  for (const subject of subjects) {
    // Section moves first: a redirect with a query condition must be matched
    // before the chapter-level rule for the same path.
    const sections = readJson<Record<string, Record<string, string>>>(
      path.join(contentRoot, subject, "legacy-section-redirects.json"),
    );
    for (const [oldTopic, moves] of Object.entries(sections ?? {})) {
      for (const [section, newTopic] of Object.entries(moves)) {
        out.push({
          source: `/${subject}/practice/${oldTopic}`,
          has: [{ type: "query", key: "section", value: section }],
          destination: `/${subject}/practice/${newTopic}?section=${section}`,
          permanent: true,
        });
      }
    }

    const topics = readJson<Record<string, TopicRedirect>>(
      path.join(contentRoot, subject, "legacy-topic-redirects.json"),
    );
    for (const [oldTopic, target] of Object.entries(topics ?? {})) {
      const to = target.subject ?? subject;
      out.push({
        source: `/${subject}/modules/${oldTopic}`,
        destination: `/${to}/modules/${target.chapterId}#${target.section}`,
        permanent: true,
      });
      out.push({
        source: `/${subject}/practice/${oldTopic}`,
        destination: `/${to}/practice/${target.chapterId}?section=${target.section}`,
        permanent: true,
      });
    }
  }
  return out;
}

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  experimental: {
    optimizePackageImports: ["katex"],
  },
  async redirects() {
    return [
      // Legacy top-level routes from before subjects existed.
      { source: "/modules", destination: "/calculus", permanent: true },
      { source: "/modules/:topicId", destination: "/calculus/modules/:topicId", permanent: true },
      { source: "/practice", destination: "/calculus", permanent: true },
      { source: "/practice/:topicId", destination: "/calculus/practice/:topicId", permanent: true },
      { source: "/test/:topicId", destination: "/calculus/test/:topicId", permanent: true },

      ...legacyContentRedirects(),

      // The chapter list lives at /[subject]; there is no separate modules or
      // practice index.
      { source: "/:subject/modules", destination: "/:subject", permanent: true },
      { source: "/:subject/practice", destination: "/:subject", permanent: true },
    ];
  },
};

export default nextConfig;
