import type { ReportRow } from "@/lib/reports";

/**
 * Renders a report as a self-contained markdown brief that an LLM can act on
 * without asking anything: where the item lives, what it says now, what the
 * learner did, what they reported, and what to run afterwards.
 *
 * Pure functions; used by the admin inbox (copy / download) and testable with
 * `npx tsx`.
 */

function fence(body: string, lang = ""): string {
  // Pick a fence longer than any run of backticks inside the body.
  const longest = Math.max(2, ...[...body.matchAll(/`+/g)].map((m) => m[0].length));
  const f = "`".repeat(longest + 1);
  return `${f}${lang}\n${body}\n${f}`;
}

function when(iso: string): string {
  return iso.replace("T", " ").replace(/\.\d+Z$/, "Z");
}

export function reportHeading(r: ReportRow): string {
  const parts: string[] = [r.kind];
  if (r.subject) parts.push(r.subject + (r.topic_id ? `/${r.topic_id}` : ""));
  if (r.section) parts.push(`§${r.section}`);
  if (r.question_id) parts.push(r.question_id);
  parts.push(when(r.created_at));
  return parts.join(" · ");
}

export function reportToMarkdown(r: ReportRow): string {
  const out: string[] = [];
  out.push(`## Report ${r.id.slice(0, 8)} — ${reportHeading(r)}`);
  out.push("");
  out.push(`- Reported: ${when(r.created_at)}`);
  out.push(`- Status: ${r.status}`);
  out.push(`- Reason: ${r.reason}`);
  if (r.page_url) out.push(`- Page: ${r.page_url}`);

  const s = r.snapshot;
  if (s?.kind === "question") {
    out.push(`- Subject: ${s.subjectLabel} (\`${r.subject}\`)`);
    out.push(`- Chapter: ${s.topicTitle} (\`${r.topic_id}\`)`);
    out.push(`- Section: ${s.sectionTitle ?? "?"} (\`${s.sectionSlug}\`)`);
    out.push(`- File: \`${s.file}\``);
    out.push(`- Question id: \`${s.question.id}\` (type ${s.question.type}, ${s.question.difficulty})`);
    out.push("");
    out.push("### Stored question (verbatim at report time)");
    out.push("");
    out.push("Prompt:");
    out.push(fence(s.question.prompt));
    if (s.question.choices?.length) {
      out.push("Choices:");
      out.push(fence(s.question.choices.map((c, i) => `${String.fromCharCode(65 + i)}. ${c}`).join("\n")));
    }
    out.push("Stored answer:");
    out.push(fence(s.question.answer));
    out.push("Explanation:");
    out.push(fence(s.question.explanation));
  } else if (s?.kind === "chapter") {
    out.push(`- Subject: ${s.subjectLabel} (\`${r.subject}\`)`);
    out.push(`- Chapter: ${s.topicTitle} (\`${r.topic_id}\`)`);
    if (s.sectionSlug) out.push(`- Section: ${s.sectionTitle ?? "?"} (\`${s.sectionSlug}\`)`);
    out.push(`- File: \`${s.file}\``);
    if (s.sectionSource) {
      out.push("");
      out.push(`### Section source (verbatim at report time${s.sectionSourceTruncated ? ", truncated" : ""})`);
      out.push("");
      out.push(fence(s.sectionSource, "mdx"));
    }
  } else if (r.kind !== "site") {
    if (r.subject) out.push(`- Subject: \`${r.subject}\``);
    if (r.topic_id) out.push(`- Chapter: \`${r.topic_id}\``);
    if (r.section) out.push(`- Section: \`${r.section}\``);
    if (r.question_id) out.push(`- Question id: \`${r.question_id}\``);
    out.push("- (No content snapshot was captured for this report.)");
  }

  const l = r.learner;
  if (l && Object.keys(l).length > 0) {
    out.push("");
    out.push("### What the learner did");
    out.push("");
    const { submissions, hintUsed, solutionShown, ...rest } = l;
    if (Array.isArray(submissions) && submissions.length > 0) {
      out.push("| # | Typed | Graded |");
      out.push("|---|---|---|");
      submissions.forEach((sub, i) => {
        const typed = String(sub.input ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
        out.push(`| ${i + 1} | \`${typed}\` | ${sub.gradedCorrect ? "correct" : "incorrect"} |`);
      });
    } else if (Array.isArray(submissions)) {
      out.push("- No answer was submitted before reporting.");
    }
    if (hintUsed !== undefined) out.push(`- Hint used: ${hintUsed ? "yes" : "no"}`);
    if (solutionShown !== undefined) out.push(`- Solution shown: ${solutionShown ? "yes" : "no"}`);
    const extra = Object.fromEntries(
      Object.entries(rest).filter(([k]) => !["questionId", "questionType", "section", "expectedAnswer"].includes(k)),
    );
    if (Object.keys(extra).length > 0) {
      out.push("- Other context:");
      out.push(fence(JSON.stringify(extra, null, 2), "json"));
    }
  }

  out.push("");
  out.push("### Learner's report");
  out.push("");
  out.push(`Reason: **${r.reason}**`);
  out.push("");
  out.push(r.message?.trim() ? fence(r.message.trim()) : "_No message._");

  out.push("");
  if (s?.kind === "question") {
    out.push(
      `Task: verify the mathematics independently, then fix the question in \`${s.file}\` (id \`${s.question.id}\`; keep the id stable; if the stored answer is right, improve the explanation or the prompt instead). Then run \`npm run content:validate && npm run content:answers\`.`,
    );
  } else if (s?.kind === "chapter") {
    out.push(
      `Task: verify the mathematics independently, then fix the section in \`${s.file}\`${s.sectionSlug ? ` (section \`${s.sectionSlug}\`; keep the slug and any \`{#anchor}\` ids stable)` : ""}. Then run \`npm run content:validate && npm run content:latex && npm run content:audit\`.`,
    );
  } else {
    out.push("Task: reproduce and fix; if it is a content problem, locate the file under `content/` first.");
  }
  return out.join("\n");
}

export function reportsToMarkdown(rows: ReportRow[], title = "CalcPath reports"): string {
  const head = [
    `# ${title}`,
    "",
    `${rows.length} report${rows.length === 1 ? "" : "s"}, exported ${when(new Date().toISOString())}.`,
    "Each report is self-contained: location, file, the content as stored when it was reported, what the learner did, and what they said.",
    "",
  ];
  return head.concat(rows.map(reportToMarkdown)).join("\n") + "\n";
}
