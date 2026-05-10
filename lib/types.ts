export type Platform = "railway" | "vercel";

export type DeploymentStatusTone = "success" | "warning" | "danger" | "neutral";

export interface AccountGroup {
  id: string;
  platform: Platform;
  tokenIndex: number;
  label: string;
  subtitle?: string;
  tokenLabel: string;
  deployments: DeploymentSummary[];
  error?: string;
}

export interface DeploymentSummary {
  id: string;
  platform: Platform;
  tokenIndex: number;
  accountLabel: string;
  projectId?: string;
  projectName: string;
  serviceId?: string;
  serviceName?: string;
  environment: string;
  environmentId?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  url?: string;
  generatedDomains: string[];
  customDomains: string[];
  source?: string;
  inspectorUrl?: string;
  buildStartedAt?: string;
  readyAt?: string;
  readySubstate?: string;
  checksConclusion?: string;
  errorMessage?: string;
}

export interface DashboardData {
  accounts: AccountGroup[];
  generatedAt: string;
  totals: {
    accounts: number;
    deployments: number;
    railway: number;
    vercel: number;
  };
}

export interface MetricPoint {
  timestamp: number;
  value: number;
}

export interface MetricSeries {
  label: string;
  unit: string;
  value?: number;
  points: MetricPoint[];
}

export interface DeploymentDetail extends DeploymentSummary {
  metrics: MetricSeries[];
  facts: Array<{
    label: string;
    value: string;
  }>;
}
