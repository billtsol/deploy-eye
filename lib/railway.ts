import { accountId, readTokenList, tokenLabel } from "./env";
import { withHttps } from "./format";
import type { AccountGroup, DeploymentDetail, DeploymentSummary, MetricSeries } from "./types";

const RAILWAY_API = "https://backboard.railway.com/graphql/v2";

type RailwayAuthMode = "bearer" | "project";

interface GraphQlResponse<T> {
  data?: T;
  errors?: Array<{
    message?: string;
  }>;
}

interface Connection<T> {
  edges?: Array<{
    node?: T;
  }>;
}

interface RailwayProject {
  id: string;
  name: string;
  primaryEnvironmentId?: string | null;
  workspace?: {
    id?: string;
    name?: string;
  } | null;
  environments?: Connection<RailwayEnvironment>;
}

interface RailwayEnvironment {
  id: string;
  name: string;
  serviceInstances?: Connection<RailwayServiceInstance>;
}

interface RailwayServiceInstance {
  serviceId: string;
  serviceName: string;
  domains?: {
    serviceDomains?: Array<{ domain?: string }>;
    customDomains?: Array<{ domain?: string }>;
  };
  latestDeployment?: RailwayDeploymentApi | null;
  activeDeployments?: RailwayDeploymentApi[];
}

interface RailwayDeploymentApi {
  id: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  staticUrl?: string | null;
  url?: string | null;
  projectId?: string;
  serviceId?: string | null;
  environmentId?: string;
  service?: {
    id?: string;
    name?: string;
    project?: {
      id?: string;
      name?: string;
    };
  };
  environment?: {
    id?: string;
    name?: string;
  };
}

interface RailwayDashboardResponse {
  projects?: Connection<RailwayProject>;
}

interface RailwayProjectTokenResponse {
  projectToken?: {
    id?: string;
    name?: string;
    projectId?: string;
    environmentId?: string;
    project?: {
      id: string;
      name: string;
      primaryEnvironmentId?: string | null;
      workspace?: {
        id?: string;
        name?: string;
      } | null;
    };
    environment?: RailwayEnvironment;
  };
}

interface RailwayDeploymentResponse {
  deployment?: RailwayDeploymentApi | null;
}

interface RailwayServiceInstanceResponse {
  serviceInstance?: RailwayServiceInstance | null;
}

interface RailwayMetricsResponse {
  metrics?: Array<{
    measurement: "CPU_USAGE" | "MEMORY_USAGE_GB" | string;
    values?: Array<{
      ts: number;
      value: number;
    }>;
  }>;
}

const DEPLOYMENT_FIELDS = `
  id
  status
  createdAt
  updatedAt
  staticUrl
  url
  projectId
  serviceId
  environmentId
  service {
    id
    name
    project {
      id
      name
    }
  }
  environment {
    id
    name
  }
`;

const SERVICE_INSTANCE_FIELDS = `
  serviceId
  serviceName
  domains {
    serviceDomains { domain }
    customDomains { domain }
  }
  latestDeployment {
    ${DEPLOYMENT_FIELDS}
  }
  activeDeployments {
    ${DEPLOYMENT_FIELDS}
  }
`;

const DASHBOARD_QUERY = `
  query RailwayDashboard {
    projects(first: 100, includeDeleted: false) {
      edges {
        node {
          id
          name
          primaryEnvironmentId
          workspace {
            id
            name
          }
          environments(first: 20, isEphemeral: false) {
            edges {
              node {
                id
                name
                serviceInstances(first: 100) {
                  edges {
                    node {
                      ${SERVICE_INSTANCE_FIELDS}
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const PROJECT_TOKEN_QUERY = `
  query RailwayProjectToken {
    projectToken {
      id
      name
      projectId
      environmentId
      project {
        id
        name
        primaryEnvironmentId
        workspace {
          id
          name
        }
      }
      environment {
        id
        name
        serviceInstances(first: 100) {
          edges {
            node {
              ${SERVICE_INSTANCE_FIELDS}
            }
          }
        }
      }
    }
  }
`;

export async function getRailwayAccounts(): Promise<AccountGroup[]> {
  const tokens = readTokenList("RAILWAY_TOKEN");

  if (tokens.length === 0) {
    return [
      {
        id: "railway-missing",
        platform: "railway",
        tokenIndex: 0,
        label: "Railway",
        tokenLabel: "RAILWAY_TOKEN",
        deployments: [],
        error: "RAILWAY_TOKEN is not configured.",
      },
    ];
  }

  return Promise.all(tokens.map((token, index) => getRailwayAccount(token, index)));
}

export async function getRailwayDeploymentDetail(tokenIndex: number, deploymentId: string): Promise<DeploymentDetail | null> {
  const token = readTokenList("RAILWAY_TOKEN")[tokenIndex];

  if (!token) {
    return null;
  }

  const loaded = await loadRailwayDeployment(token, deploymentId);

  if (!loaded) {
    return null;
  }

  const { deployment, serviceInstance, authMode, accountLabel } = loaded;
  const summary = mapDeployment(deployment, serviceInstance, tokenIndex, accountLabel);
  const metrics = await getDeploymentMetrics(token, authMode, summary);

  return {
    ...summary,
    metrics,
    facts: [
      { label: "Project", value: summary.projectName },
      { label: "Service", value: summary.serviceName ?? "Not available" },
      { label: "Environment", value: summary.environment },
      { label: "Generated domains", value: String(summary.generatedDomains.length) },
      { label: "Custom domains", value: String(summary.customDomains.length) },
      { label: "Latest sample", value: metrics.some((metric) => metric.value !== undefined) ? "Available" : "No recent data" },
    ],
  };
}

async function getRailwayAccount(token: string, index: number): Promise<AccountGroup> {
  try {
    const response = await railwayGraphql<RailwayDashboardResponse>(token, DASHBOARD_QUERY, {}, "bearer");

    if (response.errors?.length) {
      return await getRailwayProjectTokenAccount(token, index);
    }

    const projects = nodes(response.data?.projects);
    const deployments = projects.flatMap((project) => projectDeployments(project, index, accountLabelFromProjects(projects)));
    const workspaceNames = unique(projects.map((project) => project.workspace?.name).filter((name): name is string => Boolean(name)));
    const label = workspaceNames.length === 1 ? workspaceNames[0] : `Railway ${index + 1}`;

    return {
      id: accountId("railway", token, index),
      platform: "railway",
      tokenIndex: index,
      label,
      subtitle: workspaceNames.length > 1 ? `${workspaceNames.length} workspaces` : undefined,
      tokenLabel: tokenLabel(token, index),
      deployments: deployments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    };
  } catch (error) {
    return {
      id: accountId("railway", token, index),
      platform: "railway",
      tokenIndex: index,
      label: `Railway ${index + 1}`,
      tokenLabel: tokenLabel(token, index),
      deployments: [],
      error: error instanceof Error ? error.message : "Failed to fetch Railway deployments.",
    };
  }
}

async function getRailwayProjectTokenAccount(token: string, index: number): Promise<AccountGroup> {
  const response = await railwayGraphql<RailwayProjectTokenResponse>(token, PROJECT_TOKEN_QUERY, {}, "project");

  const projectToken = response.data?.projectToken;
  const tokenProject = projectToken?.project;
  const tokenEnvironment = projectToken?.environment;

  if (response.errors?.length || !projectToken || !tokenProject || !tokenEnvironment) {
    throw new Error(response.errors?.[0]?.message ?? "Railway token is not authorized.");
  }

  const project: RailwayProject = {
    id: tokenProject.id,
    name: tokenProject.name,
    primaryEnvironmentId: tokenProject.primaryEnvironmentId,
    workspace: tokenProject.workspace,
    environments: {
      edges: [
        {
          node: tokenEnvironment,
        },
      ],
    },
  };
  const accountLabel = project.workspace?.name || project.name || `Railway ${index + 1}`;

  return {
    id: accountId("railway", token, index),
    platform: "railway",
    tokenIndex: index,
    label: accountLabel,
    subtitle: projectToken.name ? `Project token · ${projectToken.name}` : "Project token",
    tokenLabel: tokenLabel(token, index),
    deployments: projectDeployments(project, index, accountLabel),
  };
}

async function loadRailwayDeployment(
  token: string,
  deploymentId: string,
): Promise<{
  deployment: RailwayDeploymentApi;
  serviceInstance?: RailwayServiceInstance;
  authMode: RailwayAuthMode;
  accountLabel: string;
} | null> {
  const bearer = await fetchDeploymentWithMode(token, deploymentId, "bearer");

  if (bearer) {
    return bearer;
  }

  return fetchDeploymentWithMode(token, deploymentId, "project");
}

async function fetchDeploymentWithMode(
  token: string,
  deploymentId: string,
  authMode: RailwayAuthMode,
): Promise<{
  deployment: RailwayDeploymentApi;
  serviceInstance?: RailwayServiceInstance;
  authMode: RailwayAuthMode;
  accountLabel: string;
} | null> {
  const deploymentResponse = await railwayGraphql<RailwayDeploymentResponse>(
    token,
    `
      query RailwayDeployment($id: String!) {
        deployment(id: $id) {
          ${DEPLOYMENT_FIELDS}
        }
      }
    `,
    { id: deploymentId },
    authMode,
  );

  const deployment = deploymentResponse.data?.deployment;

  if (deploymentResponse.errors?.length || !deployment) {
    return null;
  }

  const serviceInstance = deployment.serviceId && deployment.environmentId
    ? await getServiceInstance(token, authMode, deployment.serviceId, deployment.environmentId)
    : undefined;

  const accountLabel = deployment.service?.project?.name || deployment.service?.name || "Railway";

  return {
    deployment,
    serviceInstance,
    authMode,
    accountLabel,
  };
}

async function getServiceInstance(
  token: string,
  authMode: RailwayAuthMode,
  serviceId: string,
  environmentId: string,
): Promise<RailwayServiceInstance | undefined> {
  const response = await railwayGraphql<RailwayServiceInstanceResponse>(
    token,
    `
      query RailwayServiceInstance($serviceId: String!, $environmentId: String!) {
        serviceInstance(serviceId: $serviceId, environmentId: $environmentId) {
          ${SERVICE_INSTANCE_FIELDS}
        }
      }
    `,
    { serviceId, environmentId },
    authMode,
  );

  return response.data?.serviceInstance ?? undefined;
}

async function getDeploymentMetrics(
  token: string,
  authMode: RailwayAuthMode,
  deployment: DeploymentSummary,
): Promise<MetricSeries[]> {
  if (!deployment.projectId || !deployment.serviceId || !deployment.environmentId) {
    return emptyMetrics();
  }

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 60 * 60 * 1000);

  const response = await railwayGraphql<RailwayMetricsResponse>(
    token,
    `
      query RailwayMetrics($projectId: String, $serviceId: String, $environmentId: String, $startDate: DateTime!, $endDate: DateTime!) {
        metrics(
          projectId: $projectId
          serviceId: $serviceId
          environmentId: $environmentId
          measurements: [CPU_USAGE, MEMORY_USAGE_GB]
          startDate: $startDate
          endDate: $endDate
          sampleRateSeconds: 300
          averagingWindowSeconds: 300
        ) {
          measurement
          values {
            ts
            value
          }
        }
      }
    `,
    {
      projectId: deployment.projectId,
      serviceId: deployment.serviceId,
      environmentId: deployment.environmentId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
    authMode,
  );

  if (response.errors?.length) {
    return emptyMetrics();
  }

  const metrics = response.data?.metrics ?? [];
  const cpu = metricSeries(metrics, "CPU_USAGE", "CPU", "%");
  const memory = metricSeries(metrics, "MEMORY_USAGE_GB", "Memory", "GB");

  return [cpu, memory];
}

function projectDeployments(project: RailwayProject, tokenIndex: number, accountLabel: string): DeploymentSummary[] {
  const environments = nodes(project.environments);
  const productionEnvironments = environments.filter((environment) => isProductionEnvironment(environment, project));

  return productionEnvironments.flatMap((environment) =>
    nodes(environment.serviceInstances).flatMap((serviceInstance) => {
      const deployment = latestDeploymentForService(serviceInstance);
      return deployment ? [mapDeployment(deployment, serviceInstance, tokenIndex, accountLabel, project, environment)] : [];
    }),
  );
}

function latestDeploymentForService(serviceInstance: RailwayServiceInstance): RailwayDeploymentApi | undefined {
  const active = [...(serviceInstance.activeDeployments ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return active[0] ?? serviceInstance.latestDeployment ?? undefined;
}

function mapDeployment(
  deployment: RailwayDeploymentApi,
  serviceInstance: RailwayServiceInstance | undefined,
  tokenIndex: number,
  accountLabel: string,
  project?: RailwayProject,
  environment?: RailwayEnvironment,
): DeploymentSummary {
  const generatedDomains = unique(
    [
      deployment.url ?? undefined,
      deployment.staticUrl ?? undefined,
      ...(serviceInstance?.domains?.serviceDomains ?? []).map((domain) => domain.domain),
    ].filter((domain): domain is string => Boolean(domain)),
  );
  const customDomains = unique(
    (serviceInstance?.domains?.customDomains ?? []).map((domain) => domain.domain).filter((domain): domain is string => Boolean(domain)),
  );
  const primaryDomain = customDomains[0] ?? generatedDomains[0];

  return {
    id: deployment.id,
    platform: "railway",
    tokenIndex,
    accountLabel,
    projectId: deployment.projectId ?? project?.id,
    projectName: deployment.service?.project?.name ?? project?.name ?? "Unknown Railway project",
    serviceId: deployment.serviceId ?? serviceInstance?.serviceId ?? undefined,
    serviceName: deployment.service?.name ?? serviceInstance?.serviceName,
    environment: deployment.environment?.name ?? environment?.name ?? "production",
    environmentId: deployment.environmentId ?? environment?.id ?? deployment.environment?.id,
    status: deployment.status,
    createdAt: deployment.createdAt,
    updatedAt: deployment.updatedAt,
    url: primaryDomain ? withHttps(primaryDomain) : undefined,
    generatedDomains,
    customDomains,
  };
}

function isProductionEnvironment(environment: RailwayEnvironment, project: RailwayProject): boolean {
  const normalizedName = environment.name.toLowerCase();
  return normalizedName === "production" || normalizedName === "prod" || environment.id === project.primaryEnvironmentId;
}

function accountLabelFromProjects(projects: RailwayProject[]): string {
  const workspaceNames = unique(projects.map((project) => project.workspace?.name).filter((name): name is string => Boolean(name)));
  return workspaceNames[0] ?? "Railway";
}

async function railwayGraphql<T>(
  token: string,
  query: string,
  variables: Record<string, unknown>,
  authMode: RailwayAuthMode,
): Promise<GraphQlResponse<T>> {
  const response = await fetch(RAILWAY_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authMode === "bearer" ? { Authorization: `Bearer ${token}` } : { "Project-Access-Token": token }),
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Railway API error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as GraphQlResponse<T>;
}

function metricSeries(
  metrics: NonNullable<RailwayMetricsResponse["metrics"]>,
  measurement: string,
  label: string,
  unit: string,
): MetricSeries {
  const series = metrics.find((metric) => metric.measurement === measurement);
  const points = (series?.values ?? []).map((point) => ({
    timestamp: point.ts,
    value: point.value,
  }));
  const latest = points.at(-1)?.value;

  return {
    label,
    unit,
    value: latest,
    points,
  };
}

function emptyMetrics(): MetricSeries[] {
  return [
    { label: "CPU", unit: "%", points: [] },
    { label: "Memory", unit: "GB", points: [] },
  ];
}

function nodes<T>(connection?: Connection<T>): T[] {
  return (connection?.edges ?? []).map((edge) => edge.node).filter((node): node is T => Boolean(node));
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
