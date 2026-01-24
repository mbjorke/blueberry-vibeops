import { Shield, AlertTriangle, AlertCircle, CheckCircle, Info, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { type SecurityFinding } from '@/hooks/useProjectDetailData';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { FindingActionsDropdown } from './FindingActionsDropdown';

interface SecurityScanReportProps {
  findings: SecurityFinding[];
  securityScore: number;
  loading?: boolean;
  githubUrl?: string;
  repoFullName?: string;
  onUpdateStatus?: (findingId: string, status: SecurityFinding['status']) => Promise<void>;
}

const severityConfig = {
  critical: { 
    label: 'Critical', 
    icon: AlertCircle, 
    className: 'bg-danger/10 text-danger border-danger/20',
    dotClass: 'bg-danger'
  },
  high: { 
    label: 'High', 
    icon: AlertTriangle, 
    className: 'bg-danger/10 text-danger border-danger/20',
    dotClass: 'bg-danger'
  },
  medium: { 
    label: 'Medium', 
    icon: AlertTriangle, 
    className: 'bg-warning/10 text-warning border-warning/20',
    dotClass: 'bg-warning'
  },
  low: { 
    label: 'Low', 
    icon: Info, 
    className: 'bg-primary/10 text-primary border-primary/20',
    dotClass: 'bg-primary'
  },
  info: { 
    label: 'Info', 
    icon: Info, 
    className: 'bg-muted text-muted-foreground border-muted',
    dotClass: 'bg-muted-foreground'
  },
};

const statusConfig = {
  open: { label: 'Open', className: 'bg-danger/10 text-danger' },
  in_progress: { label: 'In Progress', className: 'bg-warning/10 text-warning' },
  fixed: { label: 'Fixed', className: 'bg-success/10 text-success' },
  ignored: { label: 'Ignored', className: 'bg-muted text-muted-foreground' },
};

function SeverityBadge({ severity }: { severity: SecurityFinding['severity'] }) {
  const config = severityConfig[severity];
  const Icon = config.icon;
  
  return (
    <Badge variant="outline" className={cn('gap-1', config.className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function StatusBadge({ status }: { status: SecurityFinding['status'] }) {
  const config = statusConfig[status];
  
  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
}

export function SecurityScanReport({ findings, securityScore, loading, githubUrl, repoFullName }: SecurityScanReportProps) {
  const openFindings = findings.filter(f => f.status === 'open' || f.status === 'in_progress');
  const resolvedFindings = findings.filter(f => f.status === 'fixed' || f.status === 'ignored');
  
  const criticalCount = findings.filter(f => f.severity === 'critical' && f.status !== 'fixed').length;
  const highCount = findings.filter(f => f.severity === 'high' && f.status !== 'fixed').length;
  const mediumCount = findings.filter(f => f.severity === 'medium' && f.status !== 'fixed').length;
  const lowCount = findings.filter(f => f.severity === 'low' && f.status !== 'fixed').length;

  const scoreColor = securityScore >= 90 ? 'text-success' : securityScore >= 80 ? 'text-warning' : 'text-danger';

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Score */}
            <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-muted/50">
              <div className={cn('text-5xl font-bold', scoreColor)}>
                {securityScore}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Security Score</div>
              <Progress value={securityScore} className="w-full mt-4 h-2" />
            </div>
            
            {/* Summary */}
            <div className="space-y-3">
              <h4 className="font-medium mb-3">Active Issues</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/5 border border-danger/10">
                  <div className="w-3 h-3 rounded-full bg-danger" />
                  <span className="text-sm">Critical: <strong>{criticalCount}</strong></span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/5 border border-danger/10">
                  <div className="w-3 h-3 rounded-full bg-danger" />
                  <span className="text-sm">High: <strong>{highCount}</strong></span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/5 border border-warning/10">
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <span className="text-sm">Medium: <strong>{mediumCount}</strong></span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm">Low: <strong>{lowCount}</strong></span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Last scan: Today at 09:45 AM
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Open Findings */}
      {openFindings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Open Findings ({openFindings.length})
              </span>
              <Button variant="outline" size="sm">
                Export Report
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {openFindings.map((finding) => (
              <div
                key={finding.id}
                className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <SeverityBadge severity={finding.severity} />
                      <StatusBadge status={finding.status} />
                      <Badge variant="outline" className="bg-muted/50">
                        {finding.category}
                      </Badge>
                    </div>
                    <h4 className="font-semibold mt-2">{finding.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{finding.description}</p>
                  </div>
                  <FindingActionsDropdown 
                    finding={finding}
                    githubUrl={githubUrl}
                    repoFullName={repoFullName}
                  />
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3 pt-3 border-t">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Found: {formatDistanceToNow(new Date(finding.createdAt), { addSuffix: true })}
                  </span>
                  {finding.category && <span>Category: {finding.category}</span>}
                  {finding.filePath && <span className="font-mono">{finding.filePath}</span>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Resolved Findings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Resolved Findings ({resolvedFindings.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {resolvedFindings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No resolved findings yet
            </p>
          ) : (
            resolvedFindings.map((finding) => (
              <div
                key={finding.id}
                className="p-3 rounded-lg border bg-muted/30 opacity-75"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={finding.severity} />
                      <StatusBadge status={finding.status} />
                    </div>
                    <h4 className="font-medium mt-2 text-sm">{finding.title}</h4>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Empty state */}
      {findings.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No security findings</p>
            <p className="text-sm text-muted-foreground mt-1">
              Run a security scan to detect potential vulnerabilities
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
