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
  <div className="rounded-3xl border-2 border-orange-100 bg-white p-6 shadow-lg">
    <div className="mb-4">
      <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-zinc-600">{description}</p>
      )}
    </div>
    {children}
  </div>
);
