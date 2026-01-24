// Repository/Project types used across the dashboard
// These replace the legacy types from src/data/projects.ts

export type ProjectStatus = 'healthy' | 'warning' | 'critical';
export type EnvironmentStatus = 'ok' | 'warning' | 'error';

export interface Project {
  id: string;
  name: string;
  industry: string;
  status: ProjectStatus;
  environments: {
    dev: EnvironmentStatus;
    staging: EnvironmentStatus;
    prod: EnvironmentStatus;
  };
  securityScore: number;
  gdprCompliant: boolean;
  gdprWarning?: boolean;
  lastDeploy: string;
  issues: string[];
  logoInitial: string;
  logoColor: string;
  // Additional fields from repositories table
  description?: string | null;
  github_url?: string | null;
  full_name?: string | null;
  language?: string | null;
}

// Default weekly stats - these should eventually come from the database
export const defaultWeeklyStats = {
  deployments: 0,
  securityScans: 0,
  issuesBlocked: 0,
  timeSaved: '~0 hours',
};
