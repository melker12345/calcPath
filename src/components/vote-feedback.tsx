"use client";

import { useParams } from "next/navigation";
import { ReportIssue } from "@/components/report-issue";

/**
 * @deprecated Transitional adapter. The old vote/report widget is gone; this
 * keeps the two remaining call sites (chapter page, practice feedback) working
 * by mapping their props onto <ReportIssue>. Delete this file once both import
 * ReportIssue directly.
 */
export function VoteFeedback({
  targetType,
  targetId,
  reportContext,
}: {
  targetType: string;
  targetId: string;
  userId?: string;
  reportContext?: Record<string, unknown>;
}) {
  const params = useParams<{ subject?: string; topicId?: string }>();
  const subject = params?.subject;
  const topicId = params?.topicId;
  if (!subject || !topicId) return null;

  if (targetType === "problem") {
    const section = typeof reportContext?.section === "string" ? reportContext.section : undefined;
    return (
      <ReportIssue
        target={{ kind: "question", subject, topicId, questionId: targetId, section }}
        context={reportContext}
      />
    );
  }
  return <ReportIssue target={{ kind: "chapter", subject, topicId }} />;
}
