import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useGitHubApp, GitHubInstallation, GitHubRepository } from '@/hooks/useGitHubApp';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Github,
  Plus,
  Building2,
  User,
  Lock,
  Globe,
  Star,
  GitBranch,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface GitHubImportDialogProps {
  trigger?: React.ReactNode;
}

type ImportStep = 'select-installation' | 'select-repos' | 'importing' | 'complete';

export function GitHubImportDialog({ trigger }: GitHubImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ImportStep>('select-installation');
  const [selectedInstallation, setSelectedInstallation] = useState<GitHubInstallation | null>(null);
  const [selectedRepos, setSelectedRepos] = useState<Set<number>>(new Set());
  const [importedRepos, setImportedRepos] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);

  const { installations, repositories, loading, error, fetchInstallations, fetchRepositories } = useGitHubApp();
  const { user, currentOrganization } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (open && step === 'select-installation') {
      fetchInstallations();
    }
  }, [open, step, fetchInstallations]);

  useEffect(() => {
    if (selectedInstallation) {
      fetchRepositories(selectedInstallation.id);
      setStep('select-repos');
    }
  }, [selectedInstallation, fetchRepositories]);

  const handleInstallationSelect = (installation: GitHubInstallation) => {
    setSelectedInstallation(installation);
    setSelectedRepos(new Set());
  };

  const handleRepoToggle = (repoId: number) => {
    setSelectedRepos(prev => {
      const next = new Set(prev);
      if (next.has(repoId)) {
        next.delete(repoId);
      } else {
        next.add(repoId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedRepos.size === repositories.length) {
      setSelectedRepos(new Set());
    } else {
      setSelectedRepos(new Set(repositories.map(r => r.id)));
    }
  };

  const handleImport = async () => {
    if (selectedRepos.size === 0) return;

    setImporting(true);
    setStep('importing');
    const imported: string[] = [];

    const reposToImport = repositories.filter(r => selectedRepos.has(r.id));

    if (!currentOrganization?.id) {
      toast({
        variant: 'destructive',
        title: 'No organization selected',
        description: 'Please select an organization before importing repositories.',
      });
      setImporting(false);
      return;
    }

    for (const repo of reposToImport) {
      try {
        // Generate a color based on repo name
        const colors = ['bg-primary', 'bg-success', 'bg-warning', 'bg-danger', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];
        const colorIndex = repo.name.charCodeAt(0) % colors.length;

        const { error: insertError } = await supabase.from('repositories').insert({
          github_repo_id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          status: 'healthy',
          environments: { dev: 'ok', staging: 'ok', prod: 'ok' },
          security_score: 85,
          github_url: repo.html_url,
          default_branch: repo.default_branch,
          private: repo.private,
          language: repo.language,
          stars_count: repo.stargazers_count,
          created_by: user?.id,
          organization_id: currentOrganization.id,
        });

        if (insertError) {
          if (insertError.code === '23505') {
            // Unique constraint violation - repo already imported
            toast({
              variant: 'destructive',
              title: `${repo.name} already imported`,
              description: 'This repository is already in your projects.',
            });
          } else {
            throw insertError;
          }
        } else {
          imported.push(repo.name);
        }
      } catch (err) {
        console.error(`Error importing ${repo.name}:`, err);
        toast({
          variant: 'destructive',
          title: `Failed to import ${repo.name}`,
        });
      }
    }

    setImportedRepos(imported);
    setImporting(false);
    setStep('complete');

    if (imported.length > 0) {
      toast({
        title: `Imported ${imported.length} project${imported.length > 1 ? 's' : ''}`,
        description: imported.join(', '),
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Reset state after animation
    setTimeout(() => {
      setStep('select-installation');
      setSelectedInstallation(null);
      setSelectedRepos(new Set());
      setImportedRepos([]);
    }, 200);
  };

  const handleGoToDashboard = () => {
    handleClose();
    navigate('/');
  };

  const renderInstallationStep = () => (
    <div className="space-y-4">
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="flex items-center gap-3 p-4 border rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 space-y-4">
          <AlertCircle className="h-12 w-12 text-danger mx-auto" />
          <div>
            <p className="font-medium text-danger">Failed to load installations</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
          <Button variant="outline" onClick={fetchInstallations}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      ) : installations.length === 0 ? (
        <div className="text-center py-8 space-y-4">
          <Github className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <p className="font-medium">No GitHub installations found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Install the GitHub App on your account or organization to import repositories.
            </p>
          </div>
          <Button asChild>
            <a 
              href="https://github.com/apps/blueberry-ops/installations/new" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Install GitHub App
            </a>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {installations.map(installation => (
            <button
              key={installation.id}
              onClick={() => handleInstallationSelect(installation)}
              className="w-full flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <img
                src={installation.account.avatar_url}
                alt={installation.account.login}
                className="h-10 w-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{installation.account.login}</span>
                  <Badge variant="outline" className="text-xs">
                    {installation.account.type === 'Organization' ? (
                      <><Building2 className="h-3 w-3 mr-1" /> Org</>
                    ) : (
                      <><User className="h-3 w-3 mr-1" /> Personal</>
                    )}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Installation ID: {installation.id}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderRepoSelectionStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedInstallation(null);
            setStep('select-installation');
          }}
        >
          ← Back
        </Button>
        {repositories.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            {selectedRepos.size === repositories.length ? 'Deselect All' : 'Select All'}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 space-y-4">
          <AlertCircle className="h-12 w-12 text-danger mx-auto" />
          <p className="text-danger">{error}</p>
          <Button variant="outline" onClick={() => selectedInstallation && fetchRepositories(selectedInstallation.id)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      ) : repositories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No repositories found for this installation.</p>
        </div>
      ) : (
        <>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {repositories.map(repo => (
                <label
                  key={repo.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedRepos.has(repo.id) ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                  }`}
                >
                  <Checkbox
                    checked={selectedRepos.has(repo.id)}
                    onCheckedChange={() => handleRepoToggle(repo.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{repo.name}</span>
                      {repo.private ? (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <Globe className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-sm text-muted-foreground truncate">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {repo.stargazers_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        {repo.default_branch}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </ScrollArea>

          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm text-muted-foreground">
              {selectedRepos.size} of {repositories.length} selected
            </span>
            <Button onClick={handleImport} disabled={selectedRepos.size === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Import {selectedRepos.size > 0 ? `(${selectedRepos.size})` : ''}
            </Button>
          </div>
        </>
      )}
    </div>
  );

  const renderImportingStep = () => (
    <div className="text-center py-12 space-y-4">
      <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
      <div>
        <p className="font-medium">Importing repositories...</p>
        <p className="text-sm text-muted-foreground">This may take a moment</p>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center py-8 space-y-4">
      <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
      <div>
        <p className="font-medium text-lg">Import Complete!</p>
        <p className="text-sm text-muted-foreground mt-1">
          {importedRepos.length > 0
            ? `Successfully imported ${importedRepos.length} project${importedRepos.length > 1 ? 's' : ''}`
            : 'No new projects were imported'}
        </p>
      </div>
      {importedRepos.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {importedRepos.map(name => (
            <Badge key={name} variant="secondary">{name}</Badge>
          ))}
        </div>
      )}
      <div className="flex justify-center gap-3 pt-4">
        <Button variant="outline" onClick={() => {
          setStep('select-installation');
          setSelectedInstallation(null);
          setSelectedRepos(new Set());
          setImportedRepos([]);
        }}>
          Import More
        </Button>
        <Button onClick={handleGoToDashboard}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="lg" className="gap-2 px-8">
            <Plus className="h-5 w-5" />
            Connect New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Import from GitHub
          </DialogTitle>
          <DialogDescription>
            {step === 'select-installation' && 'Select a GitHub account or organization to import repositories from.'}
            {step === 'select-repos' && `Select repositories from ${selectedInstallation?.account.login} to import as projects.`}
            {step === 'importing' && 'Please wait while we import your repositories...'}
            {step === 'complete' && 'Your repositories have been imported.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'select-installation' && renderInstallationStep()}
        {step === 'select-repos' && renderRepoSelectionStep()}
        {step === 'importing' && renderImportingStep()}
        {step === 'complete' && renderCompleteStep()}
      </DialogContent>
    </Dialog>
  );
}
