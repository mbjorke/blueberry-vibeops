import { Github } from 'lucide-react';
import { GitHubImportSheet } from '@/components/github/GitHubImportSheet';
import { useAuth } from '@/hooks/useAuth';

export function BottomActionBar() {
  const { isAdmin, isOrgAdmin, loading } = useAuth();

  // Show import button for admins or org admins
  // Show while loading to avoid flicker - permission check happens inside GitHubImportSheet
  if (!loading && !isAdmin && !isOrgAdmin) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg border p-6 text-center">
      <GitHubImportSheet />
      <p className="text-sm text-muted-foreground mt-3 flex items-center justify-center gap-2">
        <Github className="h-4 w-4" />
        Import repositories from GitHub
      </p>
    </div>
  );
}
