import type { Platform } from "@/lib/types";

interface PlatformMarkProps {
  platform: Platform;
}

export function PlatformMark({ platform }: PlatformMarkProps) {
  if (platform === "vercel") {
    return (
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--mark-dark)] text-white">
        <svg className="h-4 w-4" viewBox="0 0 76 65" fill="currentColor" aria-hidden="true">
          <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
        </svg>
      </span>
    );
  }

  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--railway-mark)] text-sm font-semibold text-white">
      R
    </span>
  );
}
