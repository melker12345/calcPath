"use client";

import Link from "next/link";
import { topics } from "@/lib/content";
import { modules } from "@/lib/modules";
import { SectionCard } from "@/components/section-card";

export default function ModulesPage() {
  const available = topics.filter((topic) =>
    modules.some((module) => module.topicId === topic.id),
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Calculus modules</h1>
        <p className="text-sm text-zinc-500">
          Read the lesson, follow the examples, then practice.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {available.map((topic) => (
          <SectionCard
            key={topic.id}
            title={topic.title}
            description={topic.description}
          >
            <p className="text-sm text-zinc-500">
              {topic.estimatedMinutes} min lesson · Practice included
            </p>
            <div className="mt-4 flex gap-2">
              <Link className="btn-primary" href={`/modules/${topic.id}`}>
                Open module
              </Link>
              <Link className="btn-secondary" href={`/practice/${topic.id}`}>
                Practice only
              </Link>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
