import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRepositories } from '@/hooks/useRepositories';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { GitHubImportSheet } from '@/components/github/GitHubImportSheet';
import { GitHubConnectionManager } from '@/components/github/GitHubConnectionManager';
import { ManualRepositoryAdd } from '@/components/github/ManualRepositoryAdd';
import { BottomActionBar } from '@/components/dashboard/BottomActionBar';
import { BulkActionBar } from '@/components/dashboard/BulkActionBar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  FolderGit2, 
  Building2, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  FolderOpen,
  Github
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

type FilterType = 'all' | 'assigned' | 'unassigned';

export default function Repositories() {
  const navigate = useNavigate();
  const { isAdmin, isSuperAdmin, isOrgAdmin } = useAuth();
  const { repositories, assignedRepos, isLoading, assignToClient } = useRepositories();
  
  // Can manage repos if admin, superadmin, or org admin
  const canManage = isAdmin || isSuperAdmin || isOrgAdmin;
  const { clients, isLoading: clientsLoading } = useClients();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set());

  const assignedRepoIds = new Set(assignedRepos.map(r => r.id));

  const filteredRepos = useMemo(() => {
    let result = [...repositories];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        r => r.name.toLowerCase().includes(query) || 
             (r.description?.toLowerCase() || '').includes(query)
      );
    }

    // Assignment filter (managers only)
    if (canManage) {
      if (filterType === 'assigned') {
        result = result.filter(r => assignedRepoIds.has(r.id));
      } else if (filterType === 'unassigned') {
        result = result.filter(r => !assignedRepoIds.has(r.id));
      }
    }

    return result;
  }, [repositories, searchQuery, filterType, assignedRepoIds, canManage]);

  const stats = useMemo(() => ({
    total: repositories.length,
    assigned: assignedRepoIds.size,
    unassigned: repositories.length - assignedRepoIds.size,
  }), [repositories, assignedRepoIds]);

  const getSecurityBadge = (score: number | null) => {
    if (score === null) return <Badge variant="outline">No scan</Badge>;
    if (score >= 90) return <Badge className="bg-success/10 text-success border-success/20"><CheckCircle2 className="h-3 w-3 mr-1" />{score}</Badge>;
    if (score >= 70) return <Badge className="bg-warning/10 text-warning border-warning/20"><AlertCircle className="h-3 w-3 mr-1" />{score}</Badge>;
    return <Badge className="bg-danger/10 text-danger border-danger/20"><AlertCircle className="h-3 w-3 mr-1" />{score}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-success/10 text-success border-success/20">Healthy</Badge>;
      case 'warning':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Warning</Badge>;
      case 'critical':
        return <Badge className="bg-danger/10 text-danger border-danger/20">Critical</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-danger" />;
      default:
        return null;
    }
  };

  const handleQuickAssign = async (repoId: string, clientId: string) => {
    try {
      await assignToClient.mutateAsync({ repoId, clientId });
      toast.success('Repository assigned successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign repository');
    }
  };

  const handleSelectionChange = (repoId: string, selected: boolean) => {
    setSelectedRepos(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(repoId);
      } else {
        newSet.delete(repoId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedRepos.size === filteredRepos.length) {
      setSelectedRepos(new Set());
    } else {
      setSelectedRepos(new Set(filteredRepos.map(r => r.id)));
    }
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedRepos(new Set());
  };

  const handleBulkDeleteComplete = () => {
    setSelectionMode(false);
    setSelectedRepos(new Set());
  };

  const pageTitle = canManage ? 'Repositories' : 'Your Repositories';
  const pageSubtitle = canManage 
    ? 'Manage all imported repositories' 
    : 'View the status and reports for your assigned repositories';

  // Client view - card grid layout
  if (!canManage) {
    return (
      <AppLayout title={pageTitle} subtitle={pageSubtitle}>
        <div className="space-y-6">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Repositories Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredRepos.length === 0 ? (
            <Card className="max-w-md mx-auto text-center py-12">
              <CardContent className="flex flex-col items-center gap-4">
                <FolderOpen className="h-16 w-16 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">No Repositories Found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? 'Try adjusting your search' 
                      : 'You don\'t have any repositories assigned yet. Contact your administrator to get access.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRepos.map((repo) => (
                <Card 
                  key={repo.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/project/${repo.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <GitBranch className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{repo.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            {repo.client_name ? (
                              <>
                                <Building2 className="h-3 w-3" />
                                {repo.client_name}
                              </>
                            ) : repo.language ? (
                              <span className="text-xs">{repo.language}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">Repository</span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusIcon(repo.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {repo.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {repo.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      {getStatusBadge(repo.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Security Score</span>
                      <span className="font-semibold">{repo.security_score ?? 85}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Deploy</span>
                      <span className="text-sm">
                        {repo.last_deploy && !isNaN(new Date(repo.last_deploy).getTime())
                          ? formatDistanceToNow(new Date(repo.last_deploy), { addSuffix: true })
                          : 'Never'}
                      </span>
                    </div>
                    {repo.issues && repo.issues.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-warning font-medium">
                          {repo.issues.length} issue{repo.issues.length > 1 ? 's' : ''} require attention
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  // Admin view - table layout with management features
  return (
    <AppLayout 
      title={pageTitle} 
      subtitle={pageSubtitle}
      actions={
        <div className="flex items-center gap-2">
          {canManage && (
            <GitHubConnectionManager 
              trigger={
                <Button variant="outline" size="sm">
                  <Github className="h-4 w-4 mr-2" />
                  Manage Connections
                </Button>
              }
            />
          )}
          {canManage && (
            <ManualRepositoryAdd 
              trigger={
                <Button variant="outline" size="sm">
                  <Github className="h-4 w-4 mr-2" />
                  Add Manually
                </Button>
              }
            />
          )}
          <GitHubImportSheet 
            trigger={
              <Button>
                <Github className="h-4 w-4 mr-2" />
                Import Repositories
              </Button>
            }
          />
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Repositories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FolderGit2 className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{stats.total}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Assigned to Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-success" />
                <span className="text-2xl font-bold">{stats.assigned}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unassigned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                <span className="text-2xl font-bold">{stats.unassigned}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Repositories</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
          {canManage && (
            <Button
              variant={selectionMode ? "default" : "outline"}
              onClick={() => {
                if (selectionMode) {
                  handleCancelSelection();
                } else {
                  setSelectionMode(true);
                }
              }}
            >
              {selectionMode ? "Cancel Selection" : "Select Repositories"}
            </Button>
          )}
        </div>

        {/* Repositories Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading || clientsLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredRepos.length === 0 ? (
              <div className="p-12 text-center">
                <FolderGit2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-medium">No repositories found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery ? 'Try adjusting your search' : 'Import repositories from GitHub to get started'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {selectionMode && (
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedRepos.size === filteredRepos.length && filteredRepos.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                    )}
                    <TableHead>Repository</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Security</TableHead>
                    <TableHead>Last Deploy</TableHead>
                    <TableHead>Assignment</TableHead>
                    {!selectionMode && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRepos.map((repo) => (
                    <TableRow key={repo.id}>
                      {selectionMode && (
                        <TableCell>
                          <Checkbox
                            checked={selectedRepos.has(repo.id)}
                            onCheckedChange={(checked) => handleSelectionChange(repo.id, checked === true)}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            <FolderGit2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{repo.name}</p>
                            {repo.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">{repo.description}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(repo.status)}</TableCell>
                      <TableCell>{getSecurityBadge(repo.security_score)}</TableCell>
                      <TableCell>
                        {repo.last_deploy && !isNaN(new Date(repo.last_deploy).getTime()) ? (
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(repo.last_deploy), { addSuffix: true })}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {assignedRepoIds.has(repo.id) ? (
                          <Badge variant="outline" className="bg-success/5">
                            <Building2 className="h-3 w-3 mr-1" />
                            {repo.client_name || 'Assigned'}
                          </Badge>
                        ) : (
                          <Select onValueChange={(clientId) => handleQuickAssign(repo.id, clientId)}>
                            <SelectTrigger className="w-[140px] h-8">
                              <SelectValue placeholder="Assign to..." />
                            </SelectTrigger>
                            <SelectContent>
                              {clients.map((client) => (
                                <SelectItem key={client.id} value={client.id}>
                                  {client.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      {!selectionMode && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {repo.github_url && (
                              <Button variant="ghost" size="icon" asChild>
                                <a href={repo.github_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/project/${repo.id}`)}>
                              View Details
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Bottom Action Bar - Import repositories */}
        {canManage && !selectionMode && <BottomActionBar />}
      </div>

      {/* Bulk Action Bar */}
      {selectionMode && canManage && (
        <BulkActionBar
          selectedCount={selectedRepos.size}
          totalCount={filteredRepos.length}
          selectedIds={Array.from(selectedRepos)}
          onSelectAll={handleSelectAll}
          onCancel={handleCancelSelection}
          onComplete={handleBulkDeleteComplete}
        />
      )}
    </AppLayout>
  );
}