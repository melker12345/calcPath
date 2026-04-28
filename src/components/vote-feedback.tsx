"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase/client";

const NOTE_MAX = 1000;

type VoteValue = 1 | -1 | 0 | null;

export function VoteFeedback({
  targetType,
  targetId,
  userId,
}: {
  targetType: string;
  targetId: string;
  userId?: string;
}) {
  const { user } = useAuth();
  const isAuthed = !!user;
  const resolvedUserId = userId ?? user?.id ?? null;

  const [vote, setVote] = useState<VoteValue>(null);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [noteSent, setNoteSent] = useState(false);
  const [voted, setVoted] = useState(false); // anon: lock after first click
  const [sendingNote, setSendingNote] = useState(false);
  const inFlightVote = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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

  const showNoteForm =
    isAuthed && (vote === 1 || vote === -1) && !noteSent && feedbackId !== null;
  const showAnonThanks = !isAuthed && voted;
  const showAuthedThanks = isAuthed && noteSent;

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-400">Helpful?</span>
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
          <span className="ml-1 text-[10px] text-zinc-400">
            Thanks!{" "}
            <Link href="/auth" className="text-orange-600 underline hover:text-orange-700">
              Sign in to leave a note
            </Link>
          </span>
        )}

        {showAuthedThanks && (
          <span className="ml-1 text-[10px] text-zinc-400">Thanks!</span>
        )}
      </div>

      {showNoteForm && (
        <div className="w-full max-w-xs rounded-lg border border-zinc-200 bg-white p-2.5 shadow-sm">
          <label className="mb-1 block text-[11px] font-medium text-zinc-500">
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
            className="w-full resize-none rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-800 outline-none focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
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
    </div>
  );
}
