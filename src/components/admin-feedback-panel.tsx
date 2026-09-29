"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { reportHeading, reportToMarkdown, reportsToMarkdown } from "@/lib/report-markdown";
import type { ReportKind, ReportRow, ReportStatus } from "@/lib/reports";

/**
 * The reports inbox. Every report is shown as the exact markdown brief an LLM
 * would be handed, so what you copy is what you see.
 */

const STATUS_TABS: ReportStatus[] = ["open", "fixed", "dismissed"];
const KIND_TABS: Array<ReportKind | "all"> = ["all", "question", "chapter", "site"];

type Load = { state: "loading" } | { state: "error"; message: string } | { state: "ready"; rows: ReportRow[] };

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function download(name: string, text: string) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function AdminFeedbackPanel() {
  const { user, accessToken, signOut } = useAuth();
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [status, setStatus] = useState<ReportStatus>("open");
  const [kind, setKind] = useState<ReportKind | "all">("all");
  const [subject, setSubject] = useState<string>("all");
  const [notice, setNotice] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    if (!accessToken) return;
    setLoad({ state: "loading" });
    try {
      const res = await fetch("/api/feedback?limit=1000", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.status === 403) {
        setLoad({ state: "error", message: `Signed in as ${user?.email ?? "?"}, but that address is not an admin.` });
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || `Request failed (${res.status})`);
      }
      const data = (await res.json()) as { reports: ReportRow[] };
      setLoad({ state: "ready", rows: data.reports });
    } catch (err) {
      setLoad({ state: "error", message: err instanceof Error ? err.message : "Failed to load" });
    }
  }, [accessToken, user?.email]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const rows = useMemo(() => (load.state === "ready" ? load.rows : []), [load]);
  const subjects = useMemo(
    () => [...new Set(rows.map((r) => r.subject).filter((s): s is string => Boolean(s)))].sort(),
    [rows],
  );
  const counts = useMemo(() => {
    const c: Record<ReportStatus, number> = { open: 0, fixed: 0, dismissed: 0 };
    for (const r of rows) c[r.status] += 1;
    return c;
  }, [rows]);
  const visible = useMemo(
    () =>
      rows.filter(
        (r) => r.status === status && (kind === "all" || r.kind === kind) && (subject === "all" || r.subject === subject),
      ),
    [rows, status, kind, subject],
  );

  const setRowStatus = async (ids: string[], next: ReportStatus) => {
    if (!accessToken) return;
    const res = await fetch("/api/feedback", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ ids, status: next }),
    });
    if (!res.ok) {
      setNotice("Could not update the report.");
      return;
    }
    setLoad((prev) =>
      prev.state === "ready"
        ? {
            state: "ready",
            rows: prev.rows.map((r) =>
              ids.includes(r.id) ? { ...r, status: next, resolved_at: next === "open" ? null : new Date().toISOString() } : r,
            ),
          }
        : prev,
    );
  };

  const flash = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(null), 2000);
  };

  const openRows = rows.filter((r) => r.status === "open");
  const exportName = () => `calcpath-reports-${new Date().toISOString().slice(0, 10)}.md`;

  return (
    <div className="text-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b theme-border pb-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight theme-text">Reports</h1>
          <p className="mt-1 theme-text-muted">
            {user?.email}
            <span className="mx-2">·</span>
            <button type="button" onClick={signOut} className="underline underline-offset-2 hover:underline">
              Sign out
            </button>
            <span className="mx-2">·</span>
            <button type="button" onClick={fetchRows} className="underline underline-offset-2 hover:underline">
              Refresh
            </button>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={openRows.length === 0}
            onClick={async () => {
              flash((await copyText(reportsToMarkdown(openRows, "CalcPath open reports"))) ? "Copied all open reports." : "Copy failed.");
            }}
            className="border theme-border px-3 py-1.5 theme-text disabled:opacity-50"
          >
            Copy all open ({openRows.length})
          </button>
          <button
            type="button"
            disabled={openRows.length === 0}
            onClick={() => download(exportName(), reportsToMarkdown(openRows, "CalcPath open reports"))}
            className="border theme-border px-3 py-1.5 theme-text disabled:opacity-50"
          >
            Download .md
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        <div role="tablist" aria-label="Status" className="flex gap-1">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={status === s}
              type="button"
              onClick={() => setStatus(s)}
              className={`border px-3 py-1 ${status === s ? "border-[var(--accent)] text-[var(--accent)]" : "theme-border theme-text-secondary"}`}
            >
              {s} ({counts[s]})
            </button>
          ))}
        </div>
        <div role="tablist" aria-label="Kind" className="flex gap-1">
          {KIND_TABS.map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={kind === k}
              type="button"
              onClick={() => setKind(k)}
              className={`border px-3 py-1 ${kind === k ? "border-[var(--accent)] text-[var(--accent)]" : "theme-border theme-text-secondary"}`}
            >
              {k}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 theme-text-secondary">
          Subject
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border theme-border bg-[var(--surface)] px-2 py-1 theme-text"
          >
            <option value="all">all</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      {notice && (
        <p role="status" className="mt-3 theme-text-secondary">
          {notice}
        </p>
      )}

      {load.state === "loading" && <p className="mt-6 theme-text-muted">Loading…</p>}
      {load.state === "error" && (
        <p role="alert" className="mt-6 text-red-600 dark:text-red-400">
          {load.message}
        </p>
      )}
      {load.state === "ready" && visible.length === 0 && <p className="mt-6 theme-text-muted">No reports match.</p>}

      <ul className="mt-6 space-y-6">
        {visible.map((r) => (
          <li key={r.id} className="border theme-border">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b theme-border bg-[var(--surface-2)] px-3 py-2">
              <span className="font-medium theme-text">{reportHeading(r)}</span>
              <span className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => flash((await copyText(reportToMarkdown(r))) ? "Copied." : "Copy failed.")}
                  className="border theme-border px-2 py-0.5 theme-text"
                >
                  Copy
                </button>
                {r.status !== "fixed" && (
                  <button type="button" onClick={() => setRowStatus([r.id], "fixed")} className="border theme-border px-2 py-0.5 theme-text">
                    Mark fixed
                  </button>
                )}
                {r.status !== "dismissed" && (
                  <button type="button" onClick={() => setRowStatus([r.id], "dismissed")} className="border theme-border px-2 py-0.5 theme-text">
                    Dismiss
                  </button>
                )}
                {r.status !== "open" && (
                  <button type="button" onClick={() => setRowStatus([r.id], "open")} className="border theme-border px-2 py-0.5 theme-text">
                    Reopen
                  </button>
                )}
              </span>
            </div>
            <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap break-words px-3 py-3 font-mono text-xs leading-relaxed theme-text-secondary">
              {reportToMarkdown(r)}
            </pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
