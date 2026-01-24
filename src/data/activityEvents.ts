import { type Project } from '@/types/project';
import { type SecurityFinding, type Deployment } from './projectDetails';

export type ActivityType = 'deployment' | 'status_change' | 'security_event' | 'compliance';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  severity?: 'info' | 'success' | 'warning' | 'critical';
  metadata?: Record<string, string>;
}

export function generateActivityTimeline(
  project: Project, 
  deployments: Deployment[], 
  findings: SecurityFinding[]
): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  // Add deployment events
  deployments.forEach((dep, index) => {
    const severity = dep.status === 'success' ? 'success' 
      : dep.status === 'failed' ? 'critical' 
      : dep.status === 'rolled_back' ? 'warning' 
      : 'info';

    events.push({
      id: `activity-dep-${dep.id}`,
      type: 'deployment',
      title: `${dep.environment.toUpperCase()} Deployment ${dep.status === 'success' ? 'Successful' : dep.status === 'failed' ? 'Failed' : dep.status === 'rolled_back' ? 'Rolled Back' : 'In Progress'}`,
      description: `Version ${dep.version} - ${dep.commitMessage}`,
      timestamp: dep.deployedAt,
      severity,
      metadata: {
        environment: dep.environment,
        version: dep.version,
        deployedBy: dep.deployedBy,
        duration: dep.duration,
        commitHash: dep.commitHash,
      },
    });
  });

  // Add security finding events
  findings.forEach((finding) => {
    const severity = finding.severity === 'critical' ? 'critical'
      : finding.severity === 'high' ? 'critical'
      : finding.severity === 'medium' ? 'warning'
      : 'info';

    events.push({
      id: `activity-sec-${finding.id}`,
      type: 'security_event',
      title: `Security ${finding.status === 'resolved' ? 'Issue Resolved' : 'Issue Detected'}: ${finding.title}`,
      description: finding.description,
      timestamp: finding.status === 'resolved' && finding.resolvedAt ? finding.resolvedAt : finding.foundAt,
      severity: finding.status === 'resolved' ? 'success' : severity,
      metadata: {
        category: finding.category,
        component: finding.affectedComponent,
        status: finding.status,
        severity: finding.severity,
      },
    });
  });

  // Add status change events based on project
  if (project.status === 'critical') {
    events.push({
      id: 'activity-status-1',
      type: 'status_change',
      title: 'Project Status Changed to Critical',
      description: 'Multiple high-severity issues detected requiring immediate attention.',
      timestamp: '2h ago',
      severity: 'critical',
      metadata: {
        previousStatus: 'warning',
        newStatus: 'critical',
      },
    });
  }

  if (project.status === 'warning') {
    events.push({
      id: 'activity-status-2',
      type: 'status_change',
      title: 'Project Status Changed to Warning',
      description: 'Minor issues detected that need attention.',
      timestamp: '1d ago',
      severity: 'warning',
      metadata: {
        previousStatus: 'healthy',
        newStatus: 'warning',
      },
    });
  }

  // Add compliance events
  if (!project.gdprCompliant) {
    events.push({
      id: 'activity-compliance-1',
      type: 'compliance',
      title: 'GDPR Compliance Check Failed',
      description: 'One or more GDPR requirements are not met. Review the compliance checklist.',
      timestamp: '3d ago',
      severity: 'warning',
      metadata: {
        framework: 'GDPR',
        status: 'non_compliant',
      },
    });
  } else {
    events.push({
      id: 'activity-compliance-2',
      type: 'compliance',
      title: 'GDPR Compliance Verified',
      description: 'All GDPR requirements are currently being met.',
      timestamp: '1w ago',
      severity: 'success',
      metadata: {
        framework: 'GDPR',
        status: 'compliant',
      },
    });
  }

  // Sort by recency (simple sort based on common time patterns)
  const timeOrder: Record<string, number> = {
    'now': 0,
    'm ago': 1,
    'h ago': 2,
    'd ago': 3,
    'w ago': 4,
  };

  events.sort((a, b) => {
    const getOrder = (ts: string) => {
      for (const [key, val] of Object.entries(timeOrder)) {
        if (ts.includes(key)) return val;
      }
      return 5; // Dates
    };
    return getOrder(a.timestamp) - getOrder(b.timestamp);
  });

  return events;
}
