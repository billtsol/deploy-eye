import { ArrowRight, GitBranch, Globe2, Server } from "lucide-react";
import Link from "next/link";
import { absoluteDate, relativeTime } from "@/lib/format";
import type { DeploymentSummary } from "@/lib/types";
import { PlatformMark } from "./PlatformMark";
import { StatusBadge } from "./StatusBadge";

interface DeploymentCardProps {
  deployment: DeploymentSummary;
}

export function DeploymentCard({ deployment }: DeploymentCardProps) {
  const detailHref = `/deployments/${deployment.platform}/${deployment.tokenIndex}/${encodeURIComponent(deployment.id)}`;
  const primaryDomain = deployment.customDomains[0] ?? deployment.generatedDomains[0];

  return (
    <Link
      href={detailHref}
      className="group block rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
    >
      <article className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <PlatformMark platform={deployment.platform} />
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-[var(--foreground)]">{deployment.projectName}</h3>
              <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-[var(--muted)]">
                <Server className="h-3.5 w-3.5 shrink-0" />
                {deployment.serviceName ?? deployment.platform}
              </p>
            </div>
          </div>
          <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--foreground)]" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={deployment.status} />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-medium text-[var(--muted-strong)]">
            <GitBranch className="h-3.5 w-3.5" />
            {deployment.environment}
          </span>
        </div>

        <div className="space-y-2 border-t border-[var(--border)] pt-3">
          {primaryDomain ? (
            <p className="flex min-w-0 items-center gap-2 text-sm text-[var(--muted)]">
              <Globe2 className="h-4 w-4 shrink-0" />
              <span className="truncate">{primaryDomain}</span>
            </p>
          ) : (
            <p className="text-sm text-[var(--muted)]">No public URL detected</p>
          )}
          {deployment.customDomains.length > 0 ? (
            <p className="text-xs text-[var(--muted)]">{deployment.customDomains.length} custom domain{deployment.customDomains.length === 1 ? "" : "s"}</p>
          ) : (
            <p className="text-xs text-[var(--muted)]">No custom domain</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
          <span>{relativeTime(deployment.createdAt)}</span>
          <span>{absoluteDate(deployment.createdAt)}</span>
        </div>
      </article>
    </Link>
  );
}
