import { notFound } from "next/navigation";
import { DeploymentDetailView } from "@/app/components/deployments/DeploymentDetailView";
import { AppHeader } from "@/app/components/layout/AppHeader";
import { PageShell } from "@/app/components/layout/PageShell";
import { getDeploymentDetail } from "@/lib/dashboard";
import type { Platform } from "@/lib/types";

interface DeploymentPageProps {
  params: Promise<{
    platform: string;
    tokenIndex: string;
    deploymentId: string;
  }>;
}

export default async function DeploymentPage({ params }: DeploymentPageProps) {
  const { platform, tokenIndex, deploymentId } = await params;

  if (platform !== "railway" && platform !== "vercel") {
    notFound();
  }

  const parsedTokenIndex = Number(tokenIndex);

  if (!Number.isInteger(parsedTokenIndex) || parsedTokenIndex < 0) {
    notFound();
  }

  const deployment = await getDeploymentDetail(platform as Platform, parsedTokenIndex, decodeURIComponent(deploymentId));

  if (!deployment) {
    notFound();
  }

  return (
    <PageShell>
      <AppHeader />
      <DeploymentDetailView deployment={deployment} />
    </PageShell>
  );
}
