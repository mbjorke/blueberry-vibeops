import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClientDetail } from '@/hooks/useClientDetail';
import { useRepositories } from '@/hooks/useRepositories';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useToast } from '@/hooks/use-toast';
import { AssignRepoDialog } from '@/components/clients/AssignRepoDialog';
import { InviteToClientDialog } from '@/components/clients/InviteToClientDialog';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  Building2,
  Mail,
  DollarSign,
  FileText,
  Users,
  FolderGit2,
  Shield,
  ExternalLink,
  MoreHorizontal,
  UserPlus,
  Plus,
  Trash2,
  Calendar,
} from 'lucide-react';

function getSecurityBadge(score: number | null) {
  if (score === null) return <Badge variant="secondary">N/A</Badge>;
  if (score >= 90) return <Badge className="bg-success text-success-foreground">{score}%</Badge>;
  if (score >= 70) return <Badge className="bg-warning text-warning-foreground">{score}%</Badge>;
  return <Badge className="bg-danger text-danger-foreground">{score}%</Badge>;
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'healthy':
      return <Badge className="bg-success/10 text-success border-success/20">Healthy</Badge>;
    case 'warning':
      return <Badge className="bg-warning/10 text-warning border-warning/20">Warning</Badge>;
    case 'critical':
      return <Badge className="bg-danger/10 text-danger border-danger/20">Critical</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function ClientDetail() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    client, 
    users, 
    repos, 
    isLoading, 
    error, 
    removeUser, 
    unassignRepo,
    updateUserRole 
  } = useClientDetail(clientId);
  const { unassignedRepos } = useRepositories();

  const [assignRepoOpen, setAssignRepoOpen] = useState(false);
  const [inviteUserOpen, setInviteUserOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<{ id: string; name: string } | null>(null);
  const [repoToUnassign, setRepoToUnassign] = useState<{ id: string; name: string } | null>(null);

  const handleRemoveUser = async () => {
    if (!userToRemove) return;
    try {
      await removeUser.mutateAsync(userToRemove.id);
      toast({ title: 'User removed from client' });
    } catch {
      toast({ title: 'Failed to remove user', variant: 'destructive' });
    }
    setUserToRemove(null);
  };

  const handleUnassignRepo = async () => {
    if (!repoToUnassign) return;
    try {
      await unassignRepo.mutateAsync(repoToUnassign.id);
      toast({ title: 'Repository unassigned from client' });
    } catch {
      toast({ title: 'Failed to unassign repository', variant: 'destructive' });
    }
    setRepoToUnassign(null);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole.mutateAsync({ userId, role: newRole });
      toast({ title: 'User role updated' });
    } catch {
      toast({ title: 'Failed to update role', variant: 'destructive' });
    }
  };

  if (error) {
    return (
      <AppLayout title="Error" subtitle="Failed to load client">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Client</CardTitle>
            <CardDescription>{(error as Error).message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/clients')}>
              Back to Clients
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  if (isLoading || !client) {
    return (
      <AppLayout title="Loading..." subtitle="Please wait">
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title={client.name}
      subtitle={client.industry || 'Client Details'}
    >
      <div className="space-y-8">
        {/* Client Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Billing Email
                </p>
                <p className="font-medium">{client.billing_email || 'Not set'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Monthly Rate
                </p>
                <p className="font-medium">${client.monthly_rate?.toLocaleString() || 0}/mo</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <FolderGit2 className="h-4 w-4" />
                  Repositories
                </p>
                <p className="font-medium">{repos.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Team Members
                </p>
                <p className="font-medium">{users.length}</p>
              </div>
            </div>
            {client.notes && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </p>
                <p className="text-sm">{client.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Repositories Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderGit2 className="h-5 w-5" />
                Assigned Repositories
              </CardTitle>
              <CardDescription>
                Repositories assigned to this client organization
              </CardDescription>
            </div>
            <Button onClick={() => setAssignRepoOpen(true)} disabled={unassignedRepos.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Assign Repository
            </Button>
          </CardHeader>
          <CardContent>
            {repos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderGit2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No repositories assigned yet</p>
                <p className="text-sm">Assign repositories to give this client access</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Repository</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Security</TableHead>
                    <TableHead>Last Deploy</TableHead>
                    <TableHead>Environment</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repos.map((cr) => (
                    <TableRow key={cr.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium">{cr.repository?.name || 'Unknown'}</p>
                            {cr.repository?.language && (
                              <p className="text-sm text-muted-foreground">{cr.repository.language}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {cr.repository ? getStatusBadge(cr.repository.status) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          {cr.repository ? getSecurityBadge(cr.repository.security_score) : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {cr.repository?.last_deploy || 'Never'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{cr.environment || 'production'}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {cr.repository?.github_url && (
                              <DropdownMenuItem asChild>
                                <a href={cr.repository.github_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View on GitHub
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setRepoToUnassign({ 
                                id: cr.repo_id, 
                                name: cr.repository?.name || 'Unknown' 
                              })}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Unassign
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Users Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                Users who have access to this client's repositories
              </CardDescription>
            </div>
            <Button onClick={() => setInviteUserOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No team members yet</p>
                <p className="text-sm">Invite users to give them access to this client's repos</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((cu) => (
                    <TableRow key={cu.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{cu.profile?.full_name || 'Unknown User'}</p>
                          <p className="text-sm text-muted-foreground">{cu.profile?.email || 'No email'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={cu.role}
                          onValueChange={(value) => handleRoleChange(cu.user_id, value)}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(cu.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setUserToRemove({ 
                                id: cu.user_id, 
                                name: cu.profile?.full_name || cu.profile?.email || 'this user' 
                              })}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
      {client && (
        <>
          <AssignRepoDialog
            client={client}
            open={assignRepoOpen}
            onOpenChange={setAssignRepoOpen}
          />
          <InviteToClientDialog
            clientId={client.id}
            clientName={client.name}
            open={inviteUserOpen}
            onOpenChange={setInviteUserOpen}
          />
        </>
      )}

      {/* Remove User Confirmation */}
      <AlertDialog open={!!userToRemove} onOpenChange={() => setUserToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {userToRemove?.name} from this client? 
              They will lose access to all repositories assigned to this client.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unassign Repo Confirmation */}
      <AlertDialog open={!!repoToUnassign} onOpenChange={() => setRepoToUnassign(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unassign Repository</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unassign {repoToUnassign?.name} from this client? 
              Team members will lose access to this repository.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUnassignRepo}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Unassign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </AppLayout>
  );
}
