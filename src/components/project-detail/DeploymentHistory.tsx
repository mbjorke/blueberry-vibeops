import { 
  Rocket, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Clock, 
  User, 
  GitCommit,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { type Deployment } from '@/hooks/useProjectDetailData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DeploymentHistoryProps {
  deployments: Deployment[];
  loading?: boolean;
}

const statusConfig = {
  success: { 
    label: 'Success', 
    icon: CheckCircle, 
    className: 'bg-success/10 text-success border-success/20',
    dotClass: 'bg-success'
  },
  failed: { 
    label: 'Failed', 
    icon: XCircle, 
    className: 'bg-danger/10 text-danger border-danger/20',
    dotClass: 'bg-danger'
  },
  in_progress: { 
    label: 'In Progress', 
    icon: Loader2, 
    className: 'bg-primary/10 text-primary border-primary/20',
    dotClass: 'bg-primary animate-pulse'
  },
  rolled_back: { 
    label: 'Rolled Back', 
    icon: RotateCcw, 
    className: 'bg-warning/10 text-warning border-warning/20',
    dotClass: 'bg-warning'
  },
};

const envConfig = {
  dev: { label: 'DEV', className: 'env-badge-dev' },
  staging: { label: 'STAGING', className: 'env-badge-staging' },
  prod: { label: 'PROD', className: 'env-badge-prod' },
};

function DeploymentStatusBadge({ status }: { status: Deployment['status'] }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <Badge variant="outline" className={cn('gap-1', config.className)}>
      <Icon className={cn('h-3 w-3', status === 'in_progress' && 'animate-spin')} />
      {config.label}
    </Badge>
  );
}

function EnvironmentBadge({ environment }: { environment: Deployment['environment'] }) {
  const config = envConfig[environment];
  
  return (
    <span className={cn('env-badge', config.className)}>
      {config.label}
    </span>
  );
}

function formatDuration(seconds?: number): string {
  if (!seconds) return 'N/A';
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export function DeploymentHistory({ deployments, loading }: DeploymentHistoryProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[150px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (deployments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Rocket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">No deployments yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Deployments will appear here once you start deploying
          </p>
        </CardContent>
      </Card>
    );
  }

  const recentDeployments = deployments.slice(0, 10);
  
  const successRate = Math.round(
    (deployments.filter(d => d.status === 'success').length / deployments.length) * 100
  );

  const avgDuration = deployments.reduce((sum, d) => sum + (d.durationSeconds || 0), 0) / deployments.length;

  const envCounts = {
    prod: deployments.filter(d => d.environment === 'prod').length,
    staging: deployments.filter(d => d.environment === 'staging').length,
    dev: deployments.filter(d => d.environment === 'dev').length,
  };

  return (
    <div className="space-y-6">
      {/* Deployment Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Deployment Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <div className="text-3xl font-bold text-foreground">{deployments.length}</div>
              <div className="text-sm text-muted-foreground">Total Deploys</div>
            </div>
            <div className="p-4 rounded-lg bg-success/5 text-center border border-success/10">
              <div className="text-3xl font-bold text-success">{successRate}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <div className="text-3xl font-bold text-foreground">{envCounts.prod}</div>
              <div className="text-sm text-muted-foreground">Prod Deploys</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <div className="text-3xl font-bold text-foreground">{formatDuration(Math.round(avgDuration))}</div>
              <div className="text-sm text-muted-foreground">Avg Duration</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Recent Deployments
            </span>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            
            <div className="space-y-6">
              {recentDeployments.map((deployment) => (
                <div key={deployment.id} className="relative pl-10">
                  {/* Timeline dot */}
                  <div className={cn(
                    'absolute left-2.5 w-3 h-3 rounded-full border-2 border-background',
                    statusConfig[deployment.status].dotClass
                  )} />
                  
                  <div className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <EnvironmentBadge environment={deployment.environment} />
                        <DeploymentStatusBadge status={deployment.status} />
                        <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                          {deployment.version}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(deployment.createdAt), 'MMM d, yyyy HH:mm')}
                      </span>
                    </div>
                    
                    {deployment.commitMessage && (
                      <div className="flex items-center gap-2 mt-3">
                        <GitCommit className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm truncate">{deployment.commitMessage}</span>
                        {deployment.commitHash && (
                          <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono shrink-0">
                            {deployment.commitHash.substring(0, 7)}
                          </code>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
                      {deployment.deployedByName && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {deployment.deployedByName}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Duration: {formatDuration(deployment.durationSeconds)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
