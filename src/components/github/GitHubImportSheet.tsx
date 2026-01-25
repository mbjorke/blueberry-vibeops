import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useGitHubApp, GitHubInstallation, GitHubRepository } from '@/hooks/useGitHubApp';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Github,
  Building2,
  User,
  Lock,
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ArrowLeft,
  XCircle,
  Search,
} from 'lucide-react';

interface GitHubImportSheetProps {
  trigger?: React.ReactNode;
}

type ImportStep = 'select-installation' | 'select-repos' | 'confirm' | 'importing' | 'complete';

export function GitHubImportSheet({ trigger }: GitHubImportSheetProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ImportStep>('select-installation');
  const [selectedInstallation, setSelectedInstallation] = useState<GitHubInstallation | null>(null);
  const [selectedRepos, setSelectedRepos] = useState<Set<number>>(new Set());
  const [importedRepos, setImportedRepos] = useState<string[]>([]);
  const [failedRepos, setFailedRepos] = useState<{ repo: GitHubRepository; reason: string }[]>([]);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, currentRepo: '' });
  const [repoSearch, setRepoSearch] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
  const cancelImportRef = useRef(false);

  const { installations, repositories, loading, error, fetchInstallations, fetchRepositories } = useGitHubApp();
  const { user, currentOrganization, organizations, setCurrentOrganization, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Ensure currentOrganization is set - use first org if available
  useEffect(() => {
    if (!currentOrganization && organizations.length > 0) {
      setCurrentOrganization(organizations[0]);
    }
  }, [currentOrganization, organizations, setCurrentOrganization]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      // Don't trigger shortcuts when typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (step === 'select-repos') {
          setSelectedInstallation(null);
          setRepoSearch('');
          setVisibilityFilter('all');
          setStep('select-installation');
        } else if (step === 'confirm') {
          setStep('select-repos');
        } else if (step === 'complete') {
          setOpen(false);
        }
      }

      if (e.key === 'Enter' && !e.repeat) {
        if (step === 'select-repos' && selectedRepos.size > 0) {
          e.preventDefault();
          setStep('confirm');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, step, selectedRepos.size]);

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


  const handleImport = async () => {
    if (selectedRepos.size === 0) return;

    // Get organization to use if available - prefer currentOrganization, fallback to first available
    let orgToUse = currentOrganization;
    if (!orgToUse && organizations.length > 0) {
      orgToUse = organizations[0];
      setCurrentOrganization(orgToUse);
    }

    setStep('importing');
    setFailedRepos([]);
    setImportedRepos([]);
    cancelImportRef.current = false;
    const imported: string[] = [];

    const reposToImport = repositories.filter(r => selectedRepos.has(r.id));
    setImportProgress({ current: 0, total: reposToImport.length, currentRepo: '' });

    for (let i = 0; i < reposToImport.length; i++) {
      if (cancelImportRef.current) break;
      
      const repo = reposToImport[i];
      setImportProgress({ current: i, total: reposToImport.length, currentRepo: repo.name });
      try {
        const colors = ['bg-primary', 'bg-success', 'bg-warning', 'bg-danger', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];
        const colorIndex = repo.name.charCodeAt(0) % colors.length;

        const insertData: Record<string, unknown> = {
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
        };

        // Only add organization_id if we have one
        if (orgToUse?.id) {
          insertData.organization_id = orgToUse.id;
        }

        const { error: insertError } = await supabase.from('repositories').insert(insertData);

        if (insertError) {
          if (insertError.code === '23505') {
            setFailedRepos(prev => [...prev, { repo, reason: 'Already imported' }]);
          } else {
            setFailedRepos(prev => [...prev, { repo, reason: insertError.message || 'Database error' }]);
          }
        } else {
          imported.push(repo.name);
          setImportedRepos([...imported]);
        }
      } catch (err) {
        console.error(`Error importing ${repo.name}:`, err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setFailedRepos(prev => [...prev, { repo, reason: errorMessage }]);
      }
    }

    setImportedRepos(imported);
    setStep('complete');

    if (cancelImportRef.current) {
      toast({
        title: 'Import cancelled',
        description: imported.length > 0 ? `${imported.length} project(s) were imported before cancellation` : undefined,
      });
    } else if (imported.length > 0) {
      toast({
        title: `Imported ${imported.length} project${imported.length > 1 ? 's' : ''}`,
        description: imported.join(', '),
      });
    }
  };

  const handleCancelImport = () => {
    cancelImportRef.current = true;
  };

  const handleClose = () => {
    setOpen(false);
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

  const handleRetryFailed = async () => {
    // Get organization to use if available
    let orgToUse = currentOrganization;
    if (!orgToUse && organizations.length > 0) {
      orgToUse = organizations[0];
      setCurrentOrganization(orgToUse);
    }

    const reposToRetry = failedRepos.map(f => f.repo);
    setFailedRepos([]);
    setStep('importing');
    cancelImportRef.current = false;
    setImportProgress({ current: 0, total: reposToRetry.length, currentRepo: '' });

    const newImported = [...importedRepos];
    const newFailed: { repo: GitHubRepository; reason: string }[] = [];

    for (let i = 0; i < reposToRetry.length; i++) {
      if (cancelImportRef.current) break;
      const repo = reposToRetry[i];
      setImportProgress({ current: i, total: reposToRetry.length, currentRepo: repo.name });

      try {
        const colors = ['bg-primary', 'bg-success', 'bg-warning', 'bg-danger', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];
        const colorIndex = repo.name.charCodeAt(0) % colors.length;

        const insertData: Record<string, unknown> = {
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
        };

        // Only add organization_id if we have one
        if (orgToUse?.id) {
          insertData.organization_id = orgToUse.id;
        }

        const { error: insertError } = await supabase.from('repositories').insert(insertData);

        if (insertError) {
          if (insertError.code === '23505') {
            newFailed.push({ repo, reason: 'Already imported' });
          } else {
            newFailed.push({ repo, reason: insertError.message || 'Database error' });
          }
        } else {
          newImported.push(repo.name);
          setImportedRepos([...newImported]);
        }
      } catch (err) {
        console.error(`Error importing ${repo.name}:`, err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        newFailed.push({ repo, reason: errorMessage });
      }
    }

    setFailedRepos(newFailed);
    setStep('complete');

    if (newImported.length > importedRepos.length) {
      toast({
        title: `Imported ${newImported.length - importedRepos.length} more project(s)`,
      });
    }
  };

  const renderInstallationStep = () => (
    <div className="space-y-4 py-4">
      <p className="text-sm text-muted-foreground">
        Select a GitHub account or organization to import repositories from.
      </p>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="flex items-center gap-3 p-4 border rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 space-y-4">
          <AlertCircle className="h-10 w-10 text-danger mx-auto" />
          <div>
            <p className="font-medium text-danger">Failed to load</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchInstallations}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      ) : installations.length === 0 ? (
        <div className="text-center py-8 space-y-4">
          <Github className="h-10 w-10 text-muted-foreground mx-auto" />
          <div>
            <p className="font-medium">No installations found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Install the GitHub App to get started.
            </p>
          </div>
          <Button size="sm" asChild>
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
              className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <img
                src={installation.account.avatar_url}
                alt={installation.account.login}
                className="h-9 w-9 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{installation.account.login}</span>
                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                    {installation.account.type === 'Organization' ? (
                      <Building2 className="h-3 w-3" />
                    ) : (
                      <User className="h-3 w-3" />
                    )}
                  </Badge>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderRepoSelectionStep = () => {
    const filteredRepos = repositories.filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(repoSearch.toLowerCase());
      const matchesVisibility = visibilityFilter === 'all' || 
        (visibilityFilter === 'private' && repo.private) ||
        (visibilityFilter === 'public' && !repo.private);
      return matchesSearch && matchesVisibility;
    });
    const allFilteredSelected = filteredRepos.length > 0 && filteredRepos.every(r => selectedRepos.has(r.id));
    
    const publicCount = repositories.filter(r => !r.private).length;
    const privateCount = repositories.filter(r => r.private).length;

    const handleSelectAllFiltered = () => {
      if (allFilteredSelected) {
        setSelectedRepos(prev => {
          const next = new Set(prev);
          filteredRepos.forEach(r => next.delete(r.id));
          return next;
        });
      } else {
        setSelectedRepos(prev => {
          const next = new Set(prev);
          filteredRepos.forEach(r => next.add(r.id));
          return next;
        });
      }
    };

    return (
      <div className="space-y-4 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedInstallation(null);
              setRepoSearch('');
              setVisibilityFilter('all');
              setStep('select-installation');
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          {filteredRepos.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleSelectAllFiltered}>
              {allFilteredSelected ? 'Deselect All' : 'Select All'}
            </Button>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Select repositories from <span className="font-medium text-foreground">{selectedInstallation?.account.login}</span>
        </p>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-6 space-y-3">
            <AlertCircle className="h-8 w-8 text-danger mx-auto" />
            <p className="text-sm text-danger">{error}</p>
            <Button variant="outline" size="sm" onClick={() => selectedInstallation && fetchRepositories(selectedInstallation.id)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : repositories.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No repositories found.</p>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search repositories..."
                value={repoSearch}
                onChange={(e) => setRepoSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-1">
              <Button
                variant={visibilityFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVisibilityFilter('all')}
                className="flex-1 text-xs"
              >
                All ({repositories.length})
              </Button>
              <Button
                variant={visibilityFilter === 'public' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVisibilityFilter('public')}
                className="flex-1 text-xs gap-1"
              >
                <Globe className="h-3 w-3" />
                Public ({publicCount})
              </Button>
              <Button
                variant={visibilityFilter === 'private' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVisibilityFilter('private')}
                className="flex-1 text-xs gap-1"
              >
                <Lock className="h-3 w-3" />
                Private ({privateCount})
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-470px)]">
              <div className="space-y-1.5 pr-3">
                {filteredRepos.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No repositories match "{repoSearch}"
                  </p>
                ) : (
                  filteredRepos.map(repo => (
                    <label
                      key={repo.id}
                      className={`flex items-center gap-3 p-2.5 border rounded-lg cursor-pointer transition-colors ${
                        selectedRepos.has(repo.id) ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                      }`}
                    >
                      <Checkbox
                        checked={selectedRepos.has(repo.id)}
                        onCheckedChange={() => handleRepoToggle(repo.id)}
                      />
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{repo.name}</span>
                        {repo.private ? (
                          <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <Globe className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="pt-3 border-t space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedRepos.size} selected
                </span>
                <Button size="sm" onClick={() => setStep('confirm')} disabled={selectedRepos.size === 0}>
                  Continue
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Esc</kbd> to go back
                {selectedRepos.size > 0 && (
                  <> · <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Enter</kbd> to continue</>
                )}
              </p>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderConfirmStep = () => {
    const reposToImport = repositories.filter(r => selectedRepos.has(r.id));
    
    return (
      <div className="space-y-4 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep('select-repos')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium text-sm">Confirm Import</h3>
          <p className="text-sm text-muted-foreground">
            You're about to import {reposToImport.length} repositor{reposToImport.length === 1 ? 'y' : 'ies'} as new projects:
          </p>
          
          <ScrollArea className="h-[200px] border rounded-lg">
            <div className="p-3 space-y-2">
              {reposToImport.map(repo => (
                <div key={repo.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="font-medium truncate">{repo.name}</span>
                  {repo.private ? (
                    <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <Globe className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
            <p className="font-medium">What will be created:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {reposToImport.length} new project{reposToImport.length === 1 ? '' : 's'} in your dashboard
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Default environment status (dev, staging, prod)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Initial security score of 85%
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-3 border-t space-y-2">
          <Button className="w-full" onClick={handleImport}>
            Confirm Import
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Esc</kbd> to go back
          </p>
        </div>
      </div>
    );
  };

  const renderImportingStep = () => {
    const { current, total, currentRepo } = importProgress;
    const percentage = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;
    
    return (
      <div className="py-8 space-y-6">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 text-primary mx-auto animate-spin" />
          <p className="font-medium">Importing repositories...</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{current + 1} of {total}</span>
          </div>
          
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {currentRepo && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 min-w-0">
                <Loader2 className="h-4 w-4 text-primary animate-spin flex-shrink-0" />
                <span className="text-sm truncate">
                  Importing <span className="font-medium">{currentRepo}</span>...
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCancelImport}
                className="flex-shrink-0 text-muted-foreground hover:text-destructive"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCancelImport}
            className="w-full"
          >
            Cancel Import
          </Button>
        </div>

        <ScrollArea className="max-h-[140px]">
          <div className="space-y-1.5 pr-3">
            {importedRepos.map(name => (
              <div key={name} className="flex items-center gap-2 text-sm text-success">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{name}</span>
              </div>
            ))}
            {failedRepos.map(({ repo, reason }) => (
              <div key={repo.id} className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-medium truncate block">{repo.name}</span>
                  <span className="text-xs text-muted-foreground truncate block">{reason}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderCompleteStep = () => {
    const hasFailures = failedRepos.length > 0;
    const hasSuccess = importedRepos.length > 0;
    
    return (
      <div className="py-6 space-y-4">
        <div className="text-center space-y-2">
          {hasSuccess && !hasFailures ? (
            <CheckCircle2 className="h-10 w-10 text-success mx-auto" />
          ) : hasFailures && !hasSuccess ? (
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          ) : (
            <AlertCircle className="h-10 w-10 text-warning mx-auto" />
          )}
          <p className="font-medium">
            {hasSuccess && !hasFailures ? 'Import Complete!' : 
             hasFailures && !hasSuccess ? 'Import Failed' : 
             'Import Completed with Errors'}
          </p>
        </div>

        {hasSuccess && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-success flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              {importedRepos.length} imported successfully
            </p>
            <div className="flex flex-wrap gap-1.5">
              {importedRepos.map(name => (
                <Badge key={name} variant="secondary" className="text-xs">{name}</Badge>
              ))}
            </div>
          </div>
        )}

        {hasFailures && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-destructive flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                {failedRepos.length} failed to import
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRetryFailed}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry Failed
              </Button>
            </div>
            <div className="bg-destructive/10 rounded-lg p-3 space-y-2">
              {failedRepos.map(({ repo, reason }) => (
                <div key={repo.id} className="text-sm">
                  <span className="font-medium">{repo.name}</span>
                  <span className="text-muted-foreground"> — {reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <div className="flex flex-col gap-2">
            <Button onClick={handleGoToDashboard}>
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => {
              setStep('select-installation');
              setSelectedInstallation(null);
              setSelectedRepos(new Set());
              setImportedRepos([]);
              setFailedRepos([]);
            }}>
              Import More
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Esc</kbd> to close
          </p>
        </div>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button size="lg" className="gap-2">
            <Github className="h-5 w-5" />
            Import from GitHub
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-[380px] sm:w-[420px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Import from GitHub
          </SheetTitle>
          <SheetDescription className="sr-only">
            Import repositories from GitHub as projects
          </SheetDescription>
        </SheetHeader>

        {/* Step Progress Indicator */}
        <div className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">
              Step {step === 'select-installation' ? 1 : step === 'select-repos' ? 2 : step === 'confirm' ? 3 : 4} of 4
            </span>
            <span className="text-xs font-medium">
              {step === 'select-installation' && 'Select Account'}
              {step === 'select-repos' && 'Choose Repos'}
              {step === 'confirm' && 'Confirm'}
              {(step === 'importing' || step === 'complete') && 'Complete'}
            </span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((s) => {
              const currentStep = step === 'select-installation' ? 1 : step === 'select-repos' ? 2 : step === 'confirm' ? 3 : 4;
              const isActive = s === currentStep;
              const isCompleted = s < currentStep;
              return (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-primary' : isActive ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div key={step} className="animate-fade-in">
          {step === 'select-installation' && renderInstallationStep()}
          {step === 'select-repos' && renderRepoSelectionStep()}
          {step === 'confirm' && renderConfirmStep()}
          {step === 'importing' && renderImportingStep()}
          {step === 'complete' && renderCompleteStep()}
        </div>
      </SheetContent>
    </Sheet>
  );
}
