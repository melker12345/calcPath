"use client";

export function ProgressBar({
  value,
  label,
}: {
  value: number; // 0..100
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="space-y-1">
      {label ? (
        <div className="flex items-center justify-between text-xs theme-text-muted">
          <span>{label}</span>
          <span className="font-medium theme-text">
            {Math.round(clamped)}%
          </span>
        </div>
      ) : null}
      <div className="h-2 w-full rounded-full theme-surface-2">
        <div
          className="h-2 rounded-full transition-all"
          style={{ 
            width: `${clamped}%`,
            background: 'var(--accent)'
          }}
        />
      </div>
    </div>
  );
}
