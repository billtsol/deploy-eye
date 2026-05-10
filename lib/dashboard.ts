import { getRailwayAccounts, getRailwayDeploymentDetail } from "./railway";
import { getVercelAccounts, getVercelDeploymentDetail } from "./vercel";
import type { DashboardData, DeploymentDetail, Platform } from "./types";

export async function getDashboardData(): Promise<DashboardData> {
  const [railwayAccounts, vercelAccounts] = await Promise.all([
    getRailwayAccounts(),
    getVercelAccounts(),
  ]);
  const accounts = [...railwayAccounts, ...vercelAccounts];

  return {
    accounts,
    generatedAt: new Date().toISOString(),
    totals: {
      accounts: accounts.length,
      deployments: accounts.reduce((total, account) => total + account.deployments.length, 0),
      railway: railwayAccounts.reduce((total, account) => total + account.deployments.length, 0),
      vercel: vercelAccounts.reduce((total, account) => total + account.deployments.length, 0),
    },
  };
}

export async function getDeploymentDetail(
  platform: Platform,
  tokenIndex: number,
  deploymentId: string,
): Promise<DeploymentDetail | null> {
  if (platform === "railway") {
    return getRailwayDeploymentDetail(tokenIndex, deploymentId);
  }

  return getVercelDeploymentDetail(tokenIndex, deploymentId);
}
