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
}

export const projects: Project[] = [
  {
    id: '1',
    name: 'Acme Corp',
    industry: 'Fintech',
    status: 'healthy',
    environments: { dev: 'ok', staging: 'ok', prod: 'ok' },
    securityScore: 94,
    gdprCompliant: true,
    lastDeploy: '2h ago',
    issues: [],
    logoInitial: 'A',
    logoColor: 'bg-primary',
  },
  {
    id: '2',
    name: 'BetaCo',
    industry: 'E-commerce',
    status: 'warning',
    environments: { dev: 'ok', staging: 'warning', prod: 'ok' },
    securityScore: 87,
    gdprCompliant: true,
    lastDeploy: '1d ago',
    issues: ['Dependency updates available'],
    logoInitial: 'B',
    logoColor: 'bg-warning',
  },
  {
    id: '3',
    name: 'StartupInc',
    industry: 'SaaS',
    status: 'critical',
    environments: { dev: 'error', staging: 'ok', prod: 'ok' },
    securityScore: 72,
    gdprCompliant: false,
    gdprWarning: true,
    lastDeploy: '3d ago',
    issues: ['3 security issues in DEV', 'Cookie consent missing'],
    logoInitial: 'S',
    logoColor: 'bg-danger',
  },
  {
    id: '4',
    name: 'TechCorp',
    industry: 'Platform',
    status: 'healthy',
    environments: { dev: 'ok', staging: 'ok', prod: 'ok' },
    securityScore: 96,
    gdprCompliant: true,
    lastDeploy: '4h ago',
    issues: [],
    logoInitial: 'T',
    logoColor: 'bg-success',
  },
  {
    id: '5',
    name: 'FinanceApp',
    industry: 'Banking',
    status: 'healthy',
    environments: { dev: 'ok', staging: 'ok', prod: 'ok' },
    securityScore: 98,
    gdprCompliant: true,
    lastDeploy: '1h ago',
    issues: [],
    logoInitial: 'F',
    logoColor: 'bg-primary',
  },
  {
    id: '6',
    name: 'RetailCo',
    industry: 'Marketplace',
    status: 'warning',
    environments: { dev: 'ok', staging: 'warning', prod: 'ok' },
    securityScore: 89,
    gdprCompliant: true,
    lastDeploy: '2d ago',
    issues: ['Staging needs review'],
    logoInitial: 'R',
    logoColor: 'bg-warning',
  },
  {
    id: '7',
    name: 'HealthTech',
    industry: 'Medical',
    status: 'healthy',
    environments: { dev: 'ok', staging: 'ok', prod: 'ok' },
    securityScore: 95,
    gdprCompliant: true,
    lastDeploy: '3h ago',
    issues: [],
    logoInitial: 'H',
    logoColor: 'bg-success',
  },
  {
    id: '8',
    name: 'EduPlatform',
    industry: 'EdTech',
    status: 'healthy',
    environments: { dev: 'ok', staging: 'ok', prod: 'ok' },
    securityScore: 91,
    gdprCompliant: true,
    lastDeploy: '5h ago',
    issues: [],
    logoInitial: 'E',
    logoColor: 'bg-primary',
  },
  {
    id: '9',
    name: 'TravelApp',
    industry: 'Booking',
    status: 'warning',
    environments: { dev: 'ok', staging: 'ok', prod: 'warning' },
    securityScore: 88,
    gdprCompliant: true,
    lastDeploy: '5d ago',
    issues: ['Deployment overdue'],
    logoInitial: 'T',
    logoColor: 'bg-warning',
  },
  {
    id: '10',
    name: 'MediaCo',
    industry: 'Content',
    status: 'healthy',
    environments: { dev: 'ok', staging: 'ok', prod: 'ok' },
    securityScore: 93,
    gdprCompliant: true,
    lastDeploy: '6h ago',
    issues: [],
    logoInitial: 'M',
    logoColor: 'bg-success',
  },
  {
    id: '11',
    name: 'PropTech',
    industry: 'Real Estate',
    status: 'healthy',
    environments: { dev: 'ok', staging: 'ok', prod: 'ok' },
    securityScore: 90,
    gdprCompliant: true,
    lastDeploy: '1d ago',
    issues: [],
    logoInitial: 'P',
    logoColor: 'bg-primary',
  },
  {
    id: '12',
    name: 'FoodDelivery',
    industry: 'Logistics',
    status: 'healthy',
    environments: { dev: 'ok', staging: 'ok', prod: 'ok' },
    securityScore: 92,
    gdprCompliant: true,
    lastDeploy: '8h ago',
    issues: [],
    logoInitial: 'F',
    logoColor: 'bg-success',
  },
];

export const activityFeed = [
  { time: '5m ago', message: 'Acme Corp deployed to prod', type: 'success' as const },
  { time: '15m ago', message: 'BetaCo security scan passed', type: 'success' as const },
  { time: '1h ago', message: 'StartupInc issues detected', type: 'error' as const },
  { time: '2h ago', message: 'TechCorp dependencies updated', type: 'success' as const },
  { time: '3h ago', message: 'FinanceApp GDPR audit passed', type: 'success' as const },
];

export const weeklyStats = {
  deployments: 18,
  securityScans: 47,
  issuesBlocked: 5,
  timeSaved: '~12 hours',
};
