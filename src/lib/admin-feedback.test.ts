import { describe, expect, it } from "vitest";
import {
  buildFeedbackListItems,
  getFeedbackFilterState,
  isLowPriorityItem,
  statusOfItem,
  type FeedbackRow,
  type FeedbackTargetSummary,
  type FeedbackWithSummary,
} from "@/lib/admin-feedback";

const adminEmail = "melkeroberg03@gmail.com";

const summary = (overrides: Partial<FeedbackTargetSummary> = {}): FeedbackTargetSummary => ({
  subjectLabel: "Calculus",
  topicTitle: "Derivatives",
  questionNumber: null,
  internalId: null,
  promptPreview: null,
  routePath: "/calculus/modules/derivatives",
  deepLink: "/calculus/modules/derivatives#intro",
  ...overrides,
});

const row = (overrides: Partial<FeedbackRow>): FeedbackRow => ({
  id: "row",
  kind: "general",
  message: "message",
  vote: null,
  target_type: null,
  target_id: null,
  page_url: "/feedback",
  user_id: null,
  user_email: null,
  status: "open",
  created_at: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const withSummary = (
  fb: FeedbackRow,
  meta: Partial<FeedbackTargetSummary> = {},
): FeedbackWithSummary => ({
  fb,
  summary: summary({
    internalId: fb.target_id,
    routePath: fb.page_url,
    ...meta,
  }),
});

describe("admin feedback filtering", () => {
  it("keeps counts aligned with the visible intersection of status, target group, and priority", () => {
    const items = buildFeedbackListItems([
      withSummary(row({
        id: "vote-question-open",
        kind: "vote",
        vote: -1,
        target_type: "problem",
        target_id: "problem-1",
        page_url: "/calculus/practice/derivatives",
      }), { questionNumber: 1 }),
      withSummary(row({
        id: "admin-question-open",
        kind: "bug",
        target_type: "problem",
        target_id: "problem-2",
        user_email: adminEmail,
        page_url: "/calculus/practice/derivatives",
      }), { questionNumber: 2 }),
      withSummary(row({
        id: "user-feature-open",
        kind: "feature",
        user_email: "student@example.com",
        page_url: "/feedback",
      })),
    ]);

    const state = getFeedbackFilterState({
      items,
      statusView: "open",
      targetGroup: "questions",
      priority: "priority",
      adminEmail,
    });

    expect(state.visibleItems).toHaveLength(0);
    expect(state.targetGroupCounts).toEqual({
      all: 1,
      questions: 0,
      explanations: 0,
      other: 1,
    });
    expect(state.priorityCounts).toEqual({
      all: 2,
      priority: 0,
      low: 2,
    });
  });

  it("treats all vote feedback and admin-authored feedback as low priority", () => {
    const items = buildFeedbackListItems([
      withSummary(row({
        id: "vote-section",
        kind: "vote",
        vote: 1,
        target_type: "section",
        target_id: "derivatives:intro",
      })),
      withSummary(row({
        id: "admin-general",
        kind: "general",
        user_email: adminEmail,
      })),
      withSummary(row({
        id: "student-bug",
        kind: "bug",
        user_email: "student@example.com",
      })),
    ]);

    const lowById = new Map(items.map((item) => [item.id, isLowPriorityItem(item, adminEmail)]));
    expect(lowById.get("vote-group:section:derivatives:intro:open")).toBe(true);
    expect(lowById.get("admin-general")).toBe(true);
    expect(lowById.get("student-bug")).toBe(false);

    const state = getFeedbackFilterState({
      items,
      statusView: "open",
      targetGroup: "all",
      priority: "low",
      adminEmail,
    });

    expect(state.visibleItems.map((item) => item.id).sort()).toEqual([
      "admin-general",
      "vote-group:section:derivatives:intro:open",
    ].sort());
  });

  it("does not mix open and trashed votes into the same vote summary", () => {
    const items = buildFeedbackListItems([
      withSummary(row({
        id: "open-upvote",
        kind: "vote",
        vote: 1,
        target_type: "section",
        target_id: "limits:intro",
        status: "open",
        created_at: "2026-01-02T00:00:00.000Z",
      })),
      withSummary(row({
        id: "trash-downvote",
        kind: "vote",
        vote: -1,
        target_type: "section",
        target_id: "limits:intro",
        status: "trash",
        created_at: "2026-01-01T00:00:00.000Z",
      })),
    ]);

    expect(items).toHaveLength(2);
    expect(items.map(statusOfItem).sort()).toEqual(["open", "trash"]);

    const openState = getFeedbackFilterState({
      items,
      statusView: "open",
      targetGroup: "explanations",
      priority: "low",
      adminEmail,
    });
    const trashState = getFeedbackFilterState({
      items,
      statusView: "trash",
      targetGroup: "explanations",
      priority: "low",
      adminEmail,
    });

    expect(openState.visibleItems).toHaveLength(1);
    expect(trashState.visibleItems).toHaveLength(1);
    expect(openState.visibleItems[0].id).toBe("vote-group:section:limits:intro:open");
    expect(trashState.visibleItems[0].id).toBe("vote-group:section:limits:intro:trash");
  });
});
