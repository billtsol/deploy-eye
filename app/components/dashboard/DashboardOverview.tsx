import { Activity, Cloud, Layers3, TrainFront } from "lucide-react";
import type { DashboardData } from "@/lib/types";

interface DashboardOverviewProps {
  data: DashboardData;
}

export function DashboardOverview({ data }: DashboardOverviewProps) {
  const cards = [
    { label: "Latest production", value: data.totals.deployments, icon: Activity },
    { label: "Accounts", value: data.totals.accounts, icon: Layers3 },
    { label: "Railway", value: data.totals.railway, icon: TrainFront },
    { label: "Vercel", value: data.totals.vercel, icon: Cloud },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">{card.label}</p>
              <Icon className="h-4 w-4 text-muted" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-foreground">{card.value}</p>
          </div>
        );
      })}
    </section>
  );
}
