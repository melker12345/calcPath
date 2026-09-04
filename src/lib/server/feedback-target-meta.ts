import {
  getAvailableSubjectConfigs,
  loadAllContent,
  loadSubjectFromContent,
} from "@/lib/content/loader";

/**
 * Server-side resolution of feedback targets (problem / section ids) to
 * human-readable metadata for the admin inbox. This runs in the /api/feedback
 * GET handler so the client panel never needs the content loader — rows arrive
 * already enriched (`target_meta`), which also upgrades old rows at read time.
 */
export type FeedbackTargetMeta = {
  subjectSlug: string;
  subjectLabel: string;
  topicId: string;
  topicTitle: string | null;
  /** 1-based position of the question within its topic (file order), matching the practice UI. */
  questionNumber: number | null;
  promptPreview: string | null;
};

type MetaMaps = {
  problems: Map<string, FeedbackTargetMeta>;
  topics: Map<string, FeedbackTargetMeta>; // keyed `${subjectSlug}:${topicId}`
};

// Content is static per deploy (same assumption as fileSystemBundleCache in the
// loader), so build the lookup maps once per server process.
let mapsPromise: Promise<MetaMaps> | null = null;

function compactPrompt(prompt: string): string {
  const compact = prompt.replace(/\s+/g, " ").trim();
  return compact.length <= 160 ? compact : `${compact.slice(0, 157)}...`;
}

async function buildMaps(): Promise<MetaMaps> {
  const problems = new Map<string, FeedbackTargetMeta>();
  const topics = new Map<string, FeedbackTargetMeta>();

  const addBundle = (bundle: {
    config: { slug: string; label: string };
    topics: Array<{ id: string; title: string }>;
    problems: Array<{ id: string; topicId: string; prompt: string }>;
  }) => {
    const { slug, label } = bundle.config;
    const topicTitles = new Map(bundle.topics.map((t) => [t.id, t.title]));

    for (const t of bundle.topics) {
      const key = `${slug}:${t.id}`;
      if (!topics.has(key)) {
        topics.set(key, {
          subjectSlug: slug,
          subjectLabel: label,
          topicId: t.id,
          topicTitle: t.title,
          questionNumber: null,
          promptPreview: null,
        });
      }
    }

    const perTopicCount = new Map<string, number>();
    for (const p of bundle.problems) {
      const n = (perTopicCount.get(p.topicId) ?? 0) + 1;
      perTopicCount.set(p.topicId, n);
      if (!problems.has(p.id)) {
        problems.set(p.id, {
          subjectSlug: slug,
          subjectLabel: label,
          topicId: p.topicId,
          topicTitle: topicTitles.get(p.topicId) ?? null,
          questionNumber: n,
          promptPreview: compactPrompt(p.prompt),
        });
      }
    }
  };

  // All content/-driven subjects (auto-discovered). mdx skipped — we only need
  // topics + problems here.
  const configs = await getAvailableSubjectConfigs();
  for (const config of configs) {
    try {
      addBundle(await loadSubjectFromContent(config.slug, { includeMdxModules: false }));
    } catch {
      // A malformed subject shouldn't break the whole admin inbox.
    }
  }

  // Legacy in-code bundles (currently linear-algebra). Added second so a
  // content/ version of the same subject wins.
  for (const bundle of Object.values(await loadAllContent())) {
    addBundle(bundle);
  }

  return { problems, topics };
}

export async function resolveFeedbackTargetMeta(
  targetType: string | null,
  targetId: string | null,
): Promise<FeedbackTargetMeta | null> {
  if (!targetType || !targetId) return null;
  const maps = await (mapsPromise ??= buildMaps());

  if (targetType === "problem") {
    return maps.problems.get(targetId) ?? null;
  }

  if (targetType === "section") {
    // Formats: `stats:topicId:anchor`, `linalg:topicId:anchor`, or the
    // historical unprefixed `topicId:anchor` (calculus-era).
    let parts = targetId.split(":");
    let subject: string | null = null;
    if (parts[0] === "stats") {
      subject = "statistics";
      parts = parts.slice(1);
    } else if (parts[0] === "linalg") {
      subject = "linear-algebra";
      parts = parts.slice(1);
    }
    const topicId = parts[0];
    if (!topicId) return null;

    if (subject) return maps.topics.get(`${subject}:${topicId}`) ?? null;

    const calculus = maps.topics.get(`calculus:${topicId}`);
    if (calculus) return calculus;
    for (const [key, meta] of maps.topics) {
      if (key.endsWith(`:${topicId}`)) return meta;
    }
  }

  return null;
}
