"use client";

import { useCallback, useRef, useState } from "react";

const voted = new Set<string>();

export function VoteFeedback({
  targetType,
  targetId,
  userId,
}: {
  targetType: string;
  targetId: string;
  userId?: string;
}) {
  const key = `${targetType}:${targetId}`;
  const [selection, setSelection] = useState<1 | -1 | null>(
    voted.has(`${key}:1`) ? 1 : voted.has(`${key}:-1`) ? -1 : null,
  );
  const sending = useRef(false);

  const castVote = useCallback(
    async (vote: 1 | -1) => {
      if (sending.current) return;
      if (selection === vote) return;

      setSelection(vote);
      voted.add(`${key}:${vote}`);
      voted.delete(`${key}:${vote === 1 ? -1 : 1}`);
      sending.current = true;

      try {
        await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "vote",
            target_type: targetType,
            target_id: targetId,
            vote,
            user_id: userId ?? null,
            page_url: typeof window !== "undefined" ? window.location.href : null,
          }),
        });
      } catch {
        // Silently fail — votes are best-effort
      } finally {
        sending.current = false;
      }
    },
    [key, selection, targetType, targetId, userId],
  );

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-400">Helpful?</span>
      <button
        type="button"
        onClick={() => castVote(1)}
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
        onClick={() => castVote(-1)}
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
      {selection && (
        <span className="text-[10px] text-zinc-400">Thanks!</span>
      )}
    </div>
  );
}
