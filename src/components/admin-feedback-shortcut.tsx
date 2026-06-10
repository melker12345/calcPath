"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SectionCard } from "@/components/section-card";
import type { FeedbackRow } from "@/lib/admin-feedback";

type ShortcutState =
  | { status: "checking" }
  | { status: "hidden" }
  | { status: "visible"; rows: FeedbackRow[] };

export function AdminFeedbackShortcut() {
  // Auth removed: always attempt to load admin shortcut (no user check; api allows without token now).
  const [state, setState] = useState<ShortcutState>({ status: "checking" });

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      try {
        // Fetch without token (bypassed in api).
        const res = await fetch("/api/feedback?limit=1000");

        if (!res.ok) {
          if (!cancelled) setState({ status: "hidden" });
          return;
        }

        const payload = (await res.json()) as { feedback?: FeedbackRow[] };
        if (!cancelled) {
          setState({ status: "visible", rows: payload.feedback ?? [] });
        }
      } catch {
        if (!cancelled) setState({ status: "hidden" });
      }
    }

    checkAccess();
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    if (state.status !== "visible") return { open: 0, total: 0 };
    return {
      open: state.rows.filter((row) => (row.status ?? "open") === "open").length,
      total: state.rows.length,
    };
  }, [state]);

  if (state.status !== "visible") return null;

  return (
    <SectionCard
      title="Admin Feedback"
      description="A focused inbox for bugs, question reports, votes, and feature ideas."
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-2xl font-bold text-zinc-900">{counts.open}</p>
            <p className="text-xs font-medium text-zinc-500">Open</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-2xl font-bold text-zinc-900">{counts.total}</p>
            <p className="text-xs font-medium text-zinc-500">Total</p>
          </div>
        </div>
        <Link
          href="/admin/feedback"
          className="inline-flex items-center justify-center rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Open inbox
        </Link>
      </div>
    </SectionCard>
  );
}
