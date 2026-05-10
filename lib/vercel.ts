import { accountId, readTokenList, tokenLabel } from "./env";
import { durationBetween, withHttps } from "./format";
import type {
  AccountGroup,
  DeploymentDetail,
  DeploymentSummary,
} from "./types";

const VERCEL_API = "https://api.vercel.com";

interface VercelUserResponse {
  user?: {
    id?: string;
    email?: string;
    name?: string;
    username?: string;
  };
}

interface VercelDeploymentApi {
  uid?: string;
  id?: string;
  name?: string;
  projectId?: string;
  url?: string | null;
  created?: number;
  createdAt?: number;
  buildingAt?: number;
  ready?: number;
  state?: string;
  readyState?: string;
  target?: string | null;
  source?: string;
  inspectorUrl?: string;
  readySubstate?: string;
  checksConclusion?: string;
  errorMessage?: string | null;
}

interface VercelProjectApi {
  id?: string;
  name?: string;
}

interface VercelProjectsResponse {
  projects?: VercelProjectApi[];
}

interface VercelDeploymentsResponse {
  deployments?: VercelDeploymentApi[];
  error?: {
    message?: string;
  };
}

interface VercelAliasesResponse {
  aliases?: Array<{
    alias?: string;
  }>;
}

export async function getVercelAccounts(): Promise<AccountGroup[]> {
  const tokens = readTokenList("DEPLOY_EYE_TOKEN_VERCEL");

  if (tokens.length === 0) {
    return [
      {
        id: "vercel-missing",
        platform: "vercel",
        tokenIndex: 0,
        label: "Vercel",
        tokenLabel: "DEPLOY_EYE_TOKEN_VERCEL",
        deployments: [],
        error: "DEPLOY_EYE_TOKEN_VERCEL is not configured.",
      },
    ];
  }

  return Promise.all(
    tokens.map((token, index) => getVercelAccount(token, index)),
  );
}

export async function getVercelDeploymentDetail(
  tokenIndex: number,
  deploymentId: string,
): Promise<DeploymentDetail | null> {
  const token = readTokenList("DEPLOY_EYE_TOKEN_VERCEL")[tokenIndex];

  if (!token) {
    return null;
  }

  const [user, deployment, aliases] = await Promise.all([
    getVercelUser(token),
    vercelFetch<VercelDeploymentApi>(
      token,
      `/v13/deployments/${encodeURIComponent(deploymentId)}`,
    ),
    getDeploymentAliases(token, deploymentId),
  ]);

  if (!deployment || (!deployment.uid && !deployment.id)) {
    return null;
  }

  const accountLabel =
    user?.user?.name ||
    user?.user?.username ||
    user?.user?.email ||
    `Vercel ${tokenIndex + 1}`;
  const summary = mapDeployment(deployment, aliases, tokenIndex, accountLabel);
  const buildTime = durationBetween(summary.buildStartedAt, summary.readyAt);

  return {
    ...summary,
    metrics: [],
    facts: [
      { label: "Project", value: summary.projectName },
      { label: "Environment", value: summary.environment },
      { label: "Build time", value: buildTime ?? "Not available" },
      {
        label: "Aliases",
        value: String(
          summary.generatedDomains.length + summary.customDomains.length,
        ),
      },
      { label: "Checks", value: summary.checksConclusion ?? "Not available" },
      { label: "Ready state", value: summary.readySubstate ?? summary.status },
    ],
  };
}

async function getVercelAccount(
  token: string,
  index: number,
): Promise<AccountGroup> {
  const label = tokenLabel(token, index);

  try {
    const [user, latestDeployments] = await Promise.all([
      getVercelUser(token),
      getLatestDeploymentsByProject(token),
    ]);

    const accountLabel =
      user?.user?.name ||
      user?.user?.username ||
      user?.user?.email ||
      `Vercel ${index + 1}`;
    const accountSubtitle =
      user?.user?.email && user.user.email !== accountLabel
        ? user.user.email
        : undefined;
    const aliasesByDeployment = await Promise.all(
      latestDeployments.map(async (deployment) => ({
        id: deployment.uid || deployment.id || "",
        aliases: await getDeploymentAliases(
          token,
          deployment.uid || deployment.id || "",
        ),
      })),
    );

    const aliasMap = new Map(
      aliasesByDeployment.map(({ id, aliases }) => [id, aliases]),
    );
    const deployments = latestDeployments
      .map((deployment) =>
        mapDeployment(
          deployment,
          aliasMap.get(deployment.uid || deployment.id || "") ?? [],
          index,
          accountLabel,
        ),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    return {
      id: accountId("vercel", token, index),
      platform: "vercel",
      tokenIndex: index,
      label: accountLabel,
      subtitle: accountSubtitle,
      tokenLabel: label,
      deployments,
    };
  } catch (error) {
    return {
      id: accountId("vercel", token, index),
      platform: "vercel",
      tokenIndex: index,
      label: `Vercel ${index + 1}`,
      tokenLabel: label,
      deployments: [],
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch Vercel deployments.",
    };
  }
}

async function getLatestDeploymentsByProject(
  token: string,
): Promise<VercelDeploymentApi[]> {
  try {
    const projectsResponse = await vercelFetch<VercelProjectsResponse>(
      token,
      "/v10/projects?limit=100",
    );
    const projects = (projectsResponse.projects ?? []).filter(
      (project) => project.id || project.name,
    );

    if (projects.length === 0) {
      return [];
    }

    const deployments = await mapLimit(projects, 6, async (project) => {
      const projectId = project.id || project.name;
      if (!projectId) {
        return null;
      }

      const response = await vercelFetch<VercelDeploymentsResponse>(
        token,
        `/v6/deployments?target=production&limit=1&projectId=${encodeURIComponent(projectId)}`,
      ).catch(() => null);
      if (!response) {
        return null;
      }
      const deployment = latestProductionDeployments(
        response.deployments ?? [],
      )[0];

      if (!deployment) {
        return null;
      }

      return {
        ...deployment,
        ...((deployment.name ?? project.name)
          ? { name: deployment.name ?? project.name }
          : {}),
        ...((deployment.projectId ?? project.id)
          ? { projectId: deployment.projectId ?? project.id }
          : {}),
      };
    });

    return deployments.filter((deployment): deployment is VercelDeploymentApi =>
      Boolean(deployment),
    );
  } catch {
    const deploymentsResponse = await vercelFetch<VercelDeploymentsResponse>(
      token,
      "/v6/deployments?target=production&limit=100",
    );
    return latestProductionDeployments(deploymentsResponse.deployments ?? []);
  }
}

function latestProductionDeployments(
  deployments: VercelDeploymentApi[],
): VercelDeploymentApi[] {
  const sorted = deployments
    .filter(
      (deployment) => (deployment.target ?? "production") === "production",
    )
    .filter((deployment) => Boolean(deployment.uid || deployment.id))
    .sort((a, b) => deploymentTime(b) - deploymentTime(a));

  const byProject = new Map<string, VercelDeploymentApi>();

  for (const deployment of sorted) {
    const projectKey =
      deployment.projectId ||
      deployment.name ||
      deployment.uid ||
      deployment.id;
    if (projectKey && !byProject.has(projectKey)) {
      byProject.set(projectKey, deployment);
    }
  }

  return Array.from(byProject.values());
}

function mapDeployment(
  deployment: VercelDeploymentApi,
  aliases: string[],
  tokenIndex: number,
  accountLabel: string,
): DeploymentSummary {
  const id = deployment.uid || deployment.id || "";
  const url = deployment.url ? withHttps(deployment.url) : undefined;
  const normalizedAliases = aliases.map((alias) => alias.toLowerCase());
  const generatedDomains = uniqueDomains([
    ...(deployment.url ? [deployment.url] : []),
    ...normalizedAliases.filter((alias) => alias.endsWith(".vercel.app")),
  ]);
  const customDomains = uniqueDomains(
    normalizedAliases.filter((alias) => !alias.endsWith(".vercel.app")),
  );

  return {
    id,
    platform: "vercel",
    tokenIndex,
    accountLabel,
    projectId: deployment.projectId,
    projectName: deployment.name || "Unknown Vercel project",
    environment: deployment.target || "production",
    status: deployment.state || deployment.readyState || "UNKNOWN",
    createdAt:
      timestampToIso(deployment.createdAt ?? deployment.created) ??
      new Date().toISOString(),
    url,
    generatedDomains,
    customDomains,
    source: deployment.source,
    inspectorUrl: deployment.inspectorUrl,
    buildStartedAt: timestampToIso(deployment.buildingAt),
    readyAt: timestampToIso(deployment.ready),
    readySubstate: deployment.readySubstate,
    checksConclusion: deployment.checksConclusion,
    errorMessage: deployment.errorMessage ?? undefined,
  };
}

async function getVercelUser(
  token: string,
): Promise<VercelUserResponse | null> {
  try {
    return await vercelFetch<VercelUserResponse>(token, "/v2/user");
  } catch {
    return null;
  }
}

async function getDeploymentAliases(
  token: string,
  deploymentId: string,
): Promise<string[]> {
  if (!deploymentId) {
    return [];
  }

  try {
    const response = await vercelFetch<VercelAliasesResponse>(
      token,
      `/v2/deployments/${encodeURIComponent(deploymentId)}/aliases`,
    );
    return uniqueDomains(
      (response?.aliases ?? [])
        .map((alias) => alias.alias)
        .filter((alias): alias is string => Boolean(alias)),
    );
  } catch {
    return [];
  }
}

async function vercelFetch<T>(token: string, path: string): Promise<T> {
  const response = await fetch(`${VERCEL_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Vercel API error: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as T;
}

function timestampToIso(value?: number): string | undefined {
  if (!value) {
    return undefined;
  }

  return new Date(value).toISOString();
}

function deploymentTime(deployment: VercelDeploymentApi): number {
  return deployment.createdAt ?? deployment.created ?? 0;
}

function uniqueDomains(domains: string[]): string[] {
  return Array.from(new Set(domains.filter(Boolean)));
}

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  const queue = [...items];

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      if (item !== undefined) {
        results.push(await mapper(item));
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
  return results;
}
