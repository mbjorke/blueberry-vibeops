export type IntegrationStatus = 'supported' | 'manual' | 'coming-soon' | 'not-supported';

export interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  workaround?: string;
  docsUrl?: string;
  category: 'database' | 'auth' | 'hosting' | 'ci-cd' | 'security' | 'monitoring';
}

export interface MigrationStep {
  id: string;
  title: string;
  description: string;
  sqlTemplate?: string;
  warningLevel: 'info' | 'warning' | 'critical';
  applicableWhen: string;
}

export const integrationRoadmap: IntegrationItem[] = [
  // Database
  {
    id: 'db-schema',
    name: 'Database Schema Changes',
    description: 'Create tables, columns, indexes via Lovable prompts',
    status: 'supported',
    category: 'database',
    docsUrl: 'https://docs.lovable.dev/features/cloud'
  },
  {
    id: 'db-rls',
    name: 'Row Level Security (RLS)',
    description: 'Auto-generated RLS policies for secure data access',
    status: 'supported',
    category: 'database'
  },
  {
    id: 'db-env-separation',
    name: 'Environment Separation (staging/prod)',
    description: 'Separate databases per environment',
    status: 'manual',
    workaround: 'Create separate Supabase projects manually. Use different .env files per deployment.',
    category: 'database'
  },
  {
    id: 'db-migrations-sync',
    name: 'Migration Sync (Lovable → External DB)',
    description: 'Apply Lovable-generated migrations to external Supabase instances',
    status: 'manual',
    workaround: 'Export SQL from Lovable Cloud, run manually in target Supabase dashboard.',
    category: 'database'
  },
  
  // Auth
  {
    id: 'auth-email',
    name: 'Email/Password Authentication',
    description: 'Built-in auth with auto-confirm',
    status: 'supported',
    category: 'auth'
  },
  {
    id: 'auth-oauth',
    name: 'OAuth (Google, GitHub)',
    description: 'Social login providers',
    status: 'manual',
    workaround: 'Configure OAuth in Supabase dashboard, add credentials as secrets.',
    category: 'auth'
  },
  {
    id: 'auth-mfa',
    name: 'Multi-Factor Authentication',
    description: 'TOTP/SMS based 2FA',
    status: 'manual',
    workaround: 'Enable in Supabase Auth settings manually.',
    category: 'auth'
  },
  
  // Hosting
  {
    id: 'hosting-lovable',
    name: 'Lovable Hosting',
    description: 'One-click publish to lovable.app subdomain',
    status: 'supported',
    category: 'hosting'
  },
  {
    id: 'hosting-vercel',
    name: 'Vercel Deployment',
    description: 'Deploy to Vercel with environment variables',
    status: 'manual',
    workaround: 'Connect GitHub repo to Vercel, configure env vars per environment.',
    category: 'hosting'
  },
  {
    id: 'hosting-custom-domain',
    name: 'Custom Domain',
    description: 'Use your own domain',
    status: 'supported',
    docsUrl: 'https://docs.lovable.dev/features/custom-domain',
    category: 'hosting'
  },
  
  // CI/CD
  {
    id: 'cicd-github-actions',
    name: 'GitHub Actions',
    description: 'Automated workflows on push',
    status: 'manual',
    workaround: 'Set up .github/workflows manually in your repo.',
    category: 'ci-cd'
  },
  {
    id: 'cicd-env-secrets',
    name: 'GitHub Environment Secrets',
    description: 'Secrets per environment (dev/staging/prod)',
    status: 'manual',
    workaround: 'Configure in GitHub repo settings → Environments.',
    category: 'ci-cd'
  },
  
  // Security
  {
    id: 'security-scan',
    name: 'Security Scanning',
    description: 'Automated vulnerability detection',
    status: 'supported',
    category: 'security'
  },
  {
    id: 'security-audit-log',
    name: 'Audit Logging',
    description: 'Track all data changes',
    status: 'manual',
    workaround: 'Create audit triggers manually in Supabase.',
    category: 'security'
  },
  {
    id: 'security-compliance',
    name: 'Compliance (SOC2, HIPAA)',
    description: 'Enterprise compliance certifications',
    status: 'not-supported',
    workaround: 'Not suitable for regulated industries requiring certified infrastructure.',
    category: 'security'
  },
  
  // Monitoring
  {
    id: 'monitoring-logs',
    name: 'Edge Function Logs',
    description: 'View function execution logs',
    status: 'supported',
    category: 'monitoring'
  },
  {
    id: 'monitoring-analytics',
    name: 'Usage Analytics',
    description: 'Track app usage and performance',
    status: 'coming-soon',
    category: 'monitoring'
  }
];

export const migrationSteps: MigrationStep[] = [
  {
    id: 'export-schema',
    title: 'Export Schema from Lovable',
    description: 'Go to Cloud → Database → Tables and note the current schema structure.',
    warningLevel: 'info',
    applicableWhen: 'Syncing to external Supabase instance'
  },
  {
    id: 'check-rls',
    title: 'Verify RLS Policies',
    description: 'Ensure all tables have appropriate RLS policies before deploying to production.',
    warningLevel: 'critical',
    applicableWhen: 'Before any production deployment'
  },
  {
    id: 'backup-data',
    title: 'Backup Production Data',
    description: 'Export existing data before running destructive migrations.',
    sqlTemplate: `-- Export table data
SELECT * FROM your_table;
-- Or use pg_dump for full backup`,
    warningLevel: 'critical',
    applicableWhen: 'Before ALTER/DROP operations on tables with data'
  },
  {
    id: 'test-migration',
    title: 'Test in Staging First',
    description: 'Run migrations in staging environment before production.',
    warningLevel: 'warning',
    applicableWhen: 'Any schema change'
  },
  {
    id: 'update-env-vars',
    title: 'Update Environment Variables',
    description: 'Ensure target environment has correct SUPABASE_URL and keys.',
    warningLevel: 'warning',
    applicableWhen: 'Deploying to new environment'
  },
  {
    id: 'run-migration',
    title: 'Execute Migration SQL',
    description: 'Run the migration script in target Supabase SQL Editor.',
    sqlTemplate: `-- Example: Add column
ALTER TABLE public.your_table 
ADD COLUMN new_column TEXT;

-- Example: Create index
CREATE INDEX idx_your_table_column 
ON public.your_table(column_name);`,
    warningLevel: 'info',
    applicableWhen: 'Applying schema changes'
  },
  {
    id: 'verify-migration',
    title: 'Verify Migration Success',
    description: 'Check that schema changes applied correctly and app still works.',
    warningLevel: 'info',
    applicableWhen: 'After any migration'
  }
];

export const getCategoryLabel = (category: IntegrationItem['category']): string => {
  const labels: Record<IntegrationItem['category'], string> = {
    'database': 'Database',
    'auth': 'Authentication',
    'hosting': 'Hosting & Deployment',
    'ci-cd': 'CI/CD',
    'security': 'Security',
    'monitoring': 'Monitoring'
  };
  return labels[category];
};

export const getStatusLabel = (status: IntegrationStatus): string => {
  const labels: Record<IntegrationStatus, string> = {
    'supported': 'Fully Supported',
    'manual': 'Manual Setup Required',
    'coming-soon': 'Coming Soon',
    'not-supported': 'Not Supported'
  };
  return labels[status];
};
