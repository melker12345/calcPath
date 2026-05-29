"use client";

import { useProgress } from "@/components/progress-provider";

export function ModuleDoneButton({ moduleId }: { moduleId: string }) {
  const { progress, markModuleDone } = useProgress();
  const isDone = progress.completedModuleIds.includes(moduleId);
  const completedAt = progress.moduleCompletions[moduleId];

  return (
    <div className="border border-stone-300 bg-[#fffef8] p-4 module-done-box" data-no-print>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="done-text text-sm font-semibold text-stone-950">
            {isDone ? "Chapter marked done" : "Finished reading this chapter?"}
          </p>
          <p className="done-subtext mt-1 text-sm text-stone-600">
            {isDone && completedAt
              ? `Completed ${new Date(completedAt).toLocaleDateString()}.`
              : "Mark it done to track reading progress."}
          </p>
        </div>
        <button
          type="button"
          disabled={isDone}
          onClick={() => markModuleDone(moduleId)}
          className="inline-flex justify-center border border-stone-400 bg-white px-4 py-2 text-sm font-medium text-stone-900 transition hover:bg-stone-100 disabled:cursor-default disabled:border-stone-300 disabled:bg-stone-100 disabled:text-stone-500"
        >
          {isDone ? "Done" : "Mark done"}
        </button>
      </div>
    </div>
  );
}
