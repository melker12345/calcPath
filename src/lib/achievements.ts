import { getPracticeProgress, getTopicTestStats, type ProgressState } from "@/lib/progress";
import { topics as calculusTopics, problems as calculusProblems } from "@/lib/calculus-content";
import { topics as statisticsTopics, problems as statisticsProblems } from "@/lib/statistics-content";
import { topics as linalgTopics, problems as linalgProblems } from "@/lib/linalg-content";
import type { Problem, Topic } from "@/lib/shared-types";

export type Achievement = {
  id: string;
  icon: string;
  title: string;
  description: string;
  subject: string;
  check: (ctx: AchievementContext) => boolean;
};

export type AchievementContext = {
  progress: ProgressState;
  calcTopics: Topic[];
  calcProblems: Problem[];
  statsTopics: Topic[];
  statsProblems: Problem[];
  linalgTopics: Topic[];
  linalgProblems: Problem[];
};

type SubjectConfig = {
  slug: string;
  name: string;
  icon: string;
  topics: Topic[];
  problemsKey: "calcProblems" | "statsProblems" | "linalgProblems";
  hasTests: boolean;
};

const SUBJECTS: SubjectConfig[] = [
  { slug: "calculus", name: "Calculus", icon: "∫", topics: calculusTopics, problemsKey: "calcProblems", hasTests: true },
  { slug: "statistics", name: "Statistics", icon: "σ", topics: statisticsTopics, problemsKey: "statsProblems", hasTests: false },
  { slug: "linear-algebra", name: "Linear Algebra", icon: "λ", topics: linalgTopics, problemsKey: "linalgProblems", hasTests: false },
];

export const SUBJECT_ORDER = ["General", "Calculus", "Statistics", "Linear Algebra"];

export function createAchievementContext(progress: ProgressState): AchievementContext {
  return {
    progress,
    calcTopics: calculusTopics,
    calcProblems: calculusProblems,
    statsTopics: statisticsTopics,
    statsProblems: statisticsProblems,
    linalgTopics: linalgTopics,
    linalgProblems: linalgProblems,
  };
}

export function topicMastered(
  ctx: AchievementContext,
  topicId: string,
  problems: Problem[],
): boolean {
  const stats = getPracticeProgress(ctx.progress, topicId, problems);
  return stats.isComplete;
}

export function buildAchievements(): Achievement[] {
  const achievements: Achievement[] = [];

  for (const subject of SUBJECTS) {
    for (const topic of subject.topics) {
      achievements.push({
        id: `${subject.slug}-master-${topic.id}`,
        icon: subject.icon,
        title: topic.title,
        description: `Master all practice problems in ${topic.title}`,
        subject: subject.name,
        check: (ctx) => topicMastered(ctx, topic.id, ctx[subject.problemsKey]),
      });
    }

    if (subject.hasTests) {
      for (const topic of subject.topics) {
        achievements.push({
          id: `${subject.slug}-perfect-${topic.id}`,
          icon: "🏆",
          title: `${topic.title} — Perfect Test`,
          description: `Score 100% on the ${topic.title} test`,
          subject: subject.name,
          check: (ctx) => {
            const stats = getTopicTestStats(ctx.progress, topic.id);
            return !!stats.isPerfect;
          },
        });
      }
    }

    achievements.push({
      id: `${subject.slug}-complete-all`,
      icon: "⭐",
      title: `${subject.name} — All Mastered`,
      description: `Master every practice problem in ${subject.name}`,
      subject: subject.name,
      check: (ctx) => subject.topics.every((topic) => topicMastered(ctx, topic.id, ctx[subject.problemsKey])),
    });
  }

  achievements.push({
    id: "streak-7",
    icon: "🔥",
    title: "Week Warrior",
    description: "Achieve a 7-day practice streak",
    subject: "General",
    check: (ctx) => ctx.progress.streak.longest >= 7,
  });

  achievements.push({
    id: "streak-30",
    icon: "🔥",
    title: "Monthly Master",
    description: "Achieve a 30-day practice streak",
    subject: "General",
    check: (ctx) => ctx.progress.streak.longest >= 30,
  });

  achievements.push({
    id: "first-problem",
    icon: "🎯",
    title: "First Steps",
    description: "Solve your first practice problem",
    subject: "General",
    check: (ctx) => ctx.progress.completedProblemIds.length >= 1,
  });

  achievements.push({
    id: "fifty-problems",
    icon: "💪",
    title: "Half Century",
    description: "Solve 50 practice problems",
    subject: "General",
    check: (ctx) => ctx.progress.completedProblemIds.length >= 50,
  });

  achievements.push({
    id: "hundred-problems",
    icon: "💯",
    title: "Centurion",
    description: "Solve 100 practice problems",
    subject: "General",
    check: (ctx) => ctx.progress.completedProblemIds.length >= 100,
  });

  return achievements;
}

export const ALL_ACHIEVEMENTS = buildAchievements();

export function getAchievementResults(progress: ProgressState) {
  const ctx = createAchievementContext(progress);
  return ALL_ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    completed: achievement.check(ctx),
  }));
}
