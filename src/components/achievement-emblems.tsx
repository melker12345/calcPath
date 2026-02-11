"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/auth-provider";
import { useProgress } from "@/components/progress-provider";
import { getTopicTestStats } from "@/lib/progress";
import { topics } from "@/lib/content";

// Admin users see all emblems for preview purposes
const EMBLEM_PREVIEW_IDS = new Set([
  "8e3871de-9cb4-4292-be10-cf45f84e96b4",
]);

/**
 * Floating achievement emblems for topics with perfect (100%) test scores.
 * Purely visual — subtle, non-interactive, non-distracting.
 * They float gently in fixed positions on the page.
 */
export function AchievementEmblems() {
  const { user } = useAuth();
  const { progress } = useProgress();

  const isPreview = user ? EMBLEM_PREVIEW_IDS.has(user.id) : false;

  const perfectTopics = useMemo(() => {
    if (isPreview) return topics; // Show all emblems for preview
    return topics.filter((t) => {
      const stats = getTopicTestStats(progress, t.id);
      return stats.isPerfect;
    });
  }, [progress, isPreview]);

  if (perfectTopics.length === 0) return null;

  // Fixed positions spread around the viewport edges so they don't overlap content
  const positions = [
    { top: "15%", right: "3%" },
    { top: "35%", left: "2%" },
    { bottom: "25%", right: "4%" },
    { bottom: "10%", left: "3%" },
    { top: "60%", right: "2%" },
    { top: "70%", left: "4%" },
  ];

  const topicEmoji: Record<string, string> = {
    limits: "∞",
    derivatives: "𝑓′",
    applications: "📐",
    integrals: "∫",
    series: "Σ",
    "differential-equations": "𝑑𝑦",
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden md:block" aria-hidden="true">
      {perfectTopics.map((topic, i) => {
        const pos = positions[i % positions.length];
        const emoji = topicEmoji[topic.id] || "⭐";
        const delay = i * 2;
        const duration = 12 + (i % 3) * 4;

        return (
          <div
            key={topic.id}
            className="absolute select-none"
            style={{
              ...pos,
              animation: `float-emblem ${duration}s ease-in-out ${delay}s infinite`,
            }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-300/30 bg-amber-100/20 text-2xl font-bold text-amber-500/40 md:h-20 md:w-20 md:text-3xl">
              {emoji}
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes float-emblem {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-12px) rotate(3deg); }
          50% { transform: translateY(-6px) rotate(-2deg); }
          75% { transform: translateY(-15px) rotate(1deg); }
        }
      `}</style>
    </div>
  );
}
