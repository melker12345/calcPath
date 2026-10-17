/**
 * Runs after `next build` (output: "export"): writes the files Cloudflare
 * reads next to the static site in out/.
 *
 *   out/_redirects                    permanent redirects for old URLs
 *   out/_headers                      long-lived caching for hashed/versioned assets
 *   out/report-data/redirects.json    old practice links whose target depends on
 *                                     ?section=; _redirects cannot match a query,
 *                                     so worker/index.ts resolves these
 *
 * Old chapters come from content/<subject>/legacy-topic-redirects.json (old
 * chapter → new chapter + landing section; `subject` when it moved subject) and
 * legacy-section-redirects.json (old chapter + section → new chapter, for
 * subjects whose chapters were split). Add to those when a chapter moves.
 */
import fs from "fs";
import path from "path";
import type { SectionRedirects } from "../worker/index";

type TopicRedirect = { chapterId: string; section: string; subject?: string };

const root = process.cwd();
const contentRoot = path.join(root, "content");
const out = path.join(root, "out");

function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return null;
  }
}

if (!fs.existsSync(path.join(out, "index.html"))) {
  console.error("out/index.html is missing; run `next build` first.");
  process.exit(1);
}

const fixed: Array<[string, string]> = [];
const bySection: SectionRedirects = {};

const subjects = fs
  .readdirSync(contentRoot, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

for (const subject of subjects) {
  const sections = readJson<Record<string, Record<string, string>>>(
    path.join(contentRoot, subject, "legacy-section-redirects.json"),
  );
  for (const [oldTopic, moves] of Object.entries(sections ?? {})) {
    const entry: SectionRedirects[string] = { sections: {}, fallback: null };
    bySection[`/${subject}/practice/${oldTopic}`] = entry;
    for (const [section, newTopic] of Object.entries(moves)) {
      entry.sections[section] = `/${subject}/practice/${newTopic}?section=${section}`;
    }
  }

  const topics = readJson<Record<string, TopicRedirect>>(path.join(contentRoot, subject, "legacy-topic-redirects.json"));
  for (const [oldTopic, target] of Object.entries(topics ?? {})) {
    const to = target.subject ?? subject;
    fixed.push([`/${subject}/modules/${oldTopic}`, `/${to}/modules/${target.chapterId}#${target.section}`]);
    const practice = `/${subject}/practice/${oldTopic}`;
    const dest = `/${to}/practice/${target.chapterId}?section=${target.section}`;
    // A practice link with section moves is the worker's; this is its answer
    // when the link carries no (known) section.
    if (bySection[practice]) bySection[practice].fallback = dest;
    else fixed.push([practice, dest]);
  }
}

// Exact paths first: Cloudflare counts every rule after the first one with a
// :placeholder as dynamic, and takes at most 100 dynamic rules (2000 in all).
const redirects = [
  // Legacy top-level routes from before subjects existed.
  "/modules /calculus 308",
  "/practice /calculus 308",
  ...fixed.map(([from, to]) => `${from} ${to} 308`),
  "/modules/:topicId /calculus/modules/:topicId 308",
  "/practice/:topicId /calculus/practice/:topicId 308",
  "/test/:topicId /calculus/test/:topicId 308",
  // The chapter list lives at /<subject>; there is no separate modules or
  // practice index.
  "/:subject/modules /:subject 308",
  "/:subject/practice /:subject 308",
];

const headers = `# The KaTeX stylesheet URL carries the KaTeX version (scripts/sync-katex.ts)
/katex/*
  Cache-Control: public, max-age=31536000, immutable

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable
`;

fs.writeFileSync(path.join(out, "_redirects"), redirects.join("\n") + "\n");
fs.writeFileSync(path.join(out, "_headers"), headers);
fs.mkdirSync(path.join(out, "report-data"), { recursive: true });
fs.writeFileSync(path.join(out, "report-data", "redirects.json"), JSON.stringify(bySection));

if (redirects.length > 2000) {
  console.error(`cloudflare-assets: ${redirects.length} redirects, Cloudflare reads at most 2000.`);
  process.exit(1);
}

console.log(
  `cloudflare-assets: ${redirects.length} redirects, ${Object.keys(bySection).length} section-dependent practice links`,
);
