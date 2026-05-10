"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RefreshButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  function refresh() {
    setIsRefreshing(true);
    router.refresh();
    window.setTimeout(() => setIsRefreshing(false), 800);
  }

  return (
    <button
      type="button"
      onClick={refresh}
      disabled={isRefreshing}
      className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-foreground shadow-sm transition hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-60"
      title="Refresh deployments"
      aria-label="Refresh deployments"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
    </button>
  );
}
