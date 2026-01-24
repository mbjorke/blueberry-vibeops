import { useState } from 'react';
import { Trash2, X, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  selectedIds: string[];
  onSelectAll: () => void;
  onCancel: () => void;
  onComplete: () => void;
}

export function BulkActionBar({ 
  selectedCount, 
  totalCount, 
  selectedIds,
  onSelectAll, 
  onCancel,
  onComplete 
}: BulkActionBarProps) {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      // Delete related data first for each repository
      for (const repoId of selectedIds) {
        await supabase
          .from('client_repos')
          .delete()
          .eq('repo_id', repoId);

        await supabase
          .from('activity_events')
          .delete()
          .eq('project_id', repoId);
      }

      // Then delete all selected repositories
      const { error } = await supabase
        .from('repositories')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;

      toast({
        title: 'Projects removed',
        description: `${selectedCount} project${selectedCount > 1 ? 's' : ''} removed successfully.`,
      });

      onComplete();
    } catch (error) {
      console.error('Error removing projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove some projects. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
        <div className="bg-card border shadow-lg rounded-lg px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <span className="font-medium">
              {selectedCount} of {totalCount} selected
            </span>
          </div>

          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSelectAll}
            >
              {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} Project{selectedCount > 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedCount} project{selectedCount > 1 ? 's' : ''} and all associated data including activity events and client assignments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : `Delete ${selectedCount} Project${selectedCount > 1 ? 's' : ''}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
