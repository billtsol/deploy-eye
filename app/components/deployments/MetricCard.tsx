import { compactNumber } from "@/lib/format";
import type { MetricSeries } from "@/lib/types";

interface MetricCardProps {
  metric: MetricSeries;
}

export function MetricCard({ metric }: MetricCardProps) {
  const max = Math.max(...metric.points.map((point) => point.value), 0);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <p className="text-sm font-medium text-[var(--muted)]">{metric.label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
        {metric.value === undefined ? "No data" : `${compactNumber(metric.value)} ${metric.unit}`}
      </p>
      <div className="mt-4 flex h-10 items-end gap-1" aria-hidden="true">
        {metric.points.length > 0 ? (
          metric.points.slice(-18).map((point) => (
            <span
              key={`${metric.label}-${point.timestamp}`}
              className="min-w-1 flex-1 rounded-sm bg-[var(--accent-soft)]"
              style={{ height: `${Math.max(8, max > 0 ? (point.value / max) * 100 : 8)}%` }}
            />
          ))
        ) : (
          <span className="h-px w-full bg-[var(--border)]" />
        )}
      </div>
      <p className="mt-3 text-xs text-[var(--muted)]">Last hour</p>
    </div>
  );
}
