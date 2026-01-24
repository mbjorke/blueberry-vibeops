import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  MailCheck, 
  Clock, 
  XCircle, 
  RefreshCw, 
  Trash2, 
  Loader2,
  Send
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Invitation {
  id: string;
  email: string;
  token: string;
  invited_by: string;
  assigned_projects: string[];
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

type InvitationStatus = 'pending' | 'accepted' | 'expired';

export function InvitationsList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invitations:', error);
      toast({ variant: 'destructive', title: 'Failed to load invitations' });
    } else {
      setInvitations(data as Invitation[]);
    }
    
    setLoading(false);
  };

  const getStatus = (invitation: Invitation): InvitationStatus => {
    if (invitation.accepted_at) return 'accepted';
    if (new Date(invitation.expires_at) < new Date()) return 'expired';
    return 'pending';
  };

  const getStatusBadge = (status: InvitationStatus) => {
    switch (status) {
      case 'accepted':
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <MailCheck className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="destructive" className="bg-danger/10 text-danger border-danger/20">
            <XCircle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const handleResend = async (invitation: Invitation) => {
    if (!user) return;
    
    setActionLoading(invitation.id);

    try {
      // Delete old invitation
      await supabase
        .from('invitations')
        .delete()
        .eq('id', invitation.id);

      // Send new invitation
      const { error } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: invitation.email,
          assignedProjects: invitation.assigned_projects,
          invitedBy: user.id,
        },
      });

      if (error) throw error;

      toast({
        title: 'Invitation Resent',
        description: `A new invitation has been sent to ${invitation.email}.`,
      });

      await fetchInvitations();
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to resend invitation',
        description: error.message,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevoke = async (invitation: Invitation) => {
    setActionLoading(invitation.id);

    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitation.id);

      if (error) throw error;

      toast({
        title: 'Invitation Revoked',
        description: `The invitation for ${invitation.email} has been revoked.`,
      });

      setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
    } catch (error: any) {
      console.error('Error revoking invitation:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to revoke invitation',
        description: error.message,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = invitations.filter(inv => getStatus(inv) === 'pending').length;
  const acceptedCount = invitations.filter(inv => getStatus(inv) === 'accepted').length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Invitations
          {pendingCount > 0 && (
            <Badge variant="secondary">{pendingCount} pending</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Manage client invitations. {acceptedCount} accepted, {pendingCount} pending.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No invitations sent yet.</p>
            <p className="text-sm">Use the "Invite Client" button to send your first invitation.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invitations.map((invitation) => {
              const status = getStatus(invitation);
              const isLoading = actionLoading === invitation.id;

              return (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium truncate">{invitation.email}</span>
                      {getStatusBadge(status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Sent {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                      </span>
                      {status === 'pending' && (
                        <span>
                          Expires {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                        </span>
                      )}
                      {invitation.assigned_projects.length > 0 && (
                        <span>
                          {invitation.assigned_projects.length} project{invitation.assigned_projects.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {status !== 'accepted' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResend(invitation)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        <span className="ml-2 hidden sm:inline">Resend</span>
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke Invitation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to revoke the invitation for {invitation.email}? 
                            {status === 'pending' && ' They will no longer be able to use the invitation link.'}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRevoke(invitation)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Revoke
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
