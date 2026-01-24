import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Mail, 
  UserCheck, 
  Clock,
  BarChart3
} from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

interface AnalyticsData {
  totalUsers: number;
  totalInvitations: number;
  acceptedInvitations: number;
  pendingInvitations: number;
  expiredInvitations: number;
  conversionRate: number;
  recentSignups: { date: string; count: number }[];
  usersByRole: { role: string; count: number }[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

export function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);

    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('created_at');

      if (profilesError) throw profilesError;

      // Fetch all invitations
      const { data: invitations, error: invitationsError } = await supabase
        .from('invitations')
        .select('accepted_at, expires_at, created_at');

      if (invitationsError) throw invitationsError;

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role');

      if (rolesError) throw rolesError;

      const now = new Date();

      // Calculate invitation stats
      const accepted = invitations?.filter(inv => inv.accepted_at) || [];
      const pending = invitations?.filter(inv => 
        !inv.accepted_at && new Date(inv.expires_at) > now
      ) || [];
      const expired = invitations?.filter(inv => 
        !inv.accepted_at && new Date(inv.expires_at) <= now
      ) || [];

      // Calculate signups by day (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = startOfDay(subDays(now, 6 - i));
        return {
          date: format(date, 'MMM dd'),
          timestamp: date.getTime(),
          count: 0,
        };
      });

      profiles?.forEach(profile => {
        const profileDate = startOfDay(new Date(profile.created_at)).getTime();
        const dayEntry = last7Days.find(d => d.timestamp === profileDate);
        if (dayEntry) {
          dayEntry.count++;
        }
      });

      // Count users by role
      const roleCounts = roles?.reduce((acc, { role }) => {
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const usersByRole = Object.entries(roleCounts).map(([role, count]) => ({
        role: role.charAt(0).toUpperCase() + role.slice(1),
        count,
      }));

      setData({
        totalUsers: profiles?.length || 0,
        totalInvitations: invitations?.length || 0,
        acceptedInvitations: accepted.length,
        pendingInvitations: pending.length,
        expiredInvitations: expired.length,
        conversionRate: invitations?.length 
          ? Math.round((accepted.length / invitations.length) * 100) 
          : 0,
        recentSignups: last7Days.map(({ date, count }) => ({ date, count })),
        usersByRole,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const invitationPieData = [
    { name: 'Accepted', value: data.acceptedInvitations },
    { name: 'Pending', value: data.pendingInvitations },
    { name: 'Expired', value: data.expiredInvitations },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Invitations Sent
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalInvitations}</div>
            <p className="text-xs text-muted-foreground">
              {data.pendingInvitations} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Invites → Signups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Clients
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.usersByRole.find(r => r.role === 'Client')?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              With portal access
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signups Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Signups
            </CardTitle>
            <CardDescription>User registrations over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.recentSignups}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    name="Signups"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Invitation Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Invitation Status
            </CardTitle>
            <CardDescription>Breakdown of invitation outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {invitationPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={invitationPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => 
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {invitationPieData.map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No invitations sent yet</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
