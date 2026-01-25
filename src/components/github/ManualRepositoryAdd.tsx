import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Github, ExternalLink, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

interface ManualRepositoryAddProps {
  trigger?: React.ReactNode;
}

export function ManualRepositoryAdd({ trigger }: ManualRepositoryAddProps) {
  const [open, setOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [requestAdminAccess, setRequestAdminAccess] = useState(false);
  const [repoInfo, setRepoInfo] = useState<{
    name: string;
    full_name: string;
    description: string | null;
    github_url: string;
    private: boolean;
    language: string | null;
    stars_count: number;
    default_branch: string;
    github_repo_id: number | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { user, currentOrganization, organizations, setCurrentOrganization } = useAuth();
  const { toast } = useToast();

  // Parse GitHub URL or full_name (owner/repo)
  const parseRepoInput = (input: string): { owner: string; repo: string } | null => {
    const trimmed = input.trim();
    
    // Handle full URL: https://github.com/owner/repo or https://github.com/owner/repo/
    const urlMatch = trimmed.match(/github\.com\/([^\/]+)\/([^\/\?]+)/);
    if (urlMatch) {
      return { owner: urlMatch[1], repo: urlMatch[2] };
    }
    
    // Handle full_name format: owner/repo
    const fullNameMatch = trimmed.match(/^([^\/]+)\/([^\/]+)$/);
    if (fullNameMatch) {
      return { owner: fullNameMatch[1], repo: fullNameMatch[2] };
    }
    
    return null;
  };

  // Fetch repository info from GitHub
  const fetchRepoInfo = async () => {
    setError(null);
    setRepoInfo(null);
    
    const parsed = parseRepoInput(repoUrl);
    if (!parsed) {
      setError('Invalid format. Please enter a GitHub URL (https://github.com/owner/repo) or full name (owner/repo)');
      return;
    }

    setLoading(true);
    try {
      // Try to fetch via GitHub App first (works for repos in installations)
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-app-auth?action=get-repo&owner=${encodeURIComponent(parsed.owner)}&repo=${encodeURIComponent(parsed.repo)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.repository) {
          setRepoInfo({
            name: data.repository.name,
            full_name: data.repository.full_name,
            description: data.repository.description,
            github_url: data.repository.html_url,
            private: data.repository.private,
            language: data.repository.language,
            stars_count: data.repository.stargazers_count || 0,
            default_branch: data.repository.default_branch || 'main',
            github_repo_id: data.repository.id,
          });
          return;
        }
      }

      // Fallback: Try public GitHub API (works for public repos)
      const publicResponse = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
        headers: {
          'Accept': 'application/vnd.github+json',
        },
      });

      if (publicResponse.ok) {
        const data = await publicResponse.json();
        setRepoInfo({
          name: data.name,
          full_name: data.full_name,
          description: data.description,
          github_url: data.html_url,
          private: data.private,
          language: data.language,
          stars_count: data.stargazers_count || 0,
          default_branch: data.default_branch || 'main',
          github_repo_id: data.id,
        });
      } else if (publicResponse.status === 404) {
        setError('Repository not found. Please check the URL or ensure the repository exists and is accessible.');
      } else if (publicResponse.status === 403) {
        setError('Repository is private and not accessible through GitHub App. Please ensure the GitHub App is installed on this repository.');
      } else {
        setError(`Failed to fetch repository: ${publicResponse.statusText}`);
      }
    } catch (err) {
      console.error('Error fetching repo info:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch repository information');
    } finally {
      setLoading(false);
    }
  };

  // Add repository to database
  const handleAdd = async () => {
    if (!repoInfo) return;

    // Ensure we have an organization
    let orgToUse = currentOrganization;
    if (!orgToUse && organizations.length > 0) {
      orgToUse = organizations[0];
      setCurrentOrganization(orgToUse);
    }

    if (!orgToUse?.id) {
      toast({
        variant: 'destructive',
        title: 'No organization available',
        description: 'Please ensure you are part of an organization before adding repositories.',
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const colors = ['bg-primary', 'bg-success', 'bg-warning', 'bg-danger', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];
      const colorIndex = repoInfo.name.charCodeAt(0) % colors.length;

      const { error: insertError } = await supabase.from('repositories').insert({
        github_repo_id: repoInfo.github_repo_id,
        name: repoInfo.name,
        full_name: repoInfo.full_name,
        description: repoInfo.description,
        status: 'healthy',
        environments: { dev: 'ok', staging: 'ok', prod: 'ok' },
        security_score: 85,
        github_url: repoInfo.github_url,
        default_branch: repoInfo.default_branch,
        private: repoInfo.private,
        language: repoInfo.language,
        stars_count: repoInfo.stars_count,
        created_by: user?.id,
        organization_id: orgToUse.id,
      });

      if (insertError) {
        if (insertError.code === '23505') {
          setError('This repository is already imported.');
        } else {
          throw insertError;
        }
        return;
      }

      setSuccess(true);

      // Request admin access if requested
      if (requestAdminAccess) {
        await requestAdminAccessIssue(repoInfo.full_name);
      }

      toast({
        title: 'Repository added',
        description: `${repoInfo.name} has been added to your organization.`,
      });

      // Reset and close after a delay
      setTimeout(() => {
        setOpen(false);
        setRepoUrl('');
        setRepoInfo(null);
        setSuccess(false);
        setRequestAdminAccess(false);
      }, 2000);
    } catch (err) {
      console.error('Error adding repository:', err);
      setError(err instanceof Error ? err.message : 'Failed to add repository');
    } finally {
      setLoading(false);
    }
  };

  // Create GitHub issue to request admin access
  const requestAdminAccessIssue = async (repoFullName: string) => {
    setRequestingAccess(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-create-issue`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            repoFullName,
            title: `[VibeOps] Admin Access Request`,
            body: `Hello!

I would like to request admin access to this repository for VibeOps Hub integration.

**Purpose:** To enable full VibeOps Hub features including security scanning, deployment tracking, and compliance monitoring.

Please grant admin access to the GitHub App installation for this repository, or add the requester as a collaborator with admin permissions.

Thank you!`,
            labels: ['vibeops', 'access-request'],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to create access request issue:', errorData);
        toast({
          variant: 'destructive',
          title: 'Access request failed',
          description: 'Repository was added, but failed to create access request issue. You can manually request access on GitHub.',
        });
      } else {
        toast({
          title: 'Access request created',
          description: 'A GitHub issue has been created to request admin access.',
        });
      }
    } catch (err) {
      console.error('Error creating access request:', err);
      toast({
        variant: 'destructive',
        title: 'Access request failed',
        description: 'Repository was added, but failed to create access request issue.',
      });
    } finally {
      setRequestingAccess(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Github className="h-4 w-4 mr-2" />
            Add Repository Manually
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Repository Manually</DialogTitle>
          <DialogDescription>
            Add a GitHub repository by URL or full name (owner/repo). You can also request admin access if needed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {success ? (
            <Alert className="border-success/50 bg-success/10">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                Repository added successfully!
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="repo-url">Repository URL or Full Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="repo-url"
                    placeholder="https://github.com/owner/repo or owner/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !loading && repoUrl.trim()) {
                        fetchRepoInfo();
                      }
                    }}
                    disabled={loading}
                  />
                  <Button
                    onClick={fetchRepoInfo}
                    disabled={loading || !repoUrl.trim()}
                    type="button"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Fetch'
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Example: <code className="text-xs">joakimlennartisaksson-byte/offer-craft-34</code>
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {repoInfo && (
                <div className="space-y-4 border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{repoInfo.full_name}</h4>
                      {repoInfo.description && (
                        <p className="text-sm text-muted-foreground">{repoInfo.description}</p>
                      )}
                    </div>
                    <a
                      href={repoInfo.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {repoInfo.language && (
                      <span>Language: {repoInfo.language}</span>
                    )}
                    <span>Stars: {repoInfo.stars_count}</span>
                    <span>Branch: {repoInfo.default_branch}</span>
                    {repoInfo.private && (
                      <span className="text-warning">Private</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-2 border-t">
                    <Checkbox
                      id="request-admin"
                      checked={requestAdminAccess}
                      onCheckedChange={(checked) => setRequestAdminAccess(checked === true)}
                    />
                    <Label
                      htmlFor="request-admin"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Request admin access via GitHub issue
                    </Label>
                  </div>

                  <Button
                    onClick={handleAdd}
                    disabled={loading || requestingAccess}
                    className="w-full"
                  >
                    {loading || requestingAccess ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {requestingAccess ? 'Requesting access...' : 'Adding repository...'}
                      </>
                    ) : (
                      'Add Repository'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
