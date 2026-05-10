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
  const railwayProjectPrivacy = deployment.platform === "railway"
    ? { "data-private": true }
    : {};

  return (
    <Link
      href={detailHref}
      className="group block rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md focus:outline-none focus:ring-2 focus:ring-focus"
    >
      <article className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <PlatformMark platform={deployment.platform} />
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-foreground" {...railwayProjectPrivacy}>
                {deployment.projectName}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted">
                <Server className="h-3.5 w-3.5 shrink-0" />
                {deployment.serviceName ?? deployment.platform}
              </p>
            </div>
          </div>
          <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={deployment.status} />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-muted-strong">
            <GitBranch className="h-3.5 w-3.5" />
            {deployment.environment}
          </span>
        </div>

        <div className="space-y-2 border-t border-border pt-3">
          {primaryDomain ? (
            <p className="flex min-w-0 items-center gap-2 text-sm text-muted">
              <Globe2 className="h-4 w-4 shrink-0" />
              <span className="truncate">{primaryDomain}</span>
            </p>
          ) : (
            <p className="text-sm text-muted">No public URL detected</p>
          )}
          {deployment.customDomains.length > 0 ? (
            <p className="text-xs text-muted">{deployment.customDomains.length} custom domain{deployment.customDomains.length === 1 ? "" : "s"}</p>
          ) : (
            <p className="text-xs text-muted">No custom domain</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-muted">
          <span>{relativeTime(deployment.createdAt)}</span>
          <span>{absoluteDate(deployment.createdAt)}</span>
        </div>
      </article>
    </Link>
  );
}
