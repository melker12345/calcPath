"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useOptionalAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase/client";

const NOTE_MAX = 1000;
const REPORT_MAX = 1000;

const REPORT_REASONS = [
  "Answer seems wrong",
  "Explanation is unclear",
  "Input will not accept my answer",
  "Typo or formatting issue",
  "Other",
] as const;

type VoteValue = 1 | -1 | 0 | null;
type ReportReason = (typeof REPORT_REASONS)[number];

export function VoteFeedback({
  targetType,
  targetId,
  userId,
}: {
  targetType: string;
  targetId: string;
  userId?: string;
}) {
  const auth = useOptionalAuth();
  const user = auth?.user ?? null;
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const isAuthed = !!(user ?? sessionUserId);
  const resolvedUserId = userId ?? user?.id ?? sessionUserId;

  const [vote, setVote] = useState<VoteValue>(null);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [noteSent, setNoteSent] = useState(false);
  const [voted, setVoted] = useState(false); // anon: lock after first click
  const [sendingNote, setSendingNote] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>("Explanation is unclear");
  const [reportMessage, setReportMessage] = useState("");
  const [reportStatus, setReportStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const inFlightVote = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const reportTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (userId || user) return;
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setSessionUserId(data.session?.user.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, user]);

  const handleClick = useCallback(
    async (clicked: 1 | -1) => {
      if (inFlightVote.current) return;
      if (!isAuthed && voted) return; // anon gets one click

      // Optimistic: signed-in users get the cancellation rule mirrored on the
      // client so the UI doesn't flicker. Anon users go straight to ±1.
      const optimisticVote: VoteValue = isAuthed
        ? vote !== null && vote !== 0
          ? 0
          : clicked
        : clicked;
      setVote(optimisticVote);

      inFlightVote.current = true;
      try {
        let token: string | null = null;
        if (isAuthed) {
          const { data } = await supabase.auth.getSession();
          token = data.session?.access_token ?? null;
        }

        const res = await fetch("/api/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            kind: "vote",
            target_type: targetType,
            target_id: targetId,
            vote: clicked,
            user_id: resolvedUserId,
            page_url: typeof window !== "undefined" ? window.location.href : null,
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as { id?: string; vote?: VoteValue };
          if (typeof data.id === "string") setFeedbackId(data.id);
          if (data.vote !== undefined) setVote(data.vote);
        }
        setVoted(true);
      } catch {
        // Best-effort; the optimistic state stays so the user feels something happened.
      } finally {
        inFlightVote.current = false;
      }
    },
    [isAuthed, voted, vote, targetType, targetId, resolvedUserId],
  );

  const sendNote = useCallback(async () => {
    if (!feedbackId || sendingNote) return;
    const trimmed = note.trim();
    if (!trimmed) return;

    setSendingNote(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;

      const res = await fetch("/api/feedback", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: feedbackId,
          message: trimmed.slice(0, NOTE_MAX),
        }),
      });

      if (res.ok) {
        setNoteSent(true);
      }
    } catch {
      // Silent — the user can retry by clicking Send again.
    } finally {
      setSendingNote(false);
    }
  }, [feedbackId, note, sendingNote]);

  const sendReport = useCallback(async () => {
    if (reportStatus === "sending") return;

    const trimmed = reportMessage.trim();
    const structuredMessage = [
      `[${reportReason}]`,
      trimmed || "No extra details provided.",
    ].join(" ");

    setReportStatus("sending");
    try {
      let token: string | null = null;
      if (isAuthed) {
        const { data } = await supabase.auth.getSession();
        token = data.session?.access_token ?? null;
      }

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          kind: "bug",
          message: structuredMessage.slice(0, REPORT_MAX),
          target_type: targetType,
          target_id: targetId,
          user_id: resolvedUserId,
          page_url: typeof window !== "undefined" ? window.location.href : null,
        }),
      });

      if (!res.ok) throw new Error("Failed to send report");

      setReportStatus("sent");
      setReportMessage("");
    } catch {
      setReportStatus("error");
    }
  }, [isAuthed, reportMessage, reportReason, reportStatus, resolvedUserId, targetId, targetType]);

  // Cmd/Ctrl-Enter sends the note from the textarea.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        void sendNote();
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [sendNote]);

  // Auto-focus the note textarea when it first appears so the user can
  // immediately type without an extra click.
  useEffect(() => {
    if (isAuthed && (vote === 1 || vote === -1) && !noteSent) {
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }, [isAuthed, vote, noteSent]);

  useEffect(() => {
    if (reportOpen && reportStatus !== "sent") {
      requestAnimationFrame(() => reportTextareaRef.current?.focus());
    }
  }, [reportOpen, reportStatus]);

  const showNoteForm =
    isAuthed && (vote === 1 || vote === -1) && !noteSent && feedbackId !== null;
  const showAnonThanks = !isAuthed && voted;
  const showAuthedThanks = isAuthed && noteSent;

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-xs theme-text-muted">Helpful?</span>
        <button
          type="button"
          onClick={() => void handleClick(1)}
          disabled={!isAuthed && voted}
          aria-label="Helpful"
          aria-pressed={vote === 1}
          className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm transition active:scale-90 ${
            vote === 1
              ? "bg-emerald-100 text-emerald-600"
              : "text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M1 8.998a1 1 0 0 1 1-1h3v7H2a1 1 0 0 1-1-1v-5Zm5.5 6.5h5.8a2 2 0 0 0 1.96-1.61l1.2-6A2 2 0 0 0 13.54 5.5H10V2.5a1.5 1.5 0 0 0-3 0v3.148L6.5 7.498v8Z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => void handleClick(-1)}
          disabled={!isAuthed && voted}
          aria-label="Not helpful"
          aria-pressed={vote === -1}
          className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm transition active:scale-90 ${
            vote === -1
              ? "bg-rose-100 text-rose-500"
              : "text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 rotate-180">
            <path d="M1 8.998a1 1 0 0 1 1-1h3v7H2a1 1 0 0 1-1-1v-5Zm5.5 6.5h5.8a2 2 0 0 0 1.96-1.61l1.2-6A2 2 0 0 0 13.54 5.5H10V2.5a1.5 1.5 0 0 0-3 0v3.148L6.5 7.498v8Z" />
          </svg>
        </button>

        {showAnonThanks && (
          <span className="ml-1 text-[10px] theme-text-muted">
            Thanks!{" "}
            <Link href="/auth" className="text-orange-600 underline hover:text-orange-700">
              Sign in to leave a note
            </Link>
          </span>
        )}

        {showAuthedThanks && (
          <span className="ml-1 text-[10px] theme-text-muted">Thanks!</span>
        )}

        <button
          type="button"
          onClick={() => {
            setReportOpen((open) => !open);
            setReportStatus("idle");
          }}
          className="ml-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
        >
          Report issue
        </button>
      </div>

      {showNoteForm && (
        <div className="w-full max-w-xs rounded-lg border border-zinc-200 bg-white p-2.5 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)]">
          <label className="mb-1 block text-[11px] font-medium text-zinc-500 dark:text-[var(--text-muted)]">
            {vote === -1 ? "What's wrong?" : "What worked well?"}{" "}
            <span className="font-normal text-zinc-400">(optional)</span>
          </label>
          <textarea
            ref={textareaRef}
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))}
            placeholder={
              vote === -1
                ? "e.g. The example skipped a step…"
                : "e.g. Loved the worked example."
            }
            rows={2}
            maxLength={NOTE_MAX}
            className="feedback-textarea w-full resize-none rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-800 outline-none focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
          />
          <div className="mt-1.5 flex items-center justify-end">
            <button
              type="button"
              onClick={() => void sendNote()}
              disabled={sendingNote || !note.trim()}
              className="rounded-md bg-orange-500 px-3 py-1 text-[11px] font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500"
            >
              {sendingNote ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      )}

      {reportOpen && (
        <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-3 text-left shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)]">
          {reportStatus === "sent" ? (
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-[var(--text-primary)]">Thanks, report sent.</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-[var(--text-muted)]">
                We saved the target and page context so it can be reviewed.
              </p>
              <button
                type="button"
                onClick={() => {
                  setReportOpen(false);
                  setReportStatus("idle");
                }}
                className="mt-2 rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-200"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <label className="mb-1.5 block text-[11px] font-semibold text-zinc-500 dark:text-[var(--text-muted)]">
                What is the issue?
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value as ReportReason)}
                className="feedback-select w-full rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-800 outline-none focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
              >
                {REPORT_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>

              <label className="mb-1 mt-2 block text-[11px] font-medium text-zinc-500 dark:text-[var(--text-muted)]">
                Details <span className="font-normal text-zinc-400">(optional)</span>
              </label>
              <textarea
                ref={reportTextareaRef}
                value={reportMessage}
                onChange={(e) => setReportMessage(e.target.value.slice(0, REPORT_MAX))}
                rows={3}
                maxLength={REPORT_MAX}
                placeholder="e.g. I typed 2x+1 but it was marked wrong..."
                className="feedback-textarea w-full resize-none rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-800 outline-none focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
              />

              {reportStatus === "error" && (
                <p className="mt-1.5 text-[11px] text-rose-600">
                  Could not send report. Please try again.
                </p>
              )}

              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReportOpen(false)}
                  className="rounded-md px-3 py-1.5 text-xs font-semibold text-zinc-500 transition hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void sendReport()}
                  disabled={reportStatus === "sending"}
                  className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50"
                >
                  {reportStatus === "sending" ? "Sending..." : "Send report"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
