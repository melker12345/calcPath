"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useProgress } from "@/components/progress-provider";
import { AchievementsSection } from "@/components/achievement-emblems";
import { SectionCard } from "@/components/section-card";
import { supabase } from "@/lib/supabase/client";
import {
  buildTargetDeepLink,
  getProblemMeta,
  getPromptPreview,
  getTopicMeta,
  inferSubjectFromPath,
  inferTopicIdFromPath,
} from "@/lib/feedback-metadata";

export default function AccountPage() {
  return (
    <Suspense>
      <AccountContent />
    </Suspense>
  );
}

function AccountContent() {
  const { user, signOut } = useAuth();
  const { resetProgress } = useProgress();

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <SectionCard title="Sign in required">
          <p className="text-sm text-zinc-600">
            Create a free account to save progress and unlock streak tracking.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="btn-primary inline-flex" href="/auth">
              Sign in / register
            </Link>
            <Link className="btn-secondary inline-flex" href="/">
              Back to home
            </Link>
          </div>
        </SectionCard>

        <div className="mt-4 sm:mt-6">
          <AchievementsSection />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="mb-4 text-2xl font-bold text-zinc-900 sm:mb-6 sm:text-3xl">Account</h1>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <SectionCard title="Profile">
          <p className="text-sm text-zinc-500">Email</p>
          <p className="font-medium text-zinc-900">{user.email ?? "—"}</p>
          <p className="mt-4 text-sm text-zinc-500">Member since</p>
          <p className="font-medium text-zinc-900">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
          </p>
        </SectionCard>

        <SectionCard title="Data & security">
          <p className="text-sm text-zinc-600">
            Your progress is synced to the cloud. Resetting progress is irreversible.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={resetProgress}>
              Reset progress
            </button>
            <button className="btn-primary" onClick={signOut}>
              Sign out
            </button>
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 sm:mt-6">
        <AchievementsSection />
      </div>

      <AdminFeedbackPanel />
    </div>
  );
}

type FeedbackRow = {
  id: string;
  kind: string;
  message: string | null;
  vote: number | null;
  target_type: string | null;
  target_id: string | null;
  page_url: string | null;
  user_id: string | null;
  user_email?: string | null;
  created_at: string;
};

type FeedbackTargetSummary = {
  subjectLabel: string | null;
  topicTitle: string | null;
  questionNumber: number | null;
  internalId: string | null;
  promptPreview: string | null;
  routePath: string | null;
  deepLink: string | null;
};

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
  // Section IDs prefix with "stats:" / "linalg:" — strip that for topic lookup.
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

type TargetGroup = "all" | "questions" | "explanations" | "other";

function targetGroupOf(targetType: string | null): TargetGroup {
  if (targetType === "problem") return "questions";
  if (targetType === "section") return "explanations";
  return "other";
}

function AdminFeedbackPanel() {
  const [feedback, setFeedback] = useState<FeedbackRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [targetGroup, setTargetGroup] = useState<TargetGroup>("all");

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setFeedback(null);
        return;
      }

      const params = new URLSearchParams({ limit: "100" });
      if (filter !== "all") params.set("kind", filter);

      const res = await fetch(`/api/feedback?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 403) {
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

  const feedbackWithSummary = useMemo(
    () => feedback?.map((fb) => ({ fb, summary: summarizeFeedbackTarget(fb) })) ?? [],
    [feedback],
  );

  const counts = useMemo(() => {
    const acc: Record<TargetGroup, number> = { all: 0, questions: 0, explanations: 0, other: 0 };
    for (const { fb } of feedbackWithSummary) {
      acc.all += 1;
      acc[targetGroupOf(fb.target_type)] += 1;
    }
    return acc;
  }, [feedbackWithSummary]);

  const visible = useMemo(() => {
    if (targetGroup === "all") return feedbackWithSummary;
    return feedbackWithSummary.filter(
      ({ fb }) => targetGroupOf(fb.target_type) === targetGroup,
    );
  }, [feedbackWithSummary, targetGroup]);

  if (feedback === null && !loading && !error) return null;
  if (feedback === null && !loading) return null;

  const kindColors: Record<string, string> = {
    bug: "bg-red-100 text-red-700",
    feature: "bg-violet-100 text-violet-700",
    general: "bg-blue-100 text-blue-700",
    vote: "bg-zinc-100 text-zinc-600",
  };

  const targetGroupTabs: { id: TargetGroup; label: string }[] = [
    { id: "all", label: "All" },
    { id: "questions", label: "Questions" },
    { id: "explanations", label: "Explanations" },
    { id: "other", label: "Other" },
  ];

  return (
    <div className="mt-8">
      <SectionCard title="Feedback (Admin)">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {["all", "bug", "feature", "general", "vote"].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filter === k
                  ? "bg-orange-100 text-orange-800"
                  : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
              }`}
            >
              {k === "all" ? "All" : k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
          <button
            type="button"
            onClick={loadFeedback}
            disabled={loading}
            className="ml-auto rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-1.5 border-t border-zinc-100 pt-2">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
            About
          </span>
          {targetGroupTabs.map((tab) => {
            const count = counts[tab.id];
            const active = targetGroup === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTargetGroup(tab.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  active
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 text-[10px] ${active ? "text-zinc-300" : "text-zinc-400"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="mb-3 text-sm text-red-600">{error}</p>
        )}

        {feedback && feedback.length === 0 && (
          <p className="text-sm text-zinc-500">No feedback yet.</p>
        )}

        {feedback && feedback.length > 0 && visible.length === 0 && (
          <p className="text-sm text-zinc-500">Nothing in this view.</p>
        )}

        {visible.length > 0 && (
          <div className="space-y-3">
            {visible.map(({ fb, summary }) => (
              <div
                key={fb.id}
                className="rounded-2xl border border-zinc-100 bg-zinc-50/60 px-4 py-4"
              >
                <div className="flex items-start gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${kindColors[fb.kind] ?? "bg-zinc-100 text-zinc-600"}`}>
                    {fb.kind}
                  </span>
                  {fb.vote !== null && (
                    <span className={`text-sm font-bold ${fb.vote === 1 ? "text-emerald-600" : "text-rose-500"}`}>
                      {fb.vote === 1 ? "+1" : "-1"}
                    </span>
                  )}
                  {fb.target_type && (
                    <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600">
                      {fb.target_type === "problem"
                        ? "Question"
                        : fb.target_type === "section"
                          ? "Explanation"
                          : fb.target_type}
                    </span>
                  )}
                  {(summary.deepLink || summary.routePath) && (
                    <Link
                      href={summary.deepLink ?? summary.routePath ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-700 ring-1 ring-orange-200 transition hover:bg-orange-100"
                      title={summary.deepLink ?? summary.routePath ?? undefined}
                    >
                      Open
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                        <path d="M11 3a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0V5.41l-6.3 6.3a1 1 0 0 1-1.4-1.42L14.58 4H12a1 1 0 0 1-1-1Z" />
                        <path d="M3 6a3 3 0 0 1 3-3h3a1 1 0 0 1 0 2H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3a1 1 0 1 1 2 0v3a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Z" />
                      </svg>
                    </Link>
                  )}
                  <span
                    className={`shrink-0 text-[11px] text-zinc-400 ${(summary.deepLink || summary.routePath) ? "" : "ml-auto"}`}
                  >
                    {new Date(fb.created_at).toLocaleString()}
                  </span>
                </div>

                {(summary.subjectLabel || summary.topicTitle || summary.questionNumber !== null) && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    {summary.subjectLabel && (
                      <span className="rounded-full bg-white px-2.5 py-1 font-medium text-zinc-700 ring-1 ring-zinc-200">
                        {summary.subjectLabel}
                      </span>
                    )}
                    {summary.topicTitle && (
                      <span className="rounded-full bg-white px-2.5 py-1 font-medium text-zinc-700 ring-1 ring-zinc-200">
                        {summary.topicTitle}
                      </span>
                    )}
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

                {fb.message && (
                  <p className="mt-2 text-sm leading-relaxed text-zinc-700">
                    {fb.message}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-400">
                  {summary.internalId && (
                    <span>
                      Internal ID: <span className="font-mono">{summary.internalId}</span>
                    </span>
                  )}
                  {fb.target_type && (
                    <span>Target type: {fb.target_type}</span>
                  )}
                  <span>
                    User:{" "}
                    {fb.user_email
                      ? fb.user_email
                      : fb.user_id
                        ? `${fb.user_id.slice(0, 8)}...`
                        : "Anonymous"}
                  </span>
                  {summary.routePath && <span>{summary.routePath}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
