"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildTargetDeepLink,
  getProblemMeta,
  getPromptPreview,
  getTopicMeta,
  inferSubjectFromPath,
  inferTopicIdFromPath,
} from "@/lib/feedback-metadata";
import {
  buildFeedbackListItems,
  getFeedbackFilterState,
  idsForItem,
  isLowPriorityItem,
  statusOfItem,
  type FeedbackKind,
  type FeedbackListItem,
  type FeedbackRow,
  type FeedbackStatus,
  type FeedbackTargetSummary,
  type FeedbackWithSummary,
  type Priority,
  type TargetGroup,
} from "@/lib/admin-feedback";


const KIND_TABS: Array<FeedbackKind | "all"> = ["all", "bug", "feature", "general", "vote"];

const KIND_COLORS: Record<string, string> = {
  bug: "bg-red-50 text-red-700 ring-1 ring-red-100",
  feature: "bg-violet-50 text-violet-700 ring-1 ring-violet-100",
  general: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  vote: "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200",
};

const TAB_COLORS: Record<string, { active: string; inactive: string }> = {
  all: {
    active: "border-zinc-300 bg-zinc-200 text-zinc-950",
    inactive: "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
  },
  bug: {
    active: "border-zinc-300 bg-zinc-200 text-zinc-950",
    inactive: "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
  },
  feature: {
    active: "border-zinc-300 bg-zinc-200 text-zinc-950",
    inactive: "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
  },
  general: {
    active: "border-zinc-300 bg-zinc-200 text-zinc-950",
    inactive: "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
  },
  vote: {
    active: "border-zinc-300 bg-zinc-200 text-zinc-950",
    inactive: "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
  },
  questions: {
    active: "border-zinc-300 bg-zinc-200 text-zinc-950",
    inactive: "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
  },
  explanations: {
    active: "border-zinc-300 bg-zinc-200 text-zinc-950",
    inactive: "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
  },
  other: {
    active: "border-zinc-300 bg-zinc-200 text-zinc-950",
    inactive: "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
  },
  priority: {
    active: "border-zinc-300 bg-zinc-200 text-zinc-950",
    inactive: "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
  },
  low: {
    active: "border-zinc-300 bg-zinc-200 text-zinc-950",
    inactive: "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
  },
};

const TARGET_GROUP_TABS: { id: TargetGroup; label: string }[] = [
  { id: "all", label: "All" },
  { id: "questions", label: "Questions" },
  { id: "explanations", label: "Explanations" },
  { id: "other", label: "Other" },
];

const PRIORITY_TABS: { id: Priority; label: string; title: string }[] = [
  { id: "all", label: "All", title: "Show every row" },
  { id: "priority", label: "Priority", title: "Feedback from everyone except you" },
  { id: "low", label: "Low priority", title: "Feedback you submitted yourself" },
];

const STATUS_TABS: { id: FeedbackStatus; label: string; description: string }[] = [
  { id: "open", label: "Open", description: "Needs review" },
  { id: "fixed", label: "Fixed", description: "Already handled" },
  { id: "trash", label: "Trash", description: "Hidden from triage" },
];

function summarizeFeedbackTarget(fb: FeedbackRow): FeedbackTargetSummary {
  const routePath = fb.page_url?.replace(/^https?:\/\/[^/]+/, "") ?? null;
  const pathSubject = inferSubjectFromPath(routePath);
  const deepLink = buildTargetDeepLink({
    targetType: fb.target_type,
    targetId: fb.target_id,
    pagePath: routePath,
  });

  if (fb.target_type === "problem") {
    const meta = getProblemMeta(fb.target_id);
    return {
      subjectLabel: meta?.subjectLabel ?? null,
      topicTitle: meta?.topicTitle ?? null,
      questionNumber: meta?.questionNumber ?? null,
      internalId: meta?.id ?? fb.target_id ?? null,
      promptPreview: getPromptPreview(meta?.prompt ?? null),
      routePath,
      deepLink,
    };
  }

  const sectionTopicIdRaw = fb.target_type === "section"
    ? fb.target_id?.split(":")[0] ?? null
    : inferTopicIdFromPath(routePath);
  const sectionTopicId =
    sectionTopicIdRaw === "stats" || sectionTopicIdRaw === "linalg"
      ? fb.target_id?.split(":")[1] ?? null
      : sectionTopicIdRaw;
  const sectionSubject =
    fb.target_id?.startsWith("stats:")
      ? "statistics"
      : fb.target_id?.startsWith("linalg:")
        ? "linear-algebra"
        : pathSubject;
  const topicMeta = getTopicMeta(sectionTopicId, sectionSubject);

  return {
    subjectLabel: topicMeta?.subjectLabel ?? null,
    topicTitle: topicMeta?.title ?? null,
    questionNumber: null,
    internalId: fb.target_id ?? null,
    promptPreview: null,
    routePath,
    deepLink,
  };
}

function targetTypeLabel(targetType: string | null) {
  if (targetType === "problem") return "Question";
  if (targetType === "section") return "Explanation";
  return targetType;
}

function userLabel(row: FeedbackRow) {
  if (row.user_email) return row.user_email;
  if (row.user_id) return `${row.user_id.slice(0, 8)}...`;
  return "Anonymous";
}

function formatCountLabel(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function tabClass(id: string, active: boolean) {
  const colors = TAB_COLORS[id] ?? TAB_COLORS.all;
  return active ? colors.active : colors.inactive;
}

function rowCardClass(kind: string) {
  if (kind === "bug") return "border-zinc-200 bg-white";
  if (kind === "feature") return "border-zinc-200 bg-white";
  if (kind === "general") return "border-zinc-200 bg-white";
  return "border-zinc-200 bg-white";
}

function voteCardClass(item: Extract<FeedbackListItem, { type: "vote-group" }>) {
  if (item.netVote < 0) return "border-zinc-200 bg-white";
  if (item.representative.target_type === "problem") {
    return "border-zinc-200 bg-white";
  }
  if (item.representative.target_type === "section") {
    return "border-zinc-200 bg-white";
  }
  if (item.netVote > 0) return "border-zinc-200 bg-white";
  return "border-zinc-200 bg-white";
}

export function AdminFeedbackPanel() {
  // Auth removed: always attempt load (no user/session/token checks). Admin inbox now open (obscure /admin/feedback URL).
  const adminEmail = null;
  const [feedback, setFeedback] = useState<FeedbackRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [updatingStatusFor, setUpdatingStatusFor] = useState<string | null>(null);
  const [filter, setFilter] = useState<FeedbackKind | "all">("all");
  const [statusView, setStatusView] = useState<FeedbackStatus>("open");
  const [targetGroup, setTargetGroup] = useState<TargetGroup>("all");
  const [priority, setPriority] = useState<Priority>("priority");

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAccessDenied(false);

    try {
      // No token: api GET now allows without auth (bypassed guard).
      const params = new URLSearchParams({ limit: "1000" });
      if (filter !== "all") params.set("kind", filter);

      const res = await fetch(`/api/feedback?${params}`);

      if (res.status === 403) {
        setAccessDenied(true);
        setFeedback(null);
        return;
      }

      if (!res.ok) throw new Error("Failed to load");

      const data = await res.json();
      setFeedback(data.feedback);
    } catch {
      setError("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const updateFeedbackStatus = useCallback(
    async (item: FeedbackListItem, status: FeedbackStatus) => {
      const ids = idsForItem(item);
      setUpdatingStatusFor(item.id);
      setError(null);

      try {
        // No token required (api status update guard bypassed for anon-admin).
        const res = await fetch("/api/feedback", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids, status }),
        });

        if (!res.ok) throw new Error("Failed to update");

        setFeedback((current) =>
          current?.map((row) =>
            ids.includes(row.id) ? { ...row, status } : row,
          ) ?? current,
        );
      } catch {
        setError("Failed to update feedback status");
      } finally {
        setUpdatingStatusFor(null);
      }
    },
    [],
  );

  const feedbackWithSummary = useMemo(
    () => feedback?.map((fb) => ({ fb, summary: summarizeFeedbackTarget(fb) })) ?? [],
    [feedback],
  );

  const listItems = useMemo(
    () => buildFeedbackListItems(feedbackWithSummary),
    [feedbackWithSummary],
  );

  const { statusCounts, targetGroupCounts, priorityCounts, visibleItems } = useMemo(
    () =>
      getFeedbackFilterState({
        items: listItems,
        statusView,
        targetGroup,
        priority,
        adminEmail,
      }),
    [listItems, statusView, targetGroup, priority, adminEmail],
  );

  if (accessDenied && !loading) {
    return (
      <section className="rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
          Admin
        </p>
        <h2 className="mt-2 text-2xl font-bold text-zinc-900">
          Feedback inbox unavailable
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
          Unable to load (check admin config or try refresh).
        </p>
      </section>
    );
  }

  if (feedback === null && !loading && !error) return null;
  if (feedback === null && !loading) return null;

  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 bg-zinc-100 px-5 py-5 text-zinc-950 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Admin
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              Feedback Inbox
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-600">
              Triage bugs, question reports, explanation votes, and feature requests without the account page noise.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-right">
            <InboxStat label="Open" value={statusCounts.open} />
            <InboxStat label="Fixed" value={statusCounts.fixed} />
            <InboxStat label="Trash" value={statusCounts.trash} />
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <FeedbackToolbar
          filter={filter}
          loading={loading}
          onFilterChange={setFilter}
          onRefresh={loadFeedback}
        />

        <StatusTabs
          counts={statusCounts}
          value={statusView}
          onChange={setStatusView}
        />

        <LabeledTabs
          label="About"
          tabs={TARGET_GROUP_TABS}
          value={targetGroup}
          counts={targetGroupCounts}
          onChange={setTargetGroup}
        />

        <LabeledTabs
          label="Priority"
          tabs={PRIORITY_TABS}
          value={priority}
          counts={priorityCounts}
          onChange={setPriority}
        />

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        {feedback && feedback.length === 0 && (
          <p className="text-sm text-zinc-500">No feedback yet.</p>
        )}
        {feedback && feedback.length > 0 && visibleItems.length === 0 && (
          <p className="text-sm text-zinc-500">Nothing in this view.</p>
        )}

        {visibleItems.length > 0 && (
          <div className="space-y-3">
            {visibleItems.map((item) => (
              <FeedbackCard
                key={item.id}
                item={item}
                lowPriority={isLowPriorityItem(item, adminEmail)}
                statusBusy={updatingStatusFor === item.id}
                onStatusChange={(status) => updateFeedbackStatus(item, status)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function InboxStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-lg font-bold leading-none text-zinc-950">{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
    </div>
  );
}

function FeedbackToolbar({
  filter,
  loading,
  onFilterChange,
  onRefresh,
}: {
  filter: FeedbackKind | "all";
  loading: boolean;
  onFilterChange: (kind: FeedbackKind | "all") => void;
  onRefresh: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-2 sm:flex-row sm:items-center">
      <span className="min-w-20 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
        Kind
      </span>
      <div className="flex flex-1 flex-wrap items-center gap-1.5">
        {KIND_TABS.map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => onFilterChange(kind)}
            className={`h-8 rounded-lg border px-3 text-xs font-semibold transition ${tabClass(kind, filter === kind)}`}
          >
            {kind === "all" ? "All" : kind.charAt(0).toUpperCase() + kind.slice(1)}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="h-8 rounded-lg bg-white px-3 text-xs font-semibold text-zinc-600 ring-1 ring-zinc-200 transition hover:bg-zinc-100 disabled:opacity-50 sm:ml-auto"
      >
        {loading ? "Loading..." : "Refresh"}
      </button>
    </div>
  );
}

function StatusTabs({
  counts,
  value,
  onChange,
}: {
  counts: Record<FeedbackStatus, number>;
  value: FeedbackStatus;
  onChange: (status: FeedbackStatus) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {STATUS_TABS.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-xl border px-3 py-2 text-left transition ${
              active
                ? "border-zinc-300 bg-zinc-200 text-zinc-950"
                : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            <span className="flex items-center justify-between gap-2 text-xs font-bold">
              {tab.label}
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                active ? "bg-white text-zinc-700" : "bg-zinc-100 text-zinc-400"
              }`}>
                {counts[tab.id]}
              </span>
            </span>
            <span className="mt-0.5 block text-[11px] opacity-70">
              {tab.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function LabeledTabs<T extends string>({
  label,
  tabs,
  value,
  counts,
  onChange,
}: {
  label: string;
  tabs: Array<{ id: T; label: string; title?: string }>;
  value: T;
  counts: Record<T, number>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-2 sm:flex-row sm:items-center">
      <span className="min-w-20 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
        {label}
      </span>
      <div className="flex flex-1 flex-wrap items-center gap-1.5">
        {tabs.map((tab) => {
          const active = value === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              title={tab.title}
              onClick={() => onChange(tab.id)}
              className={`h-8 rounded-lg border px-3 text-xs font-semibold transition ${tabClass(tab.id, active)}`}
            >
              {tab.label}
              <span className="ml-1.5 text-[10px] opacity-70">
                {counts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FeedbackCard({
  item,
  lowPriority,
  statusBusy,
  onStatusChange,
}: {
  item: FeedbackListItem;
  lowPriority: boolean;
  statusBusy: boolean;
  onStatusChange: (status: FeedbackStatus) => void;
}) {
  return item.type === "vote-group" ? (
    <VoteSummaryCard
      item={item}
      lowPriority={lowPriority}
      statusBusy={statusBusy}
      onStatusChange={onStatusChange}
    />
  ) : (
    <FeedbackRowCard
      item={item}
      lowPriority={lowPriority}
      statusBusy={statusBusy}
      onStatusChange={onStatusChange}
    />
  );
}

function VoteSummaryCard({
  item,
  lowPriority,
  statusBusy,
  onStatusChange,
}: {
  item: Extract<FeedbackListItem, { type: "vote-group" }>;
  lowPriority: boolean;
  statusBusy: boolean;
  onStatusChange: (status: FeedbackStatus) => void;
}) {
  const scoreLabel = item.netVote > 0 ? `+${item.netVote}` : String(item.netVote);
  const scoreClass =
    item.netVote > 0
      ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
      : item.netVote < 0
        ? "bg-rose-100 text-rose-700 ring-rose-200"
        : "bg-zinc-100 text-zinc-600 ring-zinc-200";
  const targetType = item.representative.target_type;

  return (
    <CardShell
      className={voteCardClass(item)}
      lowPriority={lowPriority}
    >
      <CardHeader
        summary={item.summary}
        status={statusOfItem(item)}
        lowPriority={lowPriority}
        trailing={<span className="shrink-0 text-[11px] text-zinc-400">Latest {new Date(item.createdAt).toLocaleString()}</span>}
      >
        <Pill className="bg-zinc-900 text-white">Vote summary</Pill>
        <span className={`rounded-md px-2 py-0.5 text-sm font-extrabold ring-1 ${scoreClass}`}>
          {scoreLabel}
        </span>
        <Pill className="bg-white text-emerald-700 ring-1 ring-emerald-100">+{item.upVotes}</Pill>
        <Pill className="bg-white text-rose-600 ring-1 ring-rose-100">-{item.downVotes}</Pill>
        {item.neutralVotes > 0 && (
          <Pill className="bg-white text-zinc-500 ring-1 ring-zinc-100">
            {item.neutralVotes} neutral
          </Pill>
        )}
        <Pill className="bg-white text-zinc-600 ring-1 ring-zinc-100">
          {formatCountLabel(item.rows.length, "vote")}
        </Pill>
        {targetType && (
          <Pill className="bg-white text-zinc-600 ring-1 ring-zinc-100">
            {targetTypeLabel(targetType)}
          </Pill>
        )}
        {item.noteRows.length > 0 && (
          <NoteCountPill count={item.noteRows.length} />
        )}
      </CardHeader>

      <TargetSummary summary={item.summary} />
      <VoteNotes rows={item.noteRows} />
      <CardFooter
        summary={item.summary}
        targetType={item.representative.target_type}
        userMeta={`Users: ${new Set(item.rows.map((row) => row.user_email ?? row.user_id ?? `anonymous:${row.id}`)).size}`}
      />
      <StatusActions busy={statusBusy} currentStatus={statusOfItem(item)} onChange={onStatusChange} />
    </CardShell>
  );
}

function FeedbackRowCard({
  item,
  lowPriority,
  statusBusy,
  onStatusChange,
}: {
  item: Extract<FeedbackListItem, { type: "row" }>;
  lowPriority: boolean;
  statusBusy: boolean;
  onStatusChange: (status: FeedbackStatus) => void;
}) {
  const { fb, summary } = item;

  return (
    <CardShell className={rowCardClass(fb.kind)} lowPriority={lowPriority}>
      <CardHeader
        summary={summary}
        status={statusOfItem(item)}
        lowPriority={lowPriority}
        trailing={<span className="shrink-0 text-[11px] text-zinc-400">{new Date(fb.created_at).toLocaleString()}</span>}
      >
        <Pill className={KIND_COLORS[fb.kind] ?? "bg-zinc-100 text-zinc-600"}>
          {fb.kind}
        </Pill>
        {fb.message && <NoteCountPill />}
      </CardHeader>

      <TargetSummary summary={summary} />
      {fb.message && <MessageBlock message={fb.message} />}
      <CardFooter summary={summary} targetType={fb.target_type} userMeta={`User: ${userLabel(fb)}`} />
      <StatusActions busy={statusBusy} currentStatus={statusOfItem(item)} onChange={onStatusChange} />
    </CardShell>
  );
}

function CardShell({
  children,
  className = "border-zinc-100 bg-zinc-50/60",
  lowPriority,
}: {
  children: React.ReactNode;
  className?: string;
  lowPriority: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border px-4 py-4 ${lowPriority ? "opacity-75" : ""} ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({
  children,
  summary,
  status,
  lowPriority,
  trailing,
}: {
  children: React.ReactNode;
  summary: FeedbackTargetSummary;
  status: FeedbackStatus;
  lowPriority: boolean;
  trailing: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start gap-2">
        {children}
        <StatusBadge status={status} />
        {lowPriority && <LowPriorityBadge />}
        <span className="ml-auto">{trailing}</span>
      </div>
      {summary.deepLink && (
        <div className="flex justify-end">
          <OpenTargetLink href={summary.deepLink} />
        </div>
      )}
    </div>
  );
}

function TargetSummary({ summary }: { summary: FeedbackTargetSummary }) {
  return (
    <>
      {(summary.subjectLabel || summary.topicTitle || summary.questionNumber !== null) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {summary.subjectLabel && <SubjectPill>{summary.subjectLabel}</SubjectPill>}
          {summary.topicTitle && <SubjectPill>{summary.topicTitle}</SubjectPill>}
          {summary.questionNumber !== null && (
            <span className="rounded-full bg-orange-50 px-2.5 py-1 font-semibold text-orange-700 ring-1 ring-orange-200">
              Q{summary.questionNumber}
            </span>
          )}
        </div>
      )}

      {summary.promptPreview && (
        <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm leading-relaxed text-zinc-700 ring-1 ring-zinc-100">
          {summary.promptPreview}
        </p>
      )}
    </>
  );
}

function CardFooter({
  summary,
  targetType,
  userMeta,
}: {
  summary: FeedbackTargetSummary;
  targetType: string | null;
  userMeta: string;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-400">
      {summary.internalId && (
        <span>
          Internal ID: <span className="font-mono">{summary.internalId}</span>
        </span>
      )}
      {targetType && <span>Target type: {targetType}</span>}
      <span>{userMeta}</span>
      {summary.routePath && <span>{summary.routePath}</span>}
    </div>
  );
}

function StatusActions({
  busy,
  currentStatus,
  onChange,
}: {
  busy: boolean;
  currentStatus: FeedbackStatus;
  onChange: (status: FeedbackStatus) => void;
}) {
  const buttonBase =
    "rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50";

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {currentStatus !== "open" && (
        <button
          type="button"
          disabled={busy}
          onClick={() => onChange("open")}
          className={`${buttonBase} bg-orange-50 text-orange-700 ring-1 ring-orange-200 hover:bg-orange-100`}
        >
          Reopen
        </button>
      )}
      {currentStatus !== "fixed" && (
        <button
          type="button"
          disabled={busy}
          onClick={() => onChange("fixed")}
          className={`${buttonBase} bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100`}
        >
          Mark fixed
        </button>
      )}
      {currentStatus !== "trash" && (
        <button
          type="button"
          disabled={busy}
          onClick={() => onChange("trash")}
          className={`${buttonBase} bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-200`}
        >
          Move to trash
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: FeedbackStatus }) {
  const className =
    status === "open"
      ? "bg-orange-100 text-orange-700"
      : status === "fixed"
        ? "bg-emerald-100 text-emerald-700"
        : "bg-zinc-200 text-zinc-600";

  return <Pill className={className}>{status}</Pill>;
}

function LowPriorityBadge() {
  return (
    <Pill
      className="bg-amber-100 text-amber-800 ring-1 ring-amber-200"
      title="Only submitted by you"
    >
      Low priority
    </Pill>
  );
}

function NoteCountPill({ count }: { count?: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200"
      title="This item has written notes"
    >
      <NoteIcon />
      {count === undefined ? "Note" : formatCountLabel(count, "note")}
    </span>
  );
}

function OpenTargetLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-700 ring-1 ring-orange-200 transition hover:bg-orange-100"
      title={href}
    >
      Open
      <ExternalLinkIcon />
    </Link>
  );
}

function VoteNotes({ rows }: { rows: FeedbackRow[] }) {
  if (rows.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {rows.map((row) => (
        <MessageBlock
          key={row.id}
          message={row.message ?? ""}
          tone={row.vote === -1 ? "negative" : row.vote === 1 ? "positive" : "neutral"}
          label={`${row.vote === 1 ? "+1 note" : row.vote === -1 ? "-1 note" : "Neutral note"} · ${userLabel(row)} · ${new Date(row.created_at).toLocaleString()}`}
        />
      ))}
    </div>
  );
}

function MessageBlock({
  message,
  label = "Message",
  tone = "default",
}: {
  message: string;
  label?: string;
  tone?: "default" | "positive" | "negative" | "neutral";
}) {
  const toneClass =
    tone === "positive"
      ? "border-emerald-300 bg-white/80 text-emerald-900"
      : tone === "negative"
        ? "border-rose-300 bg-white/80 text-rose-900"
        : tone === "neutral"
          ? "border-zinc-300 bg-white/80 text-zinc-800"
          : "border-amber-300 bg-amber-50/70 text-amber-900";

  return (
    <blockquote className={`mt-3 rounded-r-xl border-l-4 px-3.5 py-2.5 text-sm leading-relaxed ${toneClass}`}>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="whitespace-pre-wrap break-words">{message}</p>
    </blockquote>
  );
}

function Pill({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className: string;
  title?: string;
}) {
  return (
    <span
      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${className}`}
      title={title}
    >
      {children}
    </span>
  );
}

function SubjectPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white px-2.5 py-1 font-medium text-zinc-700 ring-1 ring-zinc-200">
      {children}
    </span>
  );
}

function NoteIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
      <path d="M3.5 4A1.5 1.5 0 0 1 5 2.5h10A1.5 1.5 0 0 1 16.5 4v8A1.5 1.5 0 0 1 15 13.5H8.41l-3.7 3.7A.5.5 0 0 1 4 16.85V13.5H3.5A1.5 1.5 0 0 1 2 12V4a1.5 1.5 0 0 1 1.5-1.5Z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
      <path d="M11 3a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0V5.41l-6.3 6.3a1 1 0 0 1-1.4-1.42L14.58 4H12a1 1 0 0 1-1-1Z" />
      <path d="M3 6a3 3 0 0 1 3-3h3a1 1 0 0 1 0 2H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3a1 1 0 1 1 2 0v3a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Z" />
    </svg>
  );
}
