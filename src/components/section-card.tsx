import type { ReactNode } from "react";

export const SectionCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) => (
  <div className="border theme-border theme-surface p-5 sm:p-6">
    <div className="mb-4">
      <h3 className="text-lg font-semibold theme-text">{title}</h3>
      {description && (
        <p className="mt-1 text-sm leading-relaxed theme-text-secondary">{description}</p>
      )}
    </div>
    {children}
  </div>
);
