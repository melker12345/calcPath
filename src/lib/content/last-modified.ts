/**
 * When each content file last changed, from git history, for sitemap
 * <lastmod> and the dateModified of a chapter's structured data.
 *
 * One `git log` over content/ at build time gives every path's latest commit
 * date. Without git (or outside a checkout) every lookup returns undefined
 * and the sitemap simply omits lastmod — a wrong date is worse than none, and
 * the previous "new Date()" on every URL told crawlers the whole site changed
 * at every deploy.
 */

import "server-only";

let cache: Map<string, string> | null = null;

function load(): Map<string, string> {
  if (cache) return cache;
  cache = new Map();
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { execFileSync } = require("child_process") as typeof import("child_process");
    const out = execFileSync("git", ["log", "--format=%x00%cI", "--name-only", "--", "content"], {
      cwd: process.cwd(),
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
    let date = "";
    for (const line of out.split("\n")) {
      if (line.startsWith("\0")) date = line.slice(1).trim();
      else if (line && !cache.has(line)) cache.set(line, date);
    }
  } catch {
    // No git: leave the map empty.
  }
  return cache;
}

/** ISO date of the last commit touching any of the paths, or undefined. */
export function lastModified(...paths: string[]): string | undefined {
  const map = load();
  let best: string | undefined;
  for (const p of paths) {
    const d = map.get(p);
    if (d && (!best || d > best)) best = d;
  }
  return best;
}

export const topicPaths = (slug: string, topicId: string) => ({
  chapter: `content/${slug}/topics/${topicId}/module.mdx`,
  practice: `content/${slug}/topics/${topicId}/questions.json`,
  problemSet: `content/${slug}/topics/${topicId}/problemset.json`,
});
