import { useState, useEffect } from 'react';
import { Shield, Clock, Check, AlertTriangle, MoreHorizontal, ExternalLink, Trash2, Server, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { type Project } from '@/types/project';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProjectCardProps {
  project: Project;
  onRemove?: () => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (projectId: string, selected: boolean) => void;
  onPreview?: (project: Project) => void;
}

interface GitHubEnvironment {
  id: number;
  name: string;
  html_url: string;
}

export function ProjectCard({ project, onRemove, selectionMode, isSelected, onSelectionChange, onPreview }: ProjectCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [githubEnvironments, setGithubEnvironments] = useState<GitHubEnvironment[]>([]);
  const [environmentsLoading, setEnvironmentsLoading] = useState(false);
  const [environmentsPermissionPending, setEnvironmentsPermissionPending] = useState(false);
  const [hasGithubRepo, setHasGithubRepo] = useState(false);

  // Fetch GitHub environments
  useEffect(() => {
    async function fetchEnvironments() {
      if (!project.id) return;

      try {
        const { data } = await supabase
          .from('repositories')
          .select('full_name')
          .eq('id', project.id)
          .single();

        if (!data?.full_name) {
          setGithubEnvironments([]);
          setHasGithubRepo(false);
          return;
        }

        setHasGithubRepo(true);
        setEnvironmentsLoading(true);
        setEnvironmentsPermissionPending(false);
        
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-app-auth?action=list-environments&repo=${encodeURIComponent(data.full_name)}`,
          {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
          }
        );

        const envData = await response.json();
        
        // Handle permission errors - show pending permission indicator
        if (envData.errorCode === 'MISSING_ENVIRONMENTS_PERMISSION') {
          setEnvironmentsPermissionPending(true);
          setGithubEnvironments([]);
          return;
        }
        
        if (!response.ok) {
          setGithubEnvironments([]);
          return;
        }
        
        if (envData.environments) {
          setGithubEnvironments(envData.environments);
        } else {
          setGithubEnvironments([]);
        }
      } catch (error) {
        console.error('Error fetching environments:', error);
        setGithubEnvironments([]);
      } finally {
        setEnvironmentsLoading(false);
      }
    }

    fetchEnvironments();
  }, [project.id]);

  const handleCardClick = () => {
    if (selectionMode) {
      onSelectionChange?.(project.id, !isSelected);
    } else if (onPreview) {
      onPreview(project);
    } else {
      navigate(`/project/${project.id}`);
    }
  };

  const cardStatusClass = {
    healthy: 'project-card-healthy',
    warning: 'project-card-warning',
    critical: 'project-card-critical',
  };

  const dotStatusClass = {
    healthy: 'status-dot-healthy',
    warning: 'status-dot-warning',
    critical: 'status-dot-critical',
  };

  const handleViewDashboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/project/${project.id}`);
  };

  const handleRemoveProject = async () => {
    setIsDeleting(true);
    try {
      // First delete related client_repos entries
      await supabase
        .from('client_repos')
        .delete()
        .eq('repo_id', project.id);

      // Then delete related activity_events
      await supabase
        .from('activity_events')
        .delete()
        .eq('project_id', project.id);

      // Finally delete the repository
      const { error } = await supabase
        .from('repositories')
        .delete()
        .eq('id', project.id);

      if (error) throw error;

      toast({
        title: 'Project removed',
        description: `${project.name} has been removed successfully.`,
      });

      onRemove?.();
    } catch (error) {
      console.error('Error removing project:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <div 
        className={cn(
          'project-card p-4 cursor-pointer transition-all',
          cardStatusClass[project.status],
          isSelected && 'ring-2 ring-primary bg-primary/5'
        )}
        onClick={handleCardClick}
      >
        <div className="flex items-start gap-4">
          {/* Selection Checkbox */}
          {selectionMode && (
            <div className="flex items-center pt-3" onClick={handleCheckboxClick}>
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelectionChange?.(project.id, checked as boolean)}
              />
            </div>
          )}

          {/* Logo */}
          <div className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg flex-shrink-0',
            project.logoColor
          )}>
            {project.logoInitial}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <div className={cn('status-dot', dotStatusClass[project.status])} />
              <h3 className="font-semibold text-lg truncate">{project.name}</h3>
              <span className="text-sm text-muted-foreground">({project.industry})</span>
            </div>

            {/* Environment badges */}
            <div className="flex items-center gap-2 mb-3 min-h-[24px]">
              {environmentsLoading ? (
                <span className="text-xs text-muted-foreground">Loading...</span>
              ) : environmentsPermissionPending ? (
                <span className="text-xs text-warning flex items-center gap-1" title="GitHub App needs 'Environments: Read' permission">
                  <KeyRound className="h-3 w-3" />
                  Pending permission
                </span>
              ) : githubEnvironments.length > 0 ? (
                <>
                  {githubEnvironments.slice(0, 3).map((env) => (
                    <a
                      key={env.id}
                      href={env.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="env-badge hover:bg-muted-foreground/10 transition-colors"
                    >
                      <Server className="h-3 w-3" />
                      {env.name}
                    </a>
                  ))}
                  {githubEnvironments.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{githubEnvironments.length - 3} more
                    </span>
                  )}
                </>
              ) : hasGithubRepo ? (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Server className="h-3 w-3" />
                  No environments
                </span>
              ) : null}
            </div>

            {/* Metrics row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">{project.securityScore}/100</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">GDPR:</span>
                {project.gdprCompliant ? (
                  <span className="text-success font-medium flex items-center gap-0.5">
                    <Check className="h-4 w-4" />
                  </span>
                ) : (
                  <span className="text-warning font-medium flex items-center gap-0.5">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{project.lastDeploy}</span>
              </div>
            </div>

            {/* Issues */}
            {project.issues.length > 0 && (
              <div className="space-y-1">
                {project.issues.map((issue, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "text-sm font-medium",
                      issue.includes('security') || issue.includes('consent') 
                        ? 'text-danger' 
                        : 'text-warning'
                    )}
                  >
                    {issue.includes('security') || issue.includes('consent') ? '🔴' : '⚠️'} {issue}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex gap-1.5"
              onClick={handleViewDashboard}
            >
              View Dashboard
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/project/${project.id}`); }}>
                  View Security Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  Download Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  Configure Alerts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/project/${project.id}/settings`); }}>
                  Project Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-danger focus:text-danger"
                  onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(true); }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{project.name}</strong>? This will delete all associated data including activity events and client assignments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveProject}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Removing...' : 'Remove Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
