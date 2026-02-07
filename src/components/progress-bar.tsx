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
        <div className="flex items-center justify-between text-xs text-zinc-600">
          <span>{label}</span>
          <span className="font-medium text-zinc-800">
            {Math.round(clamped)}%
          </span>
        </div>
      ) : null}
      <div className="h-2 w-full rounded-full bg-orange-100">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-rose-400"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
