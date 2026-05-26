export type FeedbackStatus = "open" | "fixed" | "trash";
export type FeedbackKind = "bug" | "feature" | "general" | "vote";
export type TargetGroup = "all" | "questions" | "explanations" | "other";
export type Priority = "all" | "priority" | "low";

export type FeedbackRow = {
  id: string;
  kind: FeedbackKind | string;
  message: string | null;
  vote: number | null;
  target_type: string | null;
  target_id: string | null;
  page_url: string | null;
  user_id: string | null;
  user_email?: string | null;
  status?: FeedbackStatus | null;
  created_at: string;
};

export type FeedbackTargetSummary = {
  subjectLabel: string | null;
  topicTitle: string | null;
  questionNumber: number | null;
  internalId: string | null;
  promptPreview: string | null;
  routePath: string | null;
  deepLink: string | null;
};

export type FeedbackWithSummary = {
  fb: FeedbackRow;
  summary: FeedbackTargetSummary;
};

export type FeedbackListItem =
  | {
      type: "row";
      id: string;
      createdAt: string;
      fb: FeedbackRow;
      summary: FeedbackTargetSummary;
    }
  | {
      type: "vote-group";
      id: string;
      createdAt: string;
      rows: FeedbackRow[];
      representative: FeedbackRow;
      summary: FeedbackTargetSummary;
      netVote: number;
      upVotes: number;
      downVotes: number;
      neutralVotes: number;
      noteRows: FeedbackRow[];
    };

export function targetGroupOf(targetType: string | null): TargetGroup {
  if (targetType === "problem") return "questions";
  if (targetType === "section") return "explanations";
  return "other";
}

export function statusOfRow(fb: FeedbackRow): FeedbackStatus {
  return fb.status ?? "open";
}

function voteGroupKey(fb: FeedbackRow, summary: FeedbackTargetSummary) {
  const status = statusOfRow(fb);
  if (fb.target_type && fb.target_id) return `${fb.target_type}:${fb.target_id}:${status}`;
  return `fallback:${summary.routePath ?? "unknown"}:${fb.id}:${status}`;
}

export function buildFeedbackListItems(items: FeedbackWithSummary[]): FeedbackListItem[] {
  const output: FeedbackListItem[] = [];
  const voteGroups = new Map<string, FeedbackWithSummary[]>();

  for (const item of items) {
    if (item.fb.kind !== "vote") {
      output.push({
        type: "row",
        id: item.fb.id,
        createdAt: item.fb.created_at,
        fb: item.fb,
        summary: item.summary,
      });
      continue;
    }

    const key = voteGroupKey(item.fb, item.summary);
    voteGroups.set(key, [...(voteGroups.get(key) ?? []), item]);
  }

  for (const [key, groupedItems] of voteGroups) {
    const sorted = [...groupedItems].sort(
      (a, b) => new Date(b.fb.created_at).getTime() - new Date(a.fb.created_at).getTime(),
    );
    const rows = sorted.map((item) => item.fb);
    const representativeItem = sorted[0];

    output.push({
      type: "vote-group",
      id: `vote-group:${key}`,
      createdAt: representativeItem.fb.created_at,
      rows,
      representative: representativeItem.fb,
      summary: representativeItem.summary,
      netVote: rows.reduce((sum, row) => sum + (row.vote ?? 0), 0),
      upVotes: rows.filter((row) => row.vote === 1).length,
      downVotes: rows.filter((row) => row.vote === -1).length,
      neutralVotes: rows.filter((row) => row.vote === 0).length,
      noteRows: rows.filter((row) => row.message?.trim()),
    });
  }

  return output.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function statusOfItem(item: FeedbackListItem): FeedbackStatus {
  if (item.type === "row") return statusOfRow(item.fb);

  const statuses = item.rows.map(statusOfRow);
  if (statuses.every((status) => status === "fixed")) return "fixed";
  if (statuses.every((status) => status === "trash")) return "trash";
  return "open";
}

export function idsForItem(item: FeedbackListItem) {
  return item.type === "vote-group" ? item.rows.map((row) => row.id) : [item.fb.id];
}

export function itemTargetGroup(item: FeedbackListItem) {
  return targetGroupOf(item.type === "vote-group" ? item.representative.target_type : item.fb.target_type);
}

export function isLowPriorityItem(item: FeedbackListItem, adminEmail: string | null) {
  if (item.type === "vote-group") return true;
  if (item.fb.kind === "vote") return true;
  return adminEmail !== null && (item.fb.user_email ?? "").toLowerCase() === adminEmail;
}

function itemMatchesTargetGroup(item: FeedbackListItem, group: TargetGroup) {
  return group === "all" || itemTargetGroup(item) === group;
}

function itemMatchesPriority(
  item: FeedbackListItem,
  priority: Priority,
  adminEmail: string | null,
) {
  const lowPriority = isLowPriorityItem(item, adminEmail);
  return priority === "all" ||
    (priority === "priority" && !lowPriority) ||
    (priority === "low" && lowPriority);
}

export function getFeedbackFilterState({
  items,
  statusView,
  targetGroup,
  priority,
  adminEmail,
}: {
  items: FeedbackListItem[];
  statusView: FeedbackStatus;
  targetGroup: TargetGroup;
  priority: Priority;
  adminEmail: string | null;
}) {
  const statusCounts: Record<FeedbackStatus, number> = { open: 0, fixed: 0, trash: 0 };
  const targetGroupCounts: Record<TargetGroup, number> = { all: 0, questions: 0, explanations: 0, other: 0 };
  const priorityCounts: Record<Priority, number> = { all: 0, priority: 0, low: 0 };
  const visibleItems: FeedbackListItem[] = [];

  for (const item of items) {
    const status = statusOfItem(item);
    statusCounts[status] += 1;

    if (status !== statusView) continue;

    if (itemMatchesPriority(item, priority, adminEmail)) {
      targetGroupCounts.all += 1;
      targetGroupCounts[itemTargetGroup(item)] += 1;
    }

    if (itemMatchesTargetGroup(item, targetGroup)) {
      priorityCounts.all += 1;
      if (isLowPriorityItem(item, adminEmail)) priorityCounts.low += 1;
      else priorityCounts.priority += 1;
    }

    if (
      itemMatchesTargetGroup(item, targetGroup) &&
      itemMatchesPriority(item, priority, adminEmail)
    ) {
      visibleItems.push(item);
    }
  }

  return { statusCounts, targetGroupCounts, priorityCounts, visibleItems };
}
