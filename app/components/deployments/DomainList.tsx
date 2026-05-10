import { ExternalLink, Globe2 } from "lucide-react";
import { withHttps } from "@/lib/format";

interface DomainListProps {
  generatedDomains: string[];
  customDomains: string[];
  compact?: boolean;
}

export function DomainList({ generatedDomains, customDomains, compact = false }: DomainListProps) {
  const primaryCustom = customDomains[0];
  const primaryGenerated = generatedDomains[0];

  if (!primaryCustom && !primaryGenerated) {
    return <p className="text-sm text-[var(--muted)]">No public URL detected</p>;
  }

  return (
    <div className="space-y-2">
      {primaryGenerated ? (
        <DomainRow label="URL" domain={primaryGenerated} compact={compact} />
      ) : null}
      {primaryCustom ? (
        <DomainRow label="Custom" domain={primaryCustom} compact={compact} />
      ) : (
        <p className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <Globe2 className="h-4 w-4 shrink-0" />
          No custom domain
        </p>
      )}
      {!compact && customDomains.slice(1).map((domain) => <DomainRow key={domain} label="Custom" domain={domain} />)}
    </div>
  );
}

function DomainRow({ label, domain, compact = false }: { label: string; domain: string; compact?: boolean }) {
  return (
    <a
      href={withHttps(domain)}
      target="_blank"
      rel="noreferrer"
      className="group flex min-w-0 items-center gap-2 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
    >
      <span className="shrink-0 rounded-md border border-[var(--border)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-strong)]">
        {label}
      </span>
      <span className={compact ? "truncate" : "break-all"}>{domain}</span>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60 transition group-hover:opacity-100" />
    </a>
  );
}
