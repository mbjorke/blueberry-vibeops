import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  Clock, 
  Check, 
  AlertTriangle, 
  Rocket,
  FileCheck,
  Settings,
  MoreHorizontal,
  ExternalLink,
  Activity,
  Github,
  Copy,
  Bug,
  ChevronDown,
  Server,
  KeyRound
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Project, type EnvironmentStatus } from '@/types/project';
import { SecurityScanReport } from '@/components/project-detail/SecurityScanReport';
import { DeploymentHistory } from '@/components/project-detail/DeploymentHistory';
import { GDPRChecklist } from '@/components/project-detail/GDPRChecklist';
import { ActivityTimeline } from '@/components/project-detail/ActivityTimeline';
import { useRealtimeActivity } from '@/hooks/useRealtimeActivity';
import { useProjectDetailData } from '@/hooks/useProjectDetailData';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface GitHubEnvironment {
  id: number;
  name: string;
  url: string;
  html_url: string;
  created_at: string;
  updated_at: string;
}

interface DbProject {
  id: string;
  name: string;
  full_name: string | null;
  description: string | null;
  language: string | null;
  status: string;
  environments: {
    dev: string;
    staging: string;
    prod: string;
  };
  security_score: number | null;
  last_deploy: string | null;
  issues: string[] | null;
  github_url: string | null;
}

function mapDbProjectToProject(dbProject: DbProject): Project {
  return {
    id: dbProject.id,
    name: dbProject.name,
    industry: dbProject.language || 'Software',
    status: (dbProject.status as 'healthy' | 'warning' | 'critical') || 'healthy',
    environments: {
      dev: (dbProject.environments?.dev as EnvironmentStatus) || 'ok',
      staging: (dbProject.environments?.staging as EnvironmentStatus) || 'ok',
      prod: (dbProject.environments?.prod as EnvironmentStatus) || 'ok',
    },
    securityScore: dbProject.security_score ?? 85,
    gdprCompliant: false,
    gdprWarning: false,
    lastDeploy: dbProject.last_deploy || 'Never',
    issues: dbProject.issues || [],
    logoInitial: dbProject.name.charAt(0).toUpperCase(),
    logoColor: 'bg-primary',
  };
}

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [githubUrl, setGithubUrl] = useState<string | null>(null);
  const [repoFullName, setRepoFullName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [githubEnvironments, setGithubEnvironments] = useState<GitHubEnvironment[]>([]);
  const [environmentsLoading, setEnvironmentsLoading] = useState(false);
  const [environmentsPermissionPending, setEnvironmentsPermissionPending] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      if (!projectId) return;

      try {
        const { data, error } = await supabase
          .from('repositories')
          .select('*')
          .eq('id', projectId)
          .single();

        if (error) throw error;

        if (data) {
          const dbProject = {
            ...data,
            environments: data.environments as { dev: string; staging: string; prod: string },
          } as DbProject;
          setProject(mapDbProjectToProject(dbProject));
          setGithubUrl(data.github_url || null);
          setRepoFullName(data.full_name || null);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        setProject(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [projectId]);

  // Fetch GitHub environments when we have a repo
  useEffect(() => {
    async function fetchEnvironments() {
      if (!repoFullName) {
        setGithubEnvironments([]);
        return;
      }

      setEnvironmentsLoading(true);
      setEnvironmentsPermissionPending(false);
      
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-app-auth?action=list-environments&repo=${encodeURIComponent(repoFullName)}`,
          {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
          }
        );

        const data = await response.json();
        
        // Handle permission errors - show pending permission indicator
        if (data.errorCode === 'MISSING_ENVIRONMENTS_PERMISSION') {
          setEnvironmentsPermissionPending(true);
          setGithubEnvironments([]);
          return;
        }
        
        if (!response.ok) {
          setGithubEnvironments([]);
          return;
        }
        
        if (data.environments) {
          setGithubEnvironments(data.environments);
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
  }, [repoFullName]);
  // Fetch project detail data (security findings, deployments, GDPR checklist)
  const {
    securityFindings,
    deployments,
    gdprChecklist,
    loading: detailDataLoading,
    toggleGDPRItem,
    updateFindingStatus,
    refetch: refetchDetailData,
  } = useProjectDetailData(projectId || '');
  
  // Sync Dependabot alerts from GitHub
  const handleSyncDependabot = async () => {
    if (!repoFullName || !projectId) {
      toast.error('Repository information is required to sync Dependabot alerts.');
      return;
    }

    try {
      // Fetch Dependabot alerts from GitHub
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-app-auth?action=list-dependabot-alerts&repo=${encodeURIComponent(repoFullName)}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      const data = await response.json();

      if (data.errorCode === 'MISSING_DEPENDABOT_PERMISSION') {
        toast.error('The GitHub App needs "Security events: Read" permission to fetch Dependabot alerts.');
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Dependabot alerts');
      }

      const alerts = data.alerts || [];
      
      if (alerts.length === 0) {
        toast.info('No Dependabot alerts found for this repository.');
        return;
      }

      // Map GitHub alerts to security findings and upsert them
      const findingsToUpsert = alerts.map((alert: any) => {
        // Map GitHub severity to our severity levels
        const severityMap: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
          'critical': 'critical',
          'high': 'high',
          'moderate': 'medium',
          'medium': 'medium',
          'low': 'low',
        };

        const severity = severityMap[alert.security_vulnerability?.severity?.toLowerCase() || 'low'] || 'low';
        const dependency = alert.dependency?.package?.name || 'Unknown';
        const vulnerability = alert.security_vulnerability;
        const cve = vulnerability?.cve_id || '';
        const summary = vulnerability?.summary || '';
        const description = vulnerability?.description || summary || `Vulnerability in ${dependency}`;

        return {
          project_id: projectId,
          title: `Dependency vulnerability: ${dependency}${cve ? ` (${cve})` : ''}`,
          description: description,
          severity: severity,
          status: alert.state === 'dismissed' ? 'ignored' : alert.state === 'fixed' ? 'fixed' : 'open',
          category: 'Dependencies',
          recommendation: vulnerability?.first_patched_version 
            ? `Update ${dependency} to version ${vulnerability.first_patched_version.identifier} or later`
            : `Update ${dependency} to a patched version`,
          // Store GitHub alert number for reference
          file_path: `package.json`,
          created_at: alert.created_at || new Date().toISOString(),
        };
      });

      // Insert or update findings - check for existing ones by title
      let syncedCount = 0;
      for (const finding of findingsToUpsert) {
        // Check if finding already exists by title and project_id
        const { data: existing } = await supabase
          .from('security_findings')
          .select('id')
          .eq('project_id', finding.project_id)
          .eq('title', finding.title)
          .maybeSingle();

        if (existing) {
          // Update existing finding
          const { error: updateError } = await supabase
            .from('security_findings')
            .update({
              description: finding.description,
              severity: finding.severity,
              status: finding.status,
              recommendation: finding.recommendation,
            })
            .eq('id', existing.id);
          
          if (!updateError) syncedCount++;
        } else {
          // Insert new finding
          const { error: insertError } = await supabase
            .from('security_findings')
            .insert(finding);
          
          if (!insertError) syncedCount++;
        }
      }

      toast.success(`Synced ${syncedCount} dependency vulnerability alert${syncedCount === 1 ? '' : 's'} from GitHub.`);

      // Refetch to show new findings
      await refetchDetailData();
    } catch (error) {
      console.error('Error syncing Dependabot alerts:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sync Dependabot alerts.');
    }
  };
  
  // Use real-time activity hook
  const { events: realtimeEvents, loading: activityLoading, isRealtime } = useRealtimeActivity({
    projectId: project?.id || '',
    fallbackEvents: [],
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-dashboard">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16 gap-4">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
        </header>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-96" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!project) {
    return (
      <div className="min-h-screen bg-dashboard flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
          <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-dashboard">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
              
              <div className="h-6 w-px bg-border" />
              
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center text-primary-foreground font-bold',
                  project.logoColor
                )}>
                  {project.logoInitial}
                </div>
                <div>
                  <h1 className="font-semibold text-lg leading-tight">{project.name}</h1>
                  <p className="text-sm text-muted-foreground">{project.industry}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                {environmentsLoading ? (
                  <span className="text-xs text-muted-foreground">Loading environments...</span>
                ) : environmentsPermissionPending ? (
                  <span className="text-xs text-warning flex items-center gap-1" title="GitHub App needs 'Environments: Read' permission">
                    <KeyRound className="h-3 w-3" />
                    Pending permission
                  </span>
                ) : githubEnvironments.length > 0 ? (
                  githubEnvironments.map((env) => (
                    <a
                      key={env.id}
                      href={env.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="env-badge hover:bg-muted-foreground/10 transition-colors"
                    >
                      <Server className="h-3 w-3" />
                      {env.name}
                    </a>
                  ))
                ) : repoFullName ? (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Server className="h-3 w-3" />
                    No environments
                  </span>
                ) : null}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Github className="h-4 w-4" />
                    <span className="hidden sm:inline">GitHub</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
                  {githubUrl ? (
                    <>
                      <DropdownMenuItem 
                        onClick={() => window.open(githubUrl, '_blank')}
                        className="gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View on GitHub
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => window.open(`${githubUrl}/issues`, '_blank')}
                        className="gap-2"
                      >
                        <Bug className="h-4 w-4" />
                        Open Issues
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => {
                          navigator.clipboard.writeText(githubUrl);
                          toast.success('Repository URL copied to clipboard');
                        }}
                        className="gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Repo URL
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem disabled className="gap-2 text-muted-foreground">
                      <Github className="h-4 w-4" />
                      No repository linked
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate(`/project/${projectId}/settings`)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Project Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>Configure Alerts</DropdownMenuItem>
                  <DropdownMenuItem>Download Report</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-danger focus:text-danger">
                    Remove Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Project Status Bar */}
      <div className="bg-card border-b">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-6">
            {/* Status */}
            <div className="flex items-center gap-2">
              <div className={cn('status-dot', dotStatusClass[project.status])} />
              <span className={cn('font-medium', statusClass[project.status])}>
                {statusLabel[project.status]}
              </span>
            </div>

            <div className="h-4 w-px bg-border hidden sm:block" />

            {/* Security Score */}
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm">Security Score:</span>
              <span className={cn(
                'font-semibold',
                project.securityScore >= 90 ? 'text-success' : 
                project.securityScore >= 80 ? 'text-warning' : 'text-danger'
              )}>
                {project.securityScore}/100
              </span>
            </div>

            <div className="h-4 w-px bg-border hidden sm:block" />

            {/* GDPR */}
            <div className="flex items-center gap-2">
              <span className="text-sm">GDPR:</span>
              {project.gdprCompliant ? (
                <Badge className="bg-success/10 text-success border-success/20">
                  <Check className="h-3 w-3 mr-1" />
                  Compliant
                </Badge>
              ) : (
                <Badge className="bg-warning/10 text-warning border-warning/20">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Action Required
                </Badge>
              )}
            </div>

            <div className="h-4 w-px bg-border hidden sm:block" />

            {/* Last Deploy */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Last deploy: {project.lastDeploy}
            </div>
          </div>

          {/* Issues if any */}
          {project.issues.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {project.issues.map((issue, index) => (
                <Badge 
                  key={index}
                  variant="outline"
                  className={cn(
                    issue.includes('security') || issue.includes('consent') 
                      ? 'bg-danger/10 text-danger border-danger/20' 
                      : 'bg-warning/10 text-warning border-warning/20'
                  )}
                >
                  {issue.includes('security') || issue.includes('consent') ? '🔴' : '⚠️'} {issue}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content with Tabs */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="security" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security Scan</span>
              <span className="sm:hidden">Security</span>
            </TabsTrigger>
            <TabsTrigger value="deployments" className="gap-2">
              <Rocket className="h-4 w-4" />
              <span className="hidden sm:inline">Deployments</span>
              <span className="sm:hidden">Deploy</span>
            </TabsTrigger>
            <TabsTrigger value="gdpr" className="gap-2">
              <FileCheck className="h-4 w-4" />
              <span className="hidden sm:inline">GDPR Compliance</span>
              <span className="sm:hidden">GDPR</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Activity</span>
              <span className="sm:hidden">Activity</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="mt-6">
            <SecurityScanReport 
              findings={securityFindings} 
              securityScore={project.securityScore}
              loading={detailDataLoading}
              onUpdateStatus={updateFindingStatus}
              githubUrl={githubUrl || undefined}
              repoFullName={repoFullName || undefined}
              projectId={projectId}
              onSyncDependabot={handleSyncDependabot}
            />
          </TabsContent>

          <TabsContent value="deployments" className="mt-6">
            <DeploymentHistory 
              deployments={deployments}
              loading={detailDataLoading}
            />
          </TabsContent>

          <TabsContent value="gdpr" className="mt-6">
            <GDPRChecklist 
              checklist={gdprChecklist} 
              isCompliant={project.gdprCompliant}
              loading={detailDataLoading}
              onToggleItem={toggleGDPRItem}
            />
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <ActivityTimeline 
              events={realtimeEvents} 
              loading={activityLoading}
              isRealtime={isRealtime}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
