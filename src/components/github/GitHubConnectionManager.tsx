import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useGitHubApp, GitHubInstallation } from '@/hooks/useGitHubApp';
import { supabase } from '@/integrations/supabase/client';
import {
  Settings,
  Github,
  Building2,
  User,
  Trash2,
  Unlink,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Lock,
  Globe,
} from 'lucide-react';

interface ConnectedProject {
  id: string;
  name: string;
  full_name: string;
  github_repo_id: number;
  private: boolean;
}

interface GitHubConnectionManagerProps {
  trigger?: React.ReactNode;
}

export function GitHubConnectionManager({ trigger }: GitHubConnectionManagerProps) {
  const [open, setOpen] = useState(false);
  const [connectedProjects, setConnectedProjects] = useState<ConnectedProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [disconnectTarget, setDisconnectTarget] = useState<ConnectedProject | null>(null);
  const [disconnectInstallation, setDisconnectInstallation] = useState<GitHubInstallation | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);

  const { installations, loading, error, fetchInstallations } = useGitHubApp();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchInstallations();
      fetchConnectedProjects();
    }
  }, [open, fetchInstallations]);

  const fetchConnectedProjects = async () => {
    setLoadingProjects(true);
    try {
      const { data, error } = await supabase
        .from('repositories')
        .select('id, name, full_name, github_repo_id, private')
        .not('github_repo_id', 'is', null);

      if (error) throw error;
      setConnectedProjects((data || []) as ConnectedProject[]);
    } catch (err) {
      console.error('Error fetching connected projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleDisconnectProject = async () => {
    if (!disconnectTarget) return;
    
    setDisconnecting(true);
    try {
      const { error } = await supabase
        .from('repositories')
        .delete()
        .eq('id', disconnectTarget.id);

      if (error) throw error;

      setConnectedProjects(prev => prev.filter(p => p.id !== disconnectTarget.id));
      toast({
        title: 'Project disconnected',
        description: `${disconnectTarget.name} has been removed from tracking.`,
      });
    } catch (err) {
      console.error('Error disconnecting project:', err);
      toast({
        variant: 'destructive',
        title: 'Failed to disconnect',
        description: 'Could not remove the project. Please try again.',
      });
    } finally {
      setDisconnecting(false);
      setDisconnectTarget(null);
    }
  };

  const handleDisconnectInstallation = () => {
    if (!disconnectInstallation) return;
    
    // Open GitHub's installation settings page
    window.open(
      `https://github.com/settings/installations/${disconnectInstallation.id}`,
      '_blank'
    );
    
    toast({
      title: 'Manage installation on GitHub',
      description: 'Use the GitHub settings page to uninstall the app.',
    });
    
    setDisconnectInstallation(null);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Manage Connections
            </Button>
          )}
        </SheetTrigger>
        <SheetContent className="w-[380px] sm:w-[420px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              GitHub Connections
            </SheetTitle>
            <SheetDescription>
              Manage your connected GitHub accounts and projects
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Connected Installations */}
            <section>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Connected Accounts
              </h3>
              
              {loading ? (
                <div className="space-y-2">
                  {[1, 2].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-24 flex-1" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-4 space-y-2">
                  <AlertCircle className="h-8 w-8 text-danger mx-auto" />
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <Button variant="outline" size="sm" onClick={fetchInstallations}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              ) : installations.length === 0 ? (
                <div className="text-center py-4 border rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">No GitHub accounts connected</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {installations.map(installation => (
                    <div
                      key={installation.id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <img
                        src={installation.account.avatar_url}
                        alt={installation.account.login}
                        className="h-8 w-8 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {installation.account.login}
                          </span>
                          <Badge variant="outline" className="text-xs px-1.5 py-0">
                            {installation.account.type === 'Organization' ? (
                              <Building2 className="h-3 w-3" />
                            ) : (
                              <User className="h-3 w-3" />
                            )}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDisconnectInstallation(installation)}
                        className="text-danger hover:text-danger hover:bg-danger/10"
                      >
                        <Unlink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <Button variant="link" size="sm" className="mt-2 p-0 h-auto" asChild>
                <a 
                  href="https://github.com/apps/blueberry-ops/installations/new" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Add another account
                </a>
              </Button>
            </section>

            {/* Connected Projects */}
            <section>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Github className="h-4 w-4" />
                Connected Projects ({connectedProjects.length})
              </h3>
              
              {loadingProjects ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 p-2.5 border rounded-lg">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32 flex-1" />
                    </div>
                  ))}
                </div>
              ) : connectedProjects.length === 0 ? (
                <div className="text-center py-4 border rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">No projects connected</p>
                </div>
              ) : (
                <ScrollArea className="h-[250px]">
                  <div className="space-y-1.5 pr-3">
                    {connectedProjects.map(project => (
                      <div
                        key={project.id}
                        className="flex items-center gap-3 p-2.5 border rounded-lg hover:bg-muted/30 transition-colors group"
                      >
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          {project.private ? (
                            <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <Globe className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className="text-sm truncate">{project.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDisconnectTarget(project)}
                          className="opacity-0 group-hover:opacity-100 text-danger hover:text-danger hover:bg-danger/10 h-7 w-7 p-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </section>
          </div>
        </SheetContent>
      </Sheet>

      {/* Disconnect Project Dialog */}
      <AlertDialog open={!!disconnectTarget} onOpenChange={(open) => !open && setDisconnectTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <span className="font-medium">{disconnectTarget?.name}</span> from your dashboard. 
              The GitHub repository will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disconnecting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnectProject}
              disabled={disconnecting}
              className="bg-danger hover:bg-danger/90"
            >
              {disconnecting ? 'Disconnecting...' : 'Disconnect'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disconnect Installation Dialog */}
      <AlertDialog open={!!disconnectInstallation} onOpenChange={(open) => !open && setDisconnectInstallation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect GitHub account?</AlertDialogTitle>
            <AlertDialogDescription>
              To disconnect <span className="font-medium">{disconnectInstallation?.account.login}</span>, 
              you'll need to uninstall the app from GitHub's settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnectInstallation}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open GitHub Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
