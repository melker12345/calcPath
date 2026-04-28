"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth-provider";

const submitted = new Set<string>();
const AUTO_SEND_MS = 6000;
const NOTE_MAX = 1000;

type Phase = "idle" | "pending" | "sent";

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
  const key = `${targetType}:${targetId}`;
  const initialAlreadySent =
    submitted.has(`${key}:1`) ? 1 : submitted.has(`${key}:-1`) ? -1 : null;

  const [selection, setSelection] = useState<1 | -1 | null>(initialAlreadySent);
  const [phase, setPhase] = useState<Phase>(initialAlreadySent ? "sent" : "idle");
  const [note, setNote] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);
  const resolvedUserId = userId ?? user?.id ?? null;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const sendVote = useCallback(
    async (vote: 1 | -1, message: string) => {
      if (inFlight.current) return;
      if (submitted.has(`${key}:${vote}`)) return;
      inFlight.current = true;

      const trimmed = message.trim().slice(0, NOTE_MAX);
      const payload = {
        kind: "vote",
        target_type: targetType,
        target_id: targetId,
        vote,
        message: trimmed || undefined,
        user_id: resolvedUserId,
        page_url: typeof window !== "undefined" ? window.location.href : null,
      };

      try {
        await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        // Best-effort; the unmount sendBeacon is the safety net.
      } finally {
        submitted.add(`${key}:${vote}`);
        inFlight.current = false;
      }
    },
    [key, targetType, targetId, resolvedUserId],
  );

  const finalize = useCallback(
    async (message: string) => {
      const vote = selection;
      if (vote === null) return;
      clearTimer();
      setPhase("sent");
      await sendVote(vote, message);
    },
    [selection, clearTimer, sendVote],
  );

  const armAutoSend = useCallback(
    (message: string) => {
      clearTimer();
      timerRef.current = setTimeout(() => {
        void finalize(message);
      }, AUTO_SEND_MS);
    },
    [clearTimer, finalize],
  );

  const cast = useCallback(
    (vote: 1 | -1) => {
      if (phase === "sent" && selection === vote) return;
      setSelection(vote);
      setPhase("pending");
      setNote("");
      armAutoSend("");
      requestAnimationFrame(() => textareaRef.current?.focus());
    },
    [phase, selection, armAutoSend],
  );

  // Re-arm the timer when the user types so quick typists aren't auto-sent mid-thought.
  useEffect(() => {
    if (phase !== "pending") return;
    armAutoSend(note);
  }, [note, phase, armAutoSend]);

  // Safety net: if the user navigates away while phase === "pending", flush the vote
  // (and any typed note) via sendBeacon so we don't lose it.
  useEffect(() => {
    return () => {
      if (typeof window === "undefined") return;
      if (selection === null) return;
      if (submitted.has(`${key}:${selection}`)) return;
      try {
        const payload = JSON.stringify({
          kind: "vote",
          target_type: targetType,
          target_id: targetId,
          vote: selection,
          message: note.trim().slice(0, NOTE_MAX) || undefined,
          user_id: resolvedUserId,
          page_url: window.location.href,
        });
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon?.("/api/feedback", blob);
        submitted.add(`${key}:${selection}`);
      } catch {
        // Nothing we can do during teardown.
      }
    };
  }, [key, note, resolvedUserId, selection, targetType, targetId]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-400">Helpful?</span>
        <button
          type="button"
          onClick={() => cast(1)}
          aria-label="Helpful"
          className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm transition active:scale-90 ${
            selection === 1
              ? "bg-emerald-100 text-emerald-600"
              : "text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M1 8.998a1 1 0 0 1 1-1h3v7H2a1 1 0 0 1-1-1v-5Zm5.5 6.5h5.8a2 2 0 0 0 1.96-1.61l1.2-6A2 2 0 0 0 13.54 5.5H10V2.5a1.5 1.5 0 0 0-3 0v3.148L6.5 7.498v8Z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => cast(-1)}
          aria-label="Not helpful"
          className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm transition active:scale-90 ${
            selection === -1
              ? "bg-rose-100 text-rose-500"
              : "text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 rotate-180">
            <path d="M1 8.998a1 1 0 0 1 1-1h3v7H2a1 1 0 0 1-1-1v-5Zm5.5 6.5h5.8a2 2 0 0 0 1.96-1.61l1.2-6A2 2 0 0 0 13.54 5.5H10V2.5a1.5 1.5 0 0 0-3 0v3.148L6.5 7.498v8Z" />
          </svg>
        </button>
        {phase === "sent" && (
          <span className="text-[10px] text-zinc-400">Thanks!</span>
        )}
      </div>

      {phase === "pending" && selection !== null && (
        <div className="w-full max-w-xs rounded-lg border border-zinc-200 bg-white p-2.5 shadow-sm">
          <label className="mb-1 block text-[11px] font-medium text-zinc-500">
            {selection === -1 ? "What's wrong?" : "What worked well?"}{" "}
            <span className="font-normal text-zinc-400">(optional)</span>
          </label>
          <textarea
            ref={textareaRef}
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))}
            placeholder={
              selection === -1
                ? "e.g. The example skipped a step…"
                : "e.g. Loved the worked example."
            }
            rows={2}
            maxLength={NOTE_MAX}
            className="w-full resize-none rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-800 outline-none focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
          />
          <div className="mt-1.5 flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => void finalize("")}
              className="rounded-md px-2.5 py-1 text-[11px] font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={() => void finalize(note)}
              disabled={!note.trim()}
              className="rounded-md bg-orange-500 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
