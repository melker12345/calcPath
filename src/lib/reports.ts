/**
 * Report types shared by the report form, the API route and the admin inbox.
 * Client-safe: no server imports.
 *
 * A report is filed against one of three targets:
 *   question — one entry in content/<subject>/topics/<topicId>/questions.json
 *   chapter  — one section of content/<subject>/topics/<topicId>/module.mdx
 *   site     — anything else (from /feedback)
 *
 * The server enriches every question/chapter report with a `snapshot` of the
 * content as it was on disk at report time, so the report stays actionable
 * even after the content changes.
 */

export type ReportKind = "question" | "chapter" | "site";
export type ReportStatus = "open" | "fixed" | "dismissed";

export const QUESTION_REASONS = [
  "The stored answer is wrong",
  "My correct answer was rejected",
  "The explanation is wrong or unclear",
  "Typo or formatting",
  "Other",
] as const;

export const CHAPTER_REASONS = [
  "Mathematical error",
  "Unclear explanation",
  "Typo or formatting",
  "Something is missing",
  "Other",
] as const;

export const SITE_REASONS = ["Site bug", "Suggestion", "Other"] as const;

export const REASONS_BY_KIND: Record<ReportKind, readonly string[]> = {
  question: QUESTION_REASONS,
  chapter: CHAPTER_REASONS,
  site: SITE_REASONS,
};

/** Message length caps, enforced in the form and again on the server. */
export const MESSAGE_MAX: Record<ReportKind, number> = {
  question: 2000,
  chapter: 2000,
  site: 5000,
};

export type QuestionSnapshot = {
  kind: "question";
  subjectLabel: string;
  topicTitle: string;
  sectionSlug: string;
  sectionTitle: string | null;
  /** Repo-relative path of the file that holds the question. */
  file: string;
  question: {
    id: string;
    type: "numeric" | "mcq";
    difficulty: string;
    prompt: string;
    choices?: string[];
    answer: string;
    explanation: string;
  };
};

export type ChapterSnapshot = {
  kind: "chapter";
  subjectLabel: string;
  topicTitle: string;
  sectionSlug: string | null;
  sectionTitle: string | null;
  /** Repo-relative path of the chapter file. */
  file: string;
  /** Source of the reported `## …` section, capped; null when no section was given. */
  sectionSource: string | null;
  sectionSourceTruncated: boolean;
};

export type ReportSnapshot = QuestionSnapshot | ChapterSnapshot;

/** What the learner did on a practice question before reporting it. */
export type LearnerContext = {
  submissions?: Array<{ input: string; gradedCorrect: boolean; at: string }>;
  hintUsed?: boolean;
  solutionShown?: boolean;
  [key: string]: unknown;
};

/** One row of the `reports` table, as the API returns it. */
export type ReportRow = {
  id: string;
  created_at: string;
  status: ReportStatus;
  kind: ReportKind;
  subject: string | null;
  topic_id: string | null;
  section: string | null;
  question_id: string | null;
  reason: string;
  message: string | null;
  page_url: string | null;
  snapshot: ReportSnapshot | null;
  learner: LearnerContext | null;
  resolved_at: string | null;
};

/** Request body of POST /api/feedback. */
export type ReportInput = {
  kind: ReportKind;
  subject?: string;
  topicId?: string;
  section?: string;
  questionId?: string;
  reason: string;
  message?: string;
  pageUrl?: string;
  learner?: LearnerContext;
};
