"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useProgress } from "@/components/progress-provider";
import { useSimpleTheme } from "@/components/simple-theme-provider";
import { AchievementsSection } from "@/components/achievement-emblems";
import { SectionCard } from "@/components/section-card";
import { supabase } from "@/lib/supabase/client";

export default function AccountPage() {
  return (
    <Suspense>
      <AccountContent />
    </Suspense>
  );
}

function PreferencesCard() {
  const { isSimple, toggle } = useSimpleTheme();

  return (
    <SectionCard title="Preferences">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-900">Simple theme</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            Use a minimal Wikipedia-style layout with no colors or gradients.
          </p>
        </div>
        <button
          type="button"
          onClick={toggle}
          role="switch"
          aria-checked={isSimple}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            isSimple ? "bg-orange-500" : "bg-zinc-300"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform ${
              isSimple ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </SectionCard>
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
          <PreferencesCard />
        </div>

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
        <PreferencesCard />
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
  created_at: string;
};

function AdminFeedbackPanel() {
  const [feedback, setFeedback] = useState<FeedbackRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");

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

  if (feedback === null && !loading && !error) return null;
  if (feedback === null && !loading) return null;

  const kindColors: Record<string, string> = {
    bug: "bg-red-100 text-red-700",
    feature: "bg-violet-100 text-violet-700",
    general: "bg-blue-100 text-blue-700",
    vote: "bg-zinc-100 text-zinc-600",
  };

  return (
    <div className="mt-8">
      <SectionCard title="Feedback (Admin)">
        <div className="mb-4 flex flex-wrap items-center gap-2">
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

        {error && (
          <p className="mb-3 text-sm text-red-600">{error}</p>
        )}

        {feedback && feedback.length === 0 && (
          <p className="text-sm text-zinc-500">No feedback yet.</p>
        )}

        {feedback && feedback.length > 0 && (
          <div className="space-y-2">
            {feedback.map((fb) => (
              <div
                key={fb.id}
                className="rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${kindColors[fb.kind] ?? "bg-zinc-100 text-zinc-600"}`}>
                    {fb.kind}
                  </span>
                  {fb.vote !== null && (
                    <span className={`text-sm font-bold ${fb.vote === 1 ? "text-emerald-600" : "text-rose-500"}`}>
                      {fb.vote === 1 ? "+1" : "-1"}
                    </span>
                  )}
                  <span className="ml-auto text-[11px] text-zinc-400">
                    {new Date(fb.created_at).toLocaleString()}
                  </span>
                </div>

                {fb.message && (
                  <p className="mt-2 text-sm leading-relaxed text-zinc-700">
                    {fb.message}
                  </p>
                )}

                {fb.target_id && (
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Target: {fb.target_type}/{fb.target_id}
                  </p>
                )}

                <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-zinc-400">
                  {fb.user_id && <span>User: {fb.user_id.slice(0, 8)}...</span>}
                  {fb.page_url && <span>{fb.page_url.replace(/^https?:\/\/[^/]+/, "")}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
