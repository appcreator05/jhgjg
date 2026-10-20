export interface BuildConfig {
  appName: string;
  packageName: string;
  appUrl: string;
  appIcon: string;
}

export interface GithubSettings {
  owner: string;
  repo: string;
  workflowFile: string;
  branch: string;
  token: string;
  useSimulation: boolean;
}

export type BuildStatus = 'idle' | 'triggering' | 'queued' | 'in_progress' | 'completed' | 'error';
export type BuildConclusion = 'success' | 'failure' | 'cancelled' | null;

export interface BuildRunRecord {
  id: string;
  timestamp: number;
  appName: string;
  packageName: string;
  appUrl: string;
  appIcon?: string;
  status: BuildStatus;
  conclusion: BuildConclusion;
  htmlUrl?: string;
  downloadUrl?: string;
  logs: string[];
  isSimulated?: boolean;
}
