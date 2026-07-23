"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Range = "all" | "7d" | "30d";

type Summary = {
  visitors: number;
  sessions: number;
  pageviews: number;
  avg_session_ms: number;
};
type DailyRow = {
  day: string;
  visitors: number;
  sessions: number;
  pageviews: number;
  avg_session_ms: number;
};
type TopPath = { path: string; views: number };
type MetricsData = { range: Range; summary: Summary; daily: DailyRow[]; topPaths: TopPath[] };

const RANGES: { key: Range; label: string }[] = [
  { key: "all", label: "All time" },
  { key: "30d", label: "Last 30 days" },
  { key: "7d", label: "Last 7 days" },
];

function formatDuration(ms: number): string {
  const s = Math.round((ms || 0) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

const num = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);

export function AdminMetricsPanel() {
  const [range, setRange] = useState<Range>("all");
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAccessDenied(false);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setAccessDenied(true);
        return;
      }
      const res = await fetch(`/api/metrics?range=${range}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403 || res.status === 401) {
        setAccessDenied(true);
        return;
      }
      if (!res.ok) throw new Error("Failed to load");
      const json = (await res.json()) as MetricsData;
      setData({
        range: json.range,
        summary: {
          visitors: num(json.summary?.visitors),
          sessions: num(json.summary?.sessions),
          pageviews: num(json.summary?.pageviews),
          avg_session_ms: num(json.summary?.avg_session_ms),
        },
        daily: (json.daily ?? []).map((d) => ({
          day: String(d.day).slice(0, 10),
          visitors: num(d.visitors),
          sessions: num(d.sessions),
          pageviews: num(d.pageviews),
          avg_session_ms: num(d.avg_session_ms),
        })),
        topPaths: (json.topPaths ?? []).map((p) => ({
          path: p.path,
          views: num(p.views),
        })),
      });
    } catch {
      setError("Failed to load metrics.");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
            Admin
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-zinc-900">
            Usage metrics
          </h1>
        </div>
        <div className="flex gap-1 rounded-xl border border-zinc-200 bg-white p-1 text-sm">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                range === r.key
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {accessDenied ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          Not authorized. You must be signed in as an admin account to view
          metrics.
        </div>
      ) : error ? (
        <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {error}
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Unique visitors" value={data?.summary.visitors ?? 0} loading={loading} />
            <StatCard label="Sessions" value={data?.summary.sessions ?? 0} loading={loading} />
            <StatCard label="Page views" value={data?.summary.pageviews ?? 0} loading={loading} />
            <StatCard
              label="Avg. session"
              value={data ? formatDuration(data.summary.avg_session_ms) : "—"}
              loading={loading}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Visitors per day">
              <SeriesChart
                points={(data?.daily ?? []).map((d) => ({ day: d.day, value: d.visitors }))}
                format={(n) => String(Math.round(n))}
                color="#4f46e5"
              />
            </ChartCard>
            <ChartCard title="Avg. session time per day">
              <SeriesChart
                points={(data?.daily ?? []).map((d) => ({ day: d.day, value: d.avg_session_ms }))}
                format={formatDuration}
                color="#059669"
              />
            </ChartCard>
            <ChartCard title="Page views per day">
              <SeriesChart
                points={(data?.daily ?? []).map((d) => ({ day: d.day, value: d.pageviews }))}
                format={(n) => String(Math.round(n))}
                color="#0891b2"
              />
            </ChartCard>
            <ChartCard title="Top pages">
              <HBars items={(data?.topPaths ?? []).map((p) => ({ label: p.path, value: p.views }))} />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: number | string;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900">
        {loading ? "…" : value}
      </p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="mb-3 text-sm font-semibold text-zinc-700">{title}</p>
      {children}
    </div>
  );
}

function ChartEmpty() {
  return (
    <div className="flex h-40 items-center justify-center text-sm text-zinc-400">
      No data yet
    </div>
  );
}

function SeriesChart({
  points,
  format,
  color = "#4f46e5",
}: {
  points: { day: string; value: number }[];
  format: (n: number) => string;
  color?: string;
}) {
  const W = 720;
  const H = 220;
  const padL = 52;
  const padR = 14;
  const padT = 14;
  const padB = 30;
  if (points.length === 0) return <ChartEmpty />;

  const maxV = Math.max(...points.map((p) => p.value), 1);
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const n = points.length;
  const x = (i: number) => padL + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => padT + innerH - (v / maxV) * innerH;

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.value)}`).join(" ");
  const area = `${line} L${x(n - 1)},${padT + innerH} L${x(0)},${padT + innerH} Z`;
  const ticks = [0, maxV / 2, maxV];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="#e4e4e7" strokeWidth={1} />
          <text x={padL - 8} y={y(t) + 3} textAnchor="end" fontSize="11" fill="#a1a1aa">
            {format(t)}
          </text>
        </g>
      ))}
      <path d={area} fill={color} opacity={0.08} />
      <path d={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
      {n <= 1 && <circle cx={x(0)} cy={y(points[0].value)} r={3} fill={color} />}
      <text x={padL} y={H - 8} fontSize="11" fill="#a1a1aa" textAnchor="start">
        {points[0].day.slice(5)}
      </text>
      {n > 1 && (
        <text x={W - padR} y={H - 8} fontSize="11" fill="#a1a1aa" textAnchor="end">
          {points[n - 1].day.slice(5)}
        </text>
      )}
    </svg>
  );
}

function HBars({ items }: { items: { label: string; value: number }[] }) {
  if (items.length === 0) return <ChartEmpty />;
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-40 shrink-0 truncate text-xs text-zinc-600" title={it.label}>
            {it.label}
          </div>
          <div className="relative h-5 flex-1 overflow-hidden rounded bg-zinc-100">
            <div
              className="absolute inset-y-0 left-0 rounded bg-indigo-500/80"
              style={{ width: `${(it.value / max) * 100}%` }}
            />
          </div>
          <div className="w-12 shrink-0 text-right text-xs font-semibold tabular-nums text-zinc-700">
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}
