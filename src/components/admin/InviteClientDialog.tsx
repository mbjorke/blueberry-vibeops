import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useClients } from '@/hooks/useClients';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Loader2, Mail, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function InviteClientDialog() {
  const { user, currentOrganization, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const { clients, isLoading: clientsLoading } = useClients();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const handleClientToggle = (clientId: string, checked: boolean) => {
    if (checked) {
      setSelectedClients([...selectedClients, clientId]);
    } else {
      setSelectedClients(selectedClients.filter(id => id !== clientId));
    }
  };

  const handleInvite = async () => {
    if (!email || !user) return;

    // Require organization context for non-superadmins
    if (!isSuperAdmin && !currentOrganization) {
      toast({
        title: 'No Organization',
        description: 'You must belong to an organization to send invitations.',
        variant: 'destructive',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);

    try {
      const { error } = await supabase.functions.invoke('send-invitation', {
        body: {
          email,
          assignedProjects: selectedClients, // Client IDs for backward compatibility
          invitedBy: user.id,
          organizationId: currentOrganization?.id, // New: org-scoped invitation
        },
      });

      if (error) throw error;

      toast({
        title: 'Invitation Sent',
        description: `An invitation has been sent to ${email}.`,
      });

      setOpen(false);
      setEmail('');
      setSelectedClients([]);
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send invitation.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite New Client User</DialogTitle>
          <DialogDescription>
            Send an invitation email to a new user with pre-assigned client access.
            {currentOrganization && (
              <span className="block mt-1 text-primary font-medium">
                Inviting to: {currentOrganization.name}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        {!currentOrganization && !isSuperAdmin && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must belong to an organization to send invitations.
            </AlertDescription>
          </Alert>
        )}
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Assign to Clients</Label>
            <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
              {clientsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : clients.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No clients yet. Create clients first.
                </p>
              ) : (
                clients.map((client) => (
                  <div key={client.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={client.id}
                      checked={selectedClients.includes(client.id)}
                      onCheckedChange={(checked) => 
                        handleClientToggle(client.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={client.id}
                      className="flex items-center gap-2 text-sm cursor-pointer flex-1"
                    >
                      <div 
                        className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold ${
                          client.logo_color?.startsWith('#') ? '' : (client.logo_color || 'bg-primary')
                        }`}
                        style={client.logo_color?.startsWith('#') ? { backgroundColor: client.logo_color } : undefined}
                      >
                        {client.logo_initial}
                      </div>
                      <span>{client.name}</span>
                    </label>
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedClients.length} client{selectedClients.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={!email || sending}>
            {sending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
