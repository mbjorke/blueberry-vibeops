import { Github } from 'lucide-react';
import { GitHubImportSheet } from '@/components/github/GitHubImportSheet';

export function BottomActionBar() {
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
