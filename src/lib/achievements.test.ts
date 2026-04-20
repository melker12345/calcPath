import { describe, expect, it } from "vitest";
import { getAchievementResults } from "@/lib/achievements";
import { createEmptyProgress } from "@/lib/progress";
import { problems as calculusProblems, topics as calculusTopics } from "@/lib/calculus-content";
import { problems as statisticsProblems, topics as statisticsTopics } from "@/lib/statistics-content";

describe("achievement rules", () => {
  it("unlocks the first solved problem achievement", () => {
    const progress = {
      ...createEmptyProgress(),
      completedProblemIds: ["p-1"],
    };

    const results = getAchievementResults(progress);
    expect(results.find((r) => r.id === "first-problem")?.completed).toBe(true);
  });

  it("unlocks the 7-day streak achievement", () => {
    const progress = {
      ...createEmptyProgress(),
      streak: { current: 7, longest: 7, lastCompletionDate: "2026-04-20" },
    };

    const results = getAchievementResults(progress);
    expect(results.find((r) => r.id === "streak-7")?.completed).toBe(true);
    expect(results.find((r) => r.id === "streak-30")?.completed).toBe(false);
  });

  it("unlocks mastery for a completed calculus topic", () => {
    const topic = calculusTopics[0];
    const topicProblemIds = calculusProblems
      .filter((problem) => problem.topicId === topic.id)
      .map((problem) => problem.id);

    const progress = {
      ...createEmptyProgress(),
      attemptedProblemIds: topicProblemIds,
      completedProblemIds: topicProblemIds,
    };

    const results = getAchievementResults(progress);
    expect(results.find((r) => r.id === `calculus-master-${topic.id}`)?.completed).toBe(true);
  });

  it("unlocks a perfect calculus test achievement from a 100% test result", () => {
    const topic = calculusTopics[0];
    const progress = {
      ...createEmptyProgress(),
      testResults: [
        {
          topicId: topic.id,
          score: 10,
          total: 10,
          percentage: 100,
          timeSeconds: 120,
          completedAt: "2026-04-20T12:00:00.000Z",
        },
      ],
    };

    const results = getAchievementResults(progress);
    expect(results.find((r) => r.id === `calculus-perfect-${topic.id}`)?.completed).toBe(true);
  });

  it("unlocks subject completion when all statistics practice problems are mastered", () => {
    const statsProblemIds = statisticsProblems
      .filter((problem) => statisticsTopics.some((topic) => topic.id === problem.topicId))
      .map((problem) => problem.id);

    const progress = {
      ...createEmptyProgress(),
      attemptedProblemIds: statsProblemIds,
      completedProblemIds: statsProblemIds,
    };

    const results = getAchievementResults(progress);
    expect(results.find((r) => r.id === "statistics-complete-all")?.completed).toBe(true);
  });
});
