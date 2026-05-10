import type { DeploymentStatusTone } from "./types";

export function absoluteDate(value?: string): string {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function relativeTime(value?: string): string {
  if (!value) {
    return "Unknown";
  }

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return "Unknown";
  }

  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ago`;
  }

  if (hours > 0) {
    return `${hours}h ago`;
  }

  if (minutes > 0) {
    return `${minutes}m ago`;
  }

  return "just now";
}

export function statusTone(status: string): DeploymentStatusTone {
  const normalized = status.toUpperCase();

  if (["READY", "SUCCESS"].includes(normalized)) {
    return "success";
  }

  if (["BUILDING", "DEPLOYING", "INITIALIZING", "QUEUED", "WAITING"].includes(normalized)) {
    return "warning";
  }

  if (["ERROR", "FAILED", "CRASHED", "CANCELED", "REMOVED"].includes(normalized)) {
    return "danger";
  }

  return "neutral";
}

export function durationBetween(start?: string, end?: string): string | undefined {
  if (!start || !end) {
    return undefined;
  }

  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();

  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs < startMs) {
    return undefined;
  }

  const seconds = Math.round((endMs - startMs) / 1000);
  const minutes = Math.floor(seconds / 60);

  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }

  return `${seconds}s`;
}

export function compactNumber(value: number): string {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: value >= 10 ? 1 : 2,
  }).format(value);
}

export function withHttps(domain: string): string {
  if (/^https?:\/\//i.test(domain)) {
    return domain;
  }

  return `https://${domain}`;
}
