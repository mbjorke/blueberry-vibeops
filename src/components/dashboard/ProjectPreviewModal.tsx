import { 
  Shield, 
  Clock, 
  Check, 
  AlertTriangle, 
  AlertCircle,
  ExternalLink,
  Settings,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type Project, type EnvironmentStatus } from '@/types/project';
import { cn } from '@/lib/utils';

interface ProjectPreviewModalProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EnvironmentBadge({
  name, 
  status 
}: { 
  name: string; 
  status: EnvironmentStatus;
}) {
  const statusIcon = {
    ok: <Check className="h-3 w-3" />,
    warning: <AlertTriangle className="h-3 w-3" />,
    error: <AlertCircle className="h-3 w-3" />,
  };

  const badgeClass = {
    DEV: 'env-badge-dev',
    STAGE: 'env-badge-staging',
    PROD: 'env-badge-prod',
  };

  return (
    <span className={cn('env-badge', badgeClass[name as keyof typeof badgeClass])}>
      {name}
      {statusIcon[status]}
    </span>
  );
}

export function ProjectPreviewModal({ project, open, onOpenChange }: ProjectPreviewModalProps) {
  const navigate = useNavigate();

  if (!project) return null;

  const statusClass = {
    healthy: 'text-success',
    warning: 'text-warning',
    critical: 'text-danger',
  };

  const statusLabel = {
    healthy: 'Healthy',
    warning: 'Needs Attention',
    critical: 'Critical Issues',
  };

  const dotStatusClass = {
    healthy: 'status-dot-healthy',
    warning: 'status-dot-warning',
    critical: 'status-dot-critical',
  };

  const handleViewDetails = () => {
    onOpenChange(false);
    navigate(`/project/${project.id}`);
  };

  const handleOpenSettings = () => {
    onOpenChange(false);
    navigate(`/project/${project.id}/settings`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
        {/* Header with gradient background */}
        <div className={cn(
          'p-6 text-primary-foreground',
          project.logoColor
        )}>
          <DialogHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-2xl">
                  {project.logoInitial}
                </div>
                <div>
                  <DialogTitle className="text-xl text-primary-foreground">
                    {project.name}
                  </DialogTitle>
                  <p className="text-sm text-primary-foreground/80 mt-0.5">
                    {project.industry}
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Status & Environments */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={cn('status-dot', dotStatusClass[project.status])} />
              <span className={cn('font-medium text-sm', statusClass[project.status])}>
                {statusLabel[project.status]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <EnvironmentBadge name="DEV" status={project.environments.dev} />
              <EnvironmentBadge name="STAGE" status={project.environments.staging} />
              <EnvironmentBadge name="PROD" status={project.environments.prod} />
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <p className={cn(
                'text-2xl font-bold',
                project.securityScore >= 90 ? 'text-success' : 
                project.securityScore >= 80 ? 'text-warning' : 'text-danger'
              )}>
                {project.securityScore}
              </p>
              <p className="text-xs text-muted-foreground">Security Score</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                {project.gdprCompliant ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-warning" />
                )}
              </div>
              <p className={cn(
                'text-sm font-bold',
                project.gdprCompliant ? 'text-success' : 'text-warning'
              )}>
                {project.gdprCompliant ? 'Compliant' : 'Pending'}
              </p>
              <p className="text-xs text-muted-foreground">GDPR Status</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-bold truncate" title={project.lastDeploy}>
                {project.lastDeploy}
              </p>
              <p className="text-xs text-muted-foreground">Last Deploy</p>
            </div>
          </div>

          {/* Issues */}
          {project.issues.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Active Issues</p>
              <div className="space-y-1.5">
                {project.issues.slice(0, 3).map((issue, index) => (
                  <Badge 
                    key={index}
                    variant="outline"
                    className={cn(
                      'w-full justify-start py-1.5',
                      issue.includes('security') || issue.includes('consent') 
                        ? 'bg-danger/10 text-danger border-danger/20' 
                        : 'bg-warning/10 text-warning border-warning/20'
                    )}
                  >
                    {issue.includes('security') || issue.includes('consent') ? '🔴' : '⚠️'} {issue}
                  </Badge>
                ))}
                {project.issues.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{project.issues.length - 3} more issues
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t p-4 flex items-center justify-between bg-muted/30">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenSettings}
            className="gap-1.5"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          
          <Button
            onClick={handleViewDetails}
            className="gap-1.5"
          >
            View Full Details
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        {/* Keyboard hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden sm:block">
          <p className="text-[10px] text-muted-foreground">
            Press <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Esc</kbd> to close
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
