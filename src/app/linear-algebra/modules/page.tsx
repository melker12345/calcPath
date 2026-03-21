"use client";

import Link from "next/link";
import { topics } from "@/lib/linalg-content";
import { modules } from "@/lib/linalg-modules";

const C = {
  text: "#e2e8f0",
  muted: "rgba(226,232,240,0.58)",
  blue: "#3372A2",
  card: "rgba(255,255,255,0.035)",
  border: "rgba(51,114,162,0.28)",
};

export default function LinalgModulesPage() {
  const available = topics.filter((topic) =>
    modules.some((m) => m.topicId === topic.id),
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 sm:mb-10">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color: C.blue }}>
          Linear Algebra
        </p>
        <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: C.text }}>All modules</h1>
        <p className="mt-1.5 text-sm sm:text-base" style={{ color: C.muted }}>
          Read the lesson, follow the worked examples, then practice.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
        {available.map((topic, i) => {
          const chapterNum = String(i + 1).padStart(2, "0");
          return (
            <div
              key={topic.id}
              className="flex flex-col rounded-xl p-5 sm:rounded-2xl sm:p-6"
              style={{ background: C.card, border: `1.5px solid ${C.border}`, borderLeft: `3px solid ${C.blue}` }}
            >
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: C.blue }}>
                Chapter {chapterNum}
              </span>
              <h3
                className="mt-1 text-base font-semibold leading-snug sm:text-[1.05rem]"
                style={{ color: C.text }}
              >
                {topic.title}
              </h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed" style={{ color: C.muted }}>
                {topic.description}
              </p>
              <p className="mt-3 text-xs" style={{ color: C.muted }}>
                {topic.estimatedMinutes} min
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link className="btn-linalg-primary" href={`/linear-algebra/modules/${topic.id}`}>
                  Open module
                </Link>
                <Link className="btn-linalg-secondary" href={`/linear-algebra/practice/${topic.id}`}>
                  Practice
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
