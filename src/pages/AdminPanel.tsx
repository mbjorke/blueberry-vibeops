import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useClients } from '@/hooks/useClients';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { InviteClientDialog } from '@/components/admin/InviteClientDialog';
import { InvitationsList } from '@/components/admin/InvitationsList';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { 
  Users, 
  Building2,
  UserCog,
  Save,
  Loader2
} from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
}

interface UserRole {
  user_id: string;
  role: 'admin' | 'client' | 'superadmin';
}

interface UserWithDetails {
  profile: Profile;
  role: 'admin' | 'client' | 'superadmin';
  assignedClients: string[];
  isOrgAdmin?: boolean;
}

export default function AdminPanel() {
  const { user, loading: authLoading, isAdmin, isSuperAdmin, isOrgAdmin, currentOrganization } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clients } = useClients();
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, { role?: 'admin' | 'client' | 'superadmin'; clients?: string[] }>>({});

  useEffect(() => {
    // Allow admins, org admins, and superadmins
    if (!authLoading && (!user || (!isAdmin && !isOrgAdmin))) {
      navigate('/repositories');
    }
  }, [user, authLoading, isAdmin, isOrgAdmin, navigate]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    
    // Fetch all profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      toast({ variant: 'destructive', title: 'Error loading users' });
      setLoading(false);
      return;
    }

    // Fetch all user roles
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
    }

    // Fetch all client_users (replaces client_projects)
    const { data: clientUsersData, error: cuError } = await supabase
      .from('client_users')
      .select('user_id, client_id');

    if (cuError) {
      console.error('Error fetching client users:', cuError);
    }

    // Combine data
    const rolesMap = new Map((rolesData as UserRole[] || []).map(r => [r.user_id, r.role]));
    const clientsMap = new Map<string, string[]>();
    
    (clientUsersData || []).forEach(cu => {
      if (!clientsMap.has(cu.user_id)) {
        clientsMap.set(cu.user_id, []);
      }
      clientsMap.get(cu.user_id)!.push(cu.client_id);
    });

    const usersWithDetails: UserWithDetails[] = (profilesData as Profile[]).map(profile => ({
      profile,
      role: rolesMap.get(profile.user_id) || 'client',
      assignedClients: clientsMap.get(profile.user_id) || [],
    }));

    setUsers(usersWithDetails);
    setLoading(false);
  };

  const handleRoleChange = (userId: string, newRole: 'admin' | 'client' | 'superadmin') => {
    setPendingChanges(prev => ({
      ...prev,
      [userId]: { ...prev[userId], role: newRole },
    }));
  };

  const handleClientToggle = (userId: string, clientId: string, checked: boolean) => {
    const user = users.find(u => u.profile.user_id === userId);
    if (!user) return;

    const currentClients = pendingChanges[userId]?.clients ?? user.assignedClients;
    const newClients = checked
      ? [...currentClients, clientId]
      : currentClients.filter(c => c !== clientId);

    setPendingChanges(prev => ({
      ...prev,
      [userId]: { ...prev[userId], clients: newClients },
    }));
  };

  const saveUserChanges = async (userId: string) => {
    const changes = pendingChanges[userId];
    if (!changes) return;

    setSaving(userId);

    try {
      // Update role if changed
      if (changes.role) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({ user_id: userId, role: changes.role }, { onConflict: 'user_id,role' });

        if (roleError) throw roleError;
      }

      // Update client assignments if changed
      if (changes.clients !== undefined) {
        // Delete existing assignments
        await supabase
          .from('client_users')
          .delete()
          .eq('user_id', userId);

        // Insert new assignments
        if (changes.clients.length > 0) {
          const { error: insertError } = await supabase
            .from('client_users')
            .insert(changes.clients.map(clientId => ({ user_id: userId, client_id: clientId, role: 'viewer' })));

          if (insertError) throw insertError;
        }
      }

      toast({ title: 'Changes saved successfully' });
      
      // Clear pending changes for this user
      setPendingChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[userId];
        return newChanges;
      });

      // Refresh data
      await fetchUsers();
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({ variant: 'destructive', title: 'Failed to save changes' });
    } finally {
      setSaving(null);
    }
  };

  const getUserClients = (userId: string) => {
    const user = users.find(u => u.profile.user_id === userId);
    return pendingChanges[userId]?.clients ?? user?.assignedClients ?? [];
  };

  const getUserRole = (userId: string) => {
    const user = users.find(u => u.profile.user_id === userId);
    return pendingChanges[userId]?.role ?? user?.role ?? 'client';
  };

  const hasChanges = (userId: string) => !!pendingChanges[userId];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dashboard flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const subtitle = isSuperAdmin 
    ? "Manage all users and organizations (Platform Admin)" 
    : currentOrganization 
      ? `Manage users for ${currentOrganization.name}` 
      : "Manage user roles and client assignments";

  return (
    <AppLayout 
      title="Admin Panel" 
      subtitle={subtitle}
      actions={<InviteClientDialog />}
    >
      {/* Analytics Section */}
      <AdminAnalytics />

      {/* Users List */}
      {loading ? (
        <div className="space-y-4 mt-8">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card className="text-center py-12 mt-8">
          <CardContent className="flex flex-col items-center gap-4">
            <Users className="h-16 w-16 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
              <p className="text-muted-foreground">
                Users will appear here once they sign up.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 mt-8">
          {users.map((userItem) => (
            <Card key={userItem.profile.user_id} className={hasChanges(userItem.profile.user_id) ? 'ring-2 ring-primary' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {userItem.profile.full_name || 'Unnamed User'}
                      <Badge variant={getUserRole(userItem.profile.user_id) === 'admin' ? 'default' : 'secondary'}>
                        {getUserRole(userItem.profile.user_id)}
                      </Badge>
                      {hasChanges(userItem.profile.user_id) && (
                        <Badge variant="outline" className="text-warning border-warning">
                          Unsaved
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span>{userItem.profile.email}</span>
                      {userItem.profile.company_name && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {userItem.profile.company_name}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Button 
                    size="sm" 
                    disabled={!hasChanges(userItem.profile.user_id) || saving === userItem.profile.user_id}
                    onClick={() => saveUserChanges(userItem.profile.user_id)}
                  >
                    {saving === userItem.profile.user_id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Role Management */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <UserCog className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Role:</span>
                  </div>
                  <Select
                    value={getUserRole(userItem.profile.user_id)}
                    onValueChange={(value: 'admin' | 'client' | 'superadmin') => 
                      handleRoleChange(userItem.profile.user_id, value)
                    }
                    disabled={!isSuperAdmin && getUserRole(userItem.profile.user_id) === 'superadmin'}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      {isSuperAdmin && (
                        <SelectItem value="superadmin">Superadmin</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Client Assignments */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Assigned Clients:</span>
                  </div>
                  {clients.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No clients created yet. Create clients in the Clients management page.</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {clients.map((client) => {
                        const isAssigned = getUserClients(userItem.profile.user_id).includes(client.id);
                        return (
                          <label
                            key={client.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              isAssigned ? 'bg-primary/5 border-primary' : 'hover:bg-muted'
                            }`}
                          >
                            <Checkbox
                              checked={isAssigned}
                              onCheckedChange={(checked) =>
                                handleClientToggle(userItem.profile.user_id, client.id, !!checked)
                              }
                            />
                            <div className="flex items-center gap-2 min-w-0">
                              <div 
                                className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                                  client.logo_color?.startsWith('#') ? '' : (client.logo_color || 'bg-primary')
                                }`}
                                style={client.logo_color?.startsWith('#') ? { backgroundColor: client.logo_color } : undefined}
                              >
                                {client.logo_initial}
                              </div>
                              <span className="text-sm truncate">{client.name}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Invitations Section */}
      <div className="mt-10">
        <InvitationsList />
      </div>
    </AppLayout>
  );
}