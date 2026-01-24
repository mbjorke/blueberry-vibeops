import { type Project } from '@/types/project';

export interface SecurityFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  title: string;
  description: string;
  affectedComponent: string;
  status: 'open' | 'in_progress' | 'resolved' | 'dismissed';
  foundAt: string;
  resolvedAt?: string;
}

export interface Deployment {
  id: string;
  environment: 'dev' | 'staging' | 'prod';
  version: string;
  status: 'success' | 'failed' | 'in_progress' | 'rolled_back';
  deployedBy: string;
  deployedAt: string;
  duration: string;
  commitMessage: string;
  commitHash: string;
}

export interface GDPRChecklistItem {
  id: string;
  category: 'data_collection' | 'consent' | 'data_rights' | 'security' | 'documentation';
  title: string;
  description: string;
  status: 'compliant' | 'non_compliant' | 'pending' | 'not_applicable';
  lastChecked: string;
  notes?: string;
}

export interface ProjectDetails {
  projectId: string;
  securityFindings: SecurityFinding[];
  deployments: Deployment[];
  gdprChecklist: GDPRChecklistItem[];
}

// Generate mock security findings based on project status
export function generateSecurityFindings(project: Project): SecurityFinding[] {
  const baseFindings: SecurityFinding[] = [
    {
      id: 'sf-1',
      severity: 'info',
      category: 'Dependencies',
      title: 'Outdated package detected',
      description: 'lodash@4.17.20 has a newer version available with security patches.',
      affectedComponent: 'package.json',
      status: 'resolved',
      foundAt: '2024-01-15',
      resolvedAt: '2024-01-16',
    },
    {
      id: 'sf-2',
      severity: 'low',
      category: 'Headers',
      title: 'Missing X-Content-Type-Options header',
      description: 'The X-Content-Type-Options header is not set, which could allow MIME type sniffing.',
      affectedComponent: 'Server Configuration',
      status: 'resolved',
      foundAt: '2024-01-10',
      resolvedAt: '2024-01-12',
    },
  ];

  if (project.status === 'warning') {
    baseFindings.unshift({
      id: 'sf-3',
      severity: 'medium',
      category: 'Dependencies',
      title: 'Vulnerable dependency detected',
      description: 'axios@0.21.1 has a known vulnerability (CVE-2021-3749). Update to version 0.21.2 or later.',
      affectedComponent: 'node_modules/axios',
      status: 'open',
      foundAt: '2024-01-18',
    });
  }

  if (project.status === 'critical') {
    baseFindings.unshift(
      {
        id: 'sf-4',
        severity: 'critical',
        category: 'Authentication',
        title: 'Insecure JWT configuration',
        description: 'JWT tokens are signed with a weak secret and have no expiration set.',
        affectedComponent: 'src/auth/jwt.ts',
        status: 'open',
        foundAt: '2024-01-17',
      },
      {
        id: 'sf-5',
        severity: 'high',
        category: 'Injection',
        title: 'Potential SQL injection vulnerability',
        description: 'User input is not properly sanitized before database queries in the search endpoint.',
        affectedComponent: 'src/api/search.ts',
        status: 'in_progress',
        foundAt: '2024-01-16',
      },
      {
        id: 'sf-6',
        severity: 'high',
        category: 'XSS',
        title: 'Cross-site scripting vulnerability',
        description: 'User-generated content is rendered without proper escaping in the comments section.',
        affectedComponent: 'src/components/Comments.tsx',
        status: 'open',
        foundAt: '2024-01-15',
      }
    );
  }

  return baseFindings;
}

// Generate mock deployments
export function generateDeployments(project: Project): Deployment[] {
  const deployments: Deployment[] = [
    {
      id: 'dep-1',
      environment: 'prod',
      version: 'v2.4.1',
      status: 'success',
      deployedBy: 'CI/CD Pipeline',
      deployedAt: project.lastDeploy,
      duration: '2m 34s',
      commitMessage: 'fix: resolve caching issue in user dashboard',
      commitHash: 'a1b2c3d',
    },
    {
      id: 'dep-2',
      environment: 'staging',
      version: 'v2.4.2-beta',
      status: 'success',
      deployedBy: 'john.doe@agency.com',
      deployedAt: '1d ago',
      duration: '1m 58s',
      commitMessage: 'feat: add new analytics dashboard',
      commitHash: 'e4f5g6h',
    },
    {
      id: 'dep-3',
      environment: 'dev',
      version: 'v2.5.0-dev',
      status: 'success',
      deployedBy: 'jane.smith@agency.com',
      deployedAt: '2d ago',
      duration: '45s',
      commitMessage: 'chore: update dependencies',
      commitHash: 'i7j8k9l',
    },
    {
      id: 'dep-4',
      environment: 'prod',
      version: 'v2.4.0',
      status: 'success',
      deployedBy: 'CI/CD Pipeline',
      deployedAt: '5d ago',
      duration: '2m 12s',
      commitMessage: 'feat: implement new payment flow',
      commitHash: 'm0n1o2p',
    },
    {
      id: 'dep-5',
      environment: 'staging',
      version: 'v2.3.9-beta',
      status: 'rolled_back',
      deployedBy: 'CI/CD Pipeline',
      deployedAt: '1w ago',
      duration: '3m 01s',
      commitMessage: 'feat: experimental feature flag system',
      commitHash: 'q3r4s5t',
    },
  ];

  if (project.status === 'critical') {
    deployments.unshift({
      id: 'dep-0',
      environment: 'dev',
      version: 'v2.5.1-dev',
      status: 'failed',
      deployedBy: 'CI/CD Pipeline',
      deployedAt: '30m ago',
      duration: '1m 12s',
      commitMessage: 'fix: attempt to resolve security issues',
      commitHash: 'u6v7w8x',
    });
  }

  return deployments;
}

// Generate GDPR checklist
export function generateGDPRChecklist(project: Project): GDPRChecklistItem[] {
  const checklist: GDPRChecklistItem[] = [
    {
      id: 'gdpr-1',
      category: 'consent',
      title: 'Cookie Consent Banner',
      description: 'A compliant cookie consent banner is displayed to all visitors.',
      status: project.gdprCompliant ? 'compliant' : 'non_compliant',
      lastChecked: '2024-01-18',
      notes: project.gdprCompliant ? 'Using CookieBot integration' : 'Cookie banner not implemented',
    },
    {
      id: 'gdpr-2',
      category: 'data_collection',
      title: 'Privacy Policy',
      description: 'A comprehensive privacy policy is accessible from all pages.',
      status: 'compliant',
      lastChecked: '2024-01-15',
      notes: 'Last updated December 2024',
    },
    {
      id: 'gdpr-3',
      category: 'data_rights',
      title: 'Data Export Functionality',
      description: 'Users can request and download all their personal data.',
      status: project.gdprCompliant ? 'compliant' : 'pending',
      lastChecked: '2024-01-10',
    },
    {
      id: 'gdpr-4',
      category: 'data_rights',
      title: 'Account Deletion',
      description: 'Users can request complete deletion of their account and data.',
      status: 'compliant',
      lastChecked: '2024-01-12',
    },
    {
      id: 'gdpr-5',
      category: 'security',
      title: 'Data Encryption',
      description: 'All personal data is encrypted at rest and in transit.',
      status: 'compliant',
      lastChecked: '2024-01-18',
      notes: 'Using AES-256 encryption',
    },
    {
      id: 'gdpr-6',
      category: 'security',
      title: 'Access Controls',
      description: 'Proper access controls are in place for personal data.',
      status: 'compliant',
      lastChecked: '2024-01-16',
    },
    {
      id: 'gdpr-7',
      category: 'documentation',
      title: 'Data Processing Records',
      description: 'Records of all data processing activities are maintained.',
      status: project.gdprCompliant ? 'compliant' : 'pending',
      lastChecked: '2024-01-14',
    },
    {
      id: 'gdpr-8',
      category: 'documentation',
      title: 'DPA with Processors',
      description: 'Data Processing Agreements are in place with all third-party processors.',
      status: 'compliant',
      lastChecked: '2024-01-08',
      notes: 'Agreements with AWS, Stripe, and Mailchimp',
    },
    {
      id: 'gdpr-9',
      category: 'consent',
      title: 'Marketing Consent',
      description: 'Explicit opt-in consent is obtained for marketing communications.',
      status: 'compliant',
      lastChecked: '2024-01-17',
    },
    {
      id: 'gdpr-10',
      category: 'data_collection',
      title: 'Data Minimization',
      description: 'Only necessary data is collected for specified purposes.',
      status: 'compliant',
      lastChecked: '2024-01-13',
    },
  ];

  return checklist;
}
