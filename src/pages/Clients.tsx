import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  Users, 
  GitBranch, 
  Plus, 
  MoreHorizontal,
  Trash2,
  UserPlus,
  Link2,
  Link2Off,
  Mail,
  DollarSign,
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useClients, type Client } from "@/hooks/useClients";
import { useRepositories } from "@/hooks/useRepositories";
import { useToast } from "@/hooks/use-toast";
import { CreateClientDialog } from "@/components/clients/CreateClientDialog";
import { AssignRepoDialog } from "@/components/clients/AssignRepoDialog";
import { AppLayout } from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";

const Clients = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clients, isLoading, deleteClient } = useClients();
  const { unassignedRepos } = useRepositories();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [assignRepoClient, setAssignRepoClient] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleExpanded = (clientId: string) => {
    setExpandedClients(prev => {
      const next = new Set(prev);
      if (next.has(clientId)) {
        next.delete(clientId);
      } else {
        next.add(clientId);
      }
      return next;
    });
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.billing_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClient = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    try {
      await deleteClient.mutateAsync(deleteTarget.id);
      toast({
        title: "Client deleted",
        description: `${deleteTarget.name} has been removed.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const totalMRR = clients.reduce((sum, client) => sum + (client.monthly_rate || 0), 0);

  const headerActions = (
    <Button onClick={() => setShowCreateDialog(true)}>
      <Plus className="mr-2 h-4 w-4" />
      New Client
    </Button>
  );

  return (
    <AppLayout 
      title="Clients" 
      subtitle="Manage your client accounts and repository assignments"
      actions={headerActions}
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{clients.length}</div>
                  <div className="text-sm text-muted-foreground">Total Clients</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold">${totalMRR.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Monthly MRR</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <GitBranch className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{unassignedRepos.length}</div>
                  <div className="text-sm text-muted-foreground">Unassigned Repos</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {clients.reduce((sum, c) => sum + (c.user_count || 0), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Client Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Clients List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-1">No clients yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first client to start managing their projects
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Client
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredClients.map(client => (
              <ClientCard
                key={client.id}
                client={client}
                isExpanded={expandedClients.has(client.id)}
                onToggleExpand={() => toggleExpanded(client.id)}
                onAssignRepo={() => setAssignRepoClient(client)}
                onDelete={() => setDeleteTarget(client)}
              />
            ))}
          </div>
        )}

        {/* Dialogs */}
        <CreateClientDialog 
          open={showCreateDialog} 
          onOpenChange={setShowCreateDialog} 
        />
        
        <AssignRepoDialog
          client={assignRepoClient}
          open={!!assignRepoClient}
          onOpenChange={(open) => !open && setAssignRepoClient(null)}
        />

        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Client</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? 
                This will remove all repository assignments and user access. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteClient}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete Client"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
};

interface ClientCardProps {
  client: Client;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onAssignRepo: () => void;
  onDelete: () => void;
}

function ClientCard({ client, isExpanded, onToggleExpand, onAssignRepo, onDelete }: ClientCardProps) {
  const navigate = useNavigate();
  
  return (
    <Collapsible open={isExpanded}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardHeader 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={onToggleExpand}
          >
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div 
                className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0",
                  client.logo_color || "bg-primary"
                )}
                style={client.logo_color?.startsWith('#') ? { backgroundColor: client.logo_color } : undefined}
              >
                {client.logo_initial}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                  {client.industry && (
                    <Badge variant="outline" className="text-xs">
                      {client.industry}
                    </Badge>
                  )}
                </div>
                <CardDescription className="flex items-center gap-4 mt-1">
                  {client.billing_email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {client.billing_email}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <GitBranch className="h-3 w-3" />
                    {client.repo_count || 0} repos
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {client.user_count || 0} users
                  </span>
                  {client.monthly_rate && (
                    <span className="flex items-center gap-1 text-success">
                      <DollarSign className="h-3 w-3" />
                      ${client.monthly_rate}/mo
                    </span>
                  )}
                </CardDescription>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); navigate(`/clients/${client.id}`); }}
                >
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onAssignRepo(); }}
                >
                  <Link2 className="h-4 w-4 mr-1" />
                  Assign Repo
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}`)}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Full Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}`)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite User
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={onDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Client
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <ClientDetails clientId={client.id} />
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function ClientDetails({ clientId }: { clientId: string }) {
  const { repositories, isLoading } = useRepositories(clientId);
  const { unassignFromClient } = useRepositories();
  const { toast } = useToast();

  const handleUnassign = async (repoId: string, repoName: string) => {
    try {
      await unassignFromClient.mutateAsync(repoId);
      toast({
        title: "Repository unassigned",
        description: `${repoName} has been removed from this client.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to unassign repository.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <CardContent className="border-t pt-4">
        <Skeleton className="h-20 w-full" />
      </CardContent>
    );
  }

  return (
    <CardContent className="border-t pt-4">
      <h4 className="font-medium text-sm mb-3">Assigned Repositories</h4>
      {repositories.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No repositories assigned to this client yet.
        </p>
      ) : (
        <div className="space-y-2">
          {repositories.map(repo => (
            <div 
              key={repo.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">{repo.name}</div>
                  {repo.full_name && (
                    <div className="text-xs text-muted-foreground">{repo.full_name}</div>
                  )}
                </div>
                <Badge variant={repo.status === 'healthy' ? 'default' : 'destructive'} className="text-xs">
                  {repo.status}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUnassign(repo.id, repo.name)}
              >
                <Link2Off className="h-4 w-4 mr-1" />
                Unassign
              </Button>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  );
}

export default Clients;
