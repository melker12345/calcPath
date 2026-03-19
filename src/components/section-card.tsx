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
  <div
    className="group rounded-xl bg-white p-5 transition-shadow hover:shadow-md sm:rounded-2xl sm:p-6"
    style={{
      border: "1.5px solid #dbeafe",
      boxShadow: "3px 3px 0 rgba(147,197,253,0.12)",
    }}
  >
    <div className="mb-4">
      <h3 className="text-lg font-bold text-[#1e293b]">{title}</h3>
      {description && (
        <p className="mt-1 text-sm leading-relaxed text-[#64748b]">{description}</p>
      )}
    </div>
    {children}
  </div>
);
