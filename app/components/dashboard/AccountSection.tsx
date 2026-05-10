import { AlertTriangle } from "lucide-react";
import type { AccountGroup } from "@/lib/types";
import { DeploymentCard } from "../deployments/DeploymentCard";
import { PlatformMark } from "../deployments/PlatformMark";

interface AccountSectionProps {
  account: AccountGroup;
}

export function AccountSection({ account }: AccountSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <PlatformMark platform={account.platform} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{account.platform}</p>
            <h2 className="text-xl font-semibold text-foreground" data-private>
              {account.label}
            </h2>
            <p className="mt-1 text-sm text-muted" data-private>
              {account.subtitle ?? account.tokenLabel}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded-full border border-border bg-surface-muted px-2.5 py-1">{account.tokenLabel}</span>
          <span className="rounded-full border border-border bg-surface-muted px-2.5 py-1">
            {account.deployments.length} deploy{account.deployments.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {account.error ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{account.error}</p>
        </div>
      ) : null}

      {account.deployments.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {account.deployments.map((deployment) => (
            <DeploymentCard key={`${deployment.platform}-${deployment.tokenIndex}-${deployment.id}`} deployment={deployment} />
          ))}
        </div>
      ) : !account.error ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted">
          No latest production deployments found for this token.
        </div>
      ) : null}
    </section>
  );
}
