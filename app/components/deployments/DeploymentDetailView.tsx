import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { absoluteDate, relativeTime, withHttps } from "@/lib/format";
import type { DeploymentDetail } from "@/lib/types";
import { DomainList } from "./DomainList";
import { MetricCard } from "./MetricCard";
import { PlatformMark } from "./PlatformMark";
import { StatusBadge } from "./StatusBadge";

interface DeploymentDetailViewProps {
  deployment: DeploymentDetail;
}

export function DeploymentDetailView({ deployment }: DeploymentDetailViewProps) {
  const externalUrl = deployment.url ?? deployment.inspectorUrl;

  return (
    <div className="space-y-6 pb-10">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]">
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <section className="space-y-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-3">
            <PlatformMark platform={deployment.platform} />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{deployment.accountLabel}</p>
              <h2 className="mt-1 break-words text-2xl font-semibold text-[var(--foreground)]">{deployment.projectName}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {deployment.serviceName ?? deployment.platform} · {deployment.environment} · {relativeTime(deployment.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={deployment.status} />
            {externalUrl ? (
              <a
                href={withHttps(externalUrl)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--border-strong)]"
              >
                Open
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {deployment.facts.map((fact) => (
            <div key={fact.label} className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">{fact.label}</p>
              <p className="mt-1 break-words text-sm font-semibold text-[var(--foreground)]">{fact.value}</p>
            </div>
          ))}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Created</p>
            <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{absoluteDate(deployment.createdAt)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {deployment.metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
        {deployment.metrics.length === 0 ? (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)] shadow-sm">
            Runtime CPU and memory are not exposed by this provider endpoint. The summary above shows the useful deployment data available for this deploy.
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-[var(--foreground)]">URLs</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">Generated URL and custom domains assigned to this deployment.</p>
        </div>
        <DomainList generatedDomains={deployment.generatedDomains} customDomains={deployment.customDomains} />
      </section>
    </div>
  );
}
