import { useState } from "react";
import { GitBranch, Search, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRepositories } from "@/hooks/useRepositories";
import { useToast } from "@/hooks/use-toast";
import { type Client } from "@/hooks/useClients";
import { cn } from "@/lib/utils";

interface AssignRepoDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignRepoDialog({ client, open, onOpenChange }: AssignRepoDialogProps) {
  const { toast } = useToast();
  const { unassignedRepos, isLoading, assignToClient } = useRepositories();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set());
  const [isAssigning, setIsAssigning] = useState(false);

  const filteredRepos = unassignedRepos.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleRepo = (repoId: string) => {
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

  const handleAssign = async () => {
    if (!client || selectedRepos.size === 0) return;

    setIsAssigning(true);
    try {
      for (const repoId of selectedRepos) {
        await assignToClient.mutateAsync({ repoId, clientId: client.id });
      }

      toast({
        title: "Repositories assigned",
        description: `${selectedRepos.size} repo(s) assigned to ${client.name}.`,
      });

      setSelectedRepos(new Set());
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign some repositories.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleClose = () => {
    setSelectedRepos(new Set());
    setSearchQuery("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Repositories</DialogTitle>
          <DialogDescription>
            Select repositories to assign to <strong>{client?.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[300px] border rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredRepos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <GitBranch className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No matching repositories" : "No unassigned repositories"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Import more repos from GitHub first
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredRepos.map(repo => {
                  const isSelected = selectedRepos.has(repo.id);
                  return (
                    <button
                      key={repo.id}
                      onClick={() => toggleRepo(repo.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                        isSelected 
                          ? "bg-primary/10 border border-primary" 
                          : "hover:bg-muted border border-transparent"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded border flex items-center justify-center flex-shrink-0",
                        isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                      )}>
                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <GitBranch className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{repo.name}</div>
                        {repo.full_name && (
                          <div className="text-xs text-muted-foreground truncate">
                            {repo.full_name}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {repo.language && (
                          <Badge variant="outline" className="text-xs">
                            {repo.language}
                          </Badge>
                        )}
                        <Badge 
                          variant={repo.status === 'healthy' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {repo.status}
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {selectedRepos.size > 0 && (
            <p className="text-sm text-muted-foreground">
              {selectedRepos.size} repository{selectedRepos.size > 1 ? "ies" : ""} selected
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={selectedRepos.size === 0 || isAssigning}
          >
            {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign {selectedRepos.size > 0 ? `(${selectedRepos.size})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
