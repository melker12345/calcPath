import { describe, expect, it } from "vitest";
import {
  calculateStreak,
  createEmptyProgress,
  getTopicProgress,
  recordAttempt,
} from "@/lib/progress";

describe("progress utilities", () => {
  it("calculates streaks with consecutive days", () => {
    const base = new Date("2024-01-01T10:00:00Z");
    const attempts = [0, 1, 2].map((offset) => ({
      problemId: `p-${offset}`,
      topicId: "limits",
      correct: true,
      createdAt: new Date(base.getTime() + offset * 86400000).toISOString(),
    }));

    const streak = calculateStreak(attempts);
    expect(streak.longest).toBe(3);
  });

  it("tracks topic progress counts", () => {
    const initial = createEmptyProgress();
    const next = recordAttempt(initial, {
      problemId: "p-1",
      topicId: "limits",
      correct: true,
      createdAt: new Date().toISOString(),
    });
    const stats = getTopicProgress(next, "limits", 10);
    expect(stats.solved).toBe(1);
    expect(stats.correct).toBe(1);
    expect(stats.accuracyRate).toBe(100);
  });
});
