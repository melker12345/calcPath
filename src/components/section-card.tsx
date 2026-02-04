"use client";

import { ReactNode } from "react";

export const SectionCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) => (
  <div className="rounded-2xl border border-zinc-200/50 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-900/80">
    <div className="mb-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      )}
    </div>
    {children}
  </div>
);
