"use client";

import { Eye, EyeOff } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "deploy-eye-hide-private";
const CHANGE_EVENT = "deploy-eye-privacy-change";

export function PrivacyToggle() {
  const isHidden = useSyncExternalStore(subscribePrivacy, getPrivacySnapshot, getServerPrivacySnapshot);
  const Icon = isHidden ? EyeOff : Eye;

  useEffect(() => {
    document.documentElement.classList.toggle("privacy-hidden", isHidden);
  }, [isHidden]);

  function togglePrivacy() {
    const nextValue = !isHidden;
    window.localStorage.setItem(STORAGE_KEY, String(nextValue));
    document.documentElement.classList.toggle("privacy-hidden", nextValue);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return (
    <button
      type="button"
      onClick={togglePrivacy}
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface shadow-sm transition hover:border-border-strong"
      title={isHidden ? "Show project and account names" : "Hide project and account names"}
      aria-label={isHidden ? "Show project and account names" : "Hide project and account names"}
      aria-pressed={isHidden}
    >
      <Icon className="h-5 w-5 text-accent" />
    </button>
  );
}

function subscribePrivacy(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getPrivacySnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

function getServerPrivacySnapshot() {
  return false;
}
