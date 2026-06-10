import type { SubjectSlug } from "@/lib/subjects";
import { getPracticePath, getSectionHref, getSubjectPath, LEGACY_SUBJECTS } from "@/lib/subject-urls";

// Stubs: admin feedback meta now requires explicit server-side data passing to avoid
// pulling server-only loader into client bundles. For now return nulls (degraded but
// builds; was already empty from inert shims). Full restore via props from admin page
// is future small follow-up.
const allProblemMeta: any[] = [];
const problemMetaById = new Map<string, any>();
const allTopicMeta: any[] = [];
const topicMetaBySubjectAndId = new Map<string, any>();

type ProblemMeta = {
  id: string;
  prompt: string;
  topicId: string;
  topicTitle: string;
  subjectSlug: SubjectSlug;
  subjectLabel: string;
  questionNumber: number;
};

type TopicMeta = {
  id: string;
  title: string;
  subjectSlug: SubjectSlug;
  subjectLabel: string;
};

export function getProblemMeta(problemId: string | null | undefined) {
  if (!problemId) return null;
  return problemMetaById.get(problemId) ?? null;
}

export function inferSubjectFromPath(path: string | null | undefined): SubjectSlug | null {
  if (!path) return null;
  const normalized = path.replace(/^https?:\/\/[^/]+/, "");
  for (const slug of LEGACY_SUBJECTS) {
    if (normalized.startsWith(getSubjectPath(slug))) return slug;
  }
  return null;
}

export function inferTopicIdFromPath(path: string | null | undefined): string | null {
  if (!path) return null;
  const normalized = path.replace(/^https?:\/\/[^/]+/, "");
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length < 3) return null;
  if (parts[1] === "practice" || parts[1] === "modules" || parts[1] === "test") {
    return parts[2] ?? null;
  }
  return null;
}

export function getTopicMeta(topicId: string | null | undefined, subjectSlug: SubjectSlug | null | undefined) {
  if (!topicId || !subjectSlug) return null;
  return topicMetaBySubjectAndId.get(`${subjectSlug}:${topicId}`) ?? null;
}

export function getPromptPreview(prompt: string | null | undefined) {
  if (!prompt) return null;
  const compact = prompt.replace(/\s+/g, " ").trim();
  if (compact.length <= 120) return compact;
  return `${compact.slice(0, 117)}...`;
}

/**
 * Build a deep link an admin can click to land on the exact place a piece of
 * feedback was submitted from. Returns `null` when we can't resolve a target
 * (e.g. anonymous "general" feedback with no target_id), which is fine — the
 * admin panel falls back to the raw page_url in that case.
 */
export function buildTargetDeepLink(args: {
  targetType: string | null | undefined;
  targetId: string | null | undefined;
  pagePath: string | null | undefined;
}): string | null {
  const { targetType, targetId, pagePath } = args;
  if (!targetId) return null;

  if (targetType === "problem") {
    const meta = problemMetaById.get(targetId);
    if (!meta) return null;
    return `${getPracticePath(meta.subjectSlug, meta.topicId)}?focus=${encodeURIComponent(meta.id)}`;
  }

  if (targetType === "section") {
    let subject: SubjectSlug;
    let rest: string[];

    if (targetId.startsWith("stats:")) {
      subject = "statistics";
      rest = targetId.slice("stats:".length).split(":");
    } else if (targetId.startsWith("linalg:")) {
      subject = "linear-algebra";
      rest = targetId.slice("linalg:".length).split(":");
    } else {
      // Calculus uses an unprefixed `topicId:section-slug`.
      subject = inferSubjectFromPath(pagePath) ?? "calculus";
      rest = targetId.split(":");
    }

    if (rest.length < 2) return null;
    const [topicId, ...anchorParts] = rest;
    if (!topicId || anchorParts.length === 0) return null;

    return getSectionHref(subject, topicId, anchorParts.join(":"));
  }

  return null;
}
