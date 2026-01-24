import { useState } from 'react';
import { Github, Bug, Wrench, Loader2, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { type SecurityFinding } from '@/hooks/useProjectDetailData';

interface FindingActionsDropdownProps {
  finding: SecurityFinding;
  githubUrl?: string;
  repoFullName?: string;
}

export function FindingActionsDropdown({ 
  finding, 
  githubUrl,
  repoFullName 
}: FindingActionsDropdownProps) {
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);
  const [isEnablingDependabot, setIsEnablingDependabot] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  const hasGitHubConnection = !!githubUrl && !!repoFullName;
  const isDependencyIssue = finding.category?.toLowerCase().includes('dependency') || 
                            finding.title.toLowerCase().includes('dependency') ||
                            finding.title.toLowerCase().includes('outdated') ||
                            finding.title.toLowerCase().includes('vulnerable package');

  const handleCreateIssue = async () => {
    if (!repoFullName) {
      toast.error('No GitHub repository linked to this project');
      return;
    }

    setIsCreatingIssue(true);
    try {
      const issueBody = `## Security Finding

**Severity:** ${finding.severity.toUpperCase()}
**Category:** ${finding.category || 'General'}
**Status:** ${finding.status}

### Description
${finding.description}

${finding.recommendation ? `### Recommendation\n${finding.recommendation}` : ''}

${finding.filePath ? `### Location\n\`${finding.filePath}${finding.lineNumber ? `:${finding.lineNumber}` : ''}\`` : ''}

---
*This issue was automatically created from VibeOps Security Scan*`;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-create-issue?action=create-issue`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            repoFullName,
            title: `[Security] ${finding.title}`,
            body: issueBody,
            labels: ['security', finding.severity, 'automated'],
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // Check for permission error
        if (result.errorCode === 'MISSING_ISSUES_PERMISSION') {
          setShowPermissionDialog(true);
          return;
        }
        throw new Error(result.error || 'Failed to create issue');
      }

      toast.success('GitHub issue created', {
        description: `Issue #${result.issue.number} created successfully`,
        action: {
          label: 'View Issue',
          onClick: () => window.open(result.issue.url, '_blank'),
        },
      });
    } catch (error) {
      console.error('Error creating issue:', error);
      toast.error('Failed to create GitHub issue', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsCreatingIssue(false);
    }
  };

  const handleEnableDependabot = async () => {
    if (!repoFullName) {
      toast.error('No GitHub repository linked to this project');
      return;
    }

    setIsEnablingDependabot(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-create-issue?action=trigger-dependabot`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ repoFullName }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to enable Dependabot');
      }

      toast.success('Dependabot enabled', {
        description: 'Dependabot will automatically create PRs for vulnerable dependencies',
      });
    } catch (error) {
      console.error('Error enabling Dependabot:', error);
      toast.error('Failed to enable Dependabot', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsEnablingDependabot(false);
    }
  };

  const handleOpenInGitHub = () => {
    if (githubUrl) {
      if (finding.filePath) {
        const fileUrl = `${githubUrl}/blob/main/${finding.filePath}${finding.lineNumber ? `#L${finding.lineNumber}` : ''}`;
        window.open(fileUrl, '_blank');
      } else {
        window.open(githubUrl, '_blank');
      }
    }
  };

  // Desktop: Show buttons directly
  const DesktopActions = () => (
    <div className="hidden md:flex items-center gap-2">
      {hasGitHubConnection ? (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateIssue}
            disabled={isCreatingIssue}
            className="gap-1.5 text-xs"
          >
            {isCreatingIssue ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Bug className="h-3.5 w-3.5" />
            )}
            Create Issue
          </Button>
          
          {isDependencyIssue && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnableDependabot}
              disabled={isEnablingDependabot}
              className="gap-1.5 text-xs"
            >
              {isEnablingDependabot ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Wrench className="h-3.5 w-3.5" />
              )}
              Dependabot Fix
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenInGitHub}
            className="gap-1.5 text-xs"
          >
            <Github className="h-3.5 w-3.5" />
            View
          </Button>
        </>
      ) : (
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Github className="h-3.5 w-3.5" />
          No repo linked
        </span>
      )}
    </div>
  );

  // Mobile: Show dropdown menu
  const MobileActions = () => (
    <div className="md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="shrink-0"
            disabled={isCreatingIssue || isEnablingDependabot}
          >
            {isCreatingIssue || isEnablingDependabot ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-popover z-50">
          {hasGitHubConnection ? (
            <>
              <DropdownMenuItem 
                onClick={handleCreateIssue}
                disabled={isCreatingIssue}
                className="gap-2"
              >
                <Bug className="h-4 w-4" />
                Create GitHub Issue
                {isCreatingIssue && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
              </DropdownMenuItem>
              
              {isDependencyIssue && (
                <DropdownMenuItem 
                  onClick={handleEnableDependabot}
                  disabled={isEnablingDependabot}
                  className="gap-2"
                >
                  <Wrench className="h-4 w-4" />
                  Enable Dependabot Fix
                  {isEnablingDependabot && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleOpenInGitHub} className="gap-2">
                <Github className="h-4 w-4" />
                View in GitHub
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem disabled className="gap-2 text-muted-foreground">
              <Github className="h-4 w-4" />
              No GitHub repo linked
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  // Permission error dialog
  const PermissionDialog = () => (
    <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            GitHub App Permission Required
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4 pt-4 text-left">
              <p className="text-sm text-foreground">
                To create GitHub issues, you need to update your GitHub App permissions:
              </p>
              
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>
                  Go to <strong className="text-foreground">GitHub → Settings → Developer settings → GitHub Apps → Your App</strong>
                </li>
                <li>
                  Click <strong className="text-foreground">Permissions & events</strong>
                </li>
                <li>
                  Under <strong className="text-foreground">Repository permissions</strong>, find <strong className="text-foreground">Issues</strong> and set it to <strong className="text-foreground">Read and write</strong>
                </li>
                <li>
                  Save changes
                </li>
              </ol>

              <div className="p-3 rounded-lg bg-warning/20 border border-warning/40 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">
                  <strong className="text-warning">Important:</strong> After updating permissions, you may need to re-approve the app on the repository (GitHub will prompt installations to accept the new permissions).
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                The Dependabot action works because it uses different API endpoints that don't require Issues permission.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setShowPermissionDialog(false)}>
            Close
          </Button>
          <Button 
            onClick={() => window.open('https://github.com/settings/apps', '_blank')}
            className="gap-2"
          >
            <Github className="h-4 w-4" />
            Open GitHub Apps
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <DesktopActions />
      <MobileActions />
      <PermissionDialog />
    </>
  );
}
