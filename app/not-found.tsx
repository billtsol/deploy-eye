import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { PageShell } from "./components/layout/PageShell";

export default function NotFound() {
  return (
    <PageShell>
      <div className="flex min-h-screen items-center justify-center py-12">
        <section className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-sm">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-surface-muted text-accent">
            <Eye className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-accent">404</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal text-foreground">Page not found</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            This deployment view is unavailable or the route no longer exists.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-foreground shadow-sm transition hover:border-border-strong"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to dashboard
          </Link>
        </section>
      </div>
    </PageShell>
  );
}
