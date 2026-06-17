/**
 * Builds a stable append-only registry mapping practice question IDs to bitset indices.
 * Run: npx tsx scripts/build-question-registry.ts
 */
import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content");
const OUT_PATH = path.join(process.cwd(), "src/lib/question-registry.json");

type RegistryEntry = { id: string; topicId: string };

type Registry = {
  version: number;
  entries: RegistryEntry[];
};

function collectQuestionEntries(): RegistryEntry[] {
  const byId = new Map<string, RegistryEntry>();
  if (!fs.existsSync(CONTENT_DIR)) return [];

  for (const subject of fs.readdirSync(CONTENT_DIR)) {
    const topicsDir = path.join(CONTENT_DIR, subject, "topics");
    if (!fs.existsSync(topicsDir)) continue;
    for (const topic of fs.readdirSync(topicsDir)) {
      const questionsPath = path.join(topicsDir, topic, "questions.json");
      if (!fs.existsSync(questionsPath)) continue;
      try {
        const raw = JSON.parse(fs.readFileSync(questionsPath, "utf8")) as Array<{
          id?: string;
          topicId?: string;
        }>;
        for (const q of raw) {
          if (!q?.id || typeof q.id !== "string") continue;
          const topicId = typeof q.topicId === "string" ? q.topicId : topic;
          byId.set(q.id, { id: q.id, topicId });
        }
      } catch {
        console.warn(`[registry] Skipping invalid ${questionsPath}`);
      }
    }
  }

  return Array.from(byId.values()).sort((a, b) => a.id.localeCompare(b.id));
}

function loadExisting(): Registry | null {
  if (!fs.existsSync(OUT_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(OUT_PATH, "utf8")) as Registry;
  } catch {
    return null;
  }
}

function normalizeExisting(raw: Registry | { version: number; ids: string[] } | null): Registry | null {
  if (!raw) return null;
  if ("entries" in raw) return raw;
  return {
    version: raw.version,
    entries: raw.ids.map((id) => ({ id, topicId: "unknown" })),
  };
}

function buildAppendOnlyRegistry(existing: Registry | null, discovered: RegistryEntry[]): Registry {
  if (!existing) {
    return { version: 1, entries: discovered };
  }

  const known = new Set(existing.entries.map((e) => e.id));
  const appended = discovered.filter((e) => !known.has(e.id));
  if (appended.length === 0) return existing;

  return {
    version: existing.version + 1,
    entries: [...existing.entries, ...appended.sort((a, b) => a.id.localeCompare(b.id))],
  };
}

function main() {
  const discovered = collectQuestionEntries();
  const existing = normalizeExisting(loadExisting() as Registry | { version: number; ids: string[] } | null);
  const next = buildAppendOnlyRegistry(existing, discovered);

  fs.writeFileSync(OUT_PATH, `${JSON.stringify(next, null, 2)}\n`);
  console.log(
    `Question registry: ${next.entries.length} ids (v${next.version})${
      existing ? `, +${next.entries.length - existing.entries.length} new` : ""
    }`,
  );
}

main();