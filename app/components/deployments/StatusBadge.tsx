import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { statusTone } from "@/lib/format";

interface StatusBadgeProps {
  status: string;
}

const toneClasses = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  danger: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  neutral: "border-border bg-surface-muted text-muted",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const tone = statusTone(status);
  const Icon = tone === "success" ? CheckCircle2 : tone === "danger" ? XCircle : tone === "warning" ? Loader2 : Circle;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}>
      <Icon className={`h-3.5 w-3.5 ${tone === "warning" ? "animate-spin" : ""}`} />
      {status}
    </span>
  );
}
