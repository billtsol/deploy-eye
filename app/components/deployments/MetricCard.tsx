"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { compactNumber } from "@/lib/format";
import type { MetricSeries } from "@/lib/types";

interface MetricCardProps {
  metric: MetricSeries;
}

export function MetricCard({ metric }: MetricCardProps) {
  const data = metric.points.slice(-24).map((point) => ({
    time: formatChartTime(point.timestamp),
    value: point.value,
  }));

  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {metric.value === undefined ? "No data" : `${compactNumber(metric.value)} ${metric.unit}`}
          </p>
        </div>
        <p className="rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-muted">Last hour</p>
      </div>

      <div className="mt-4 h-32 min-h-32 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                tickFormatter={(value) => compactNumber(Number(value))}
                width={34}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--foreground)",
                  fontSize: "12px",
                }}
                formatter={(value) => [`${compactNumber(Number(value))} ${metric.unit}`, metric.label]}
                labelStyle={{ color: "var(--muted)" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ fill: "var(--primary)", r: 2 }}
                activeDot={{ r: 4 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted text-sm text-muted">
            No recent samples
          </div>
        )}
      </div>
    </div>
  );
}

function formatChartTime(timestamp: number): string {
  const date = new Date(timestamp > 100000000000 ? timestamp : timestamp * 1000);

  return date.toLocaleTimeString("en", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
