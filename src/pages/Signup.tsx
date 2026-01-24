import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Loader2, Mail, Wand2, Eye, EyeOff, Copy, Check, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';

function generateStrongPassword(length = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = lowercase + uppercase + numbers + symbols;
  
  // Ensure at least one of each type
  let password = [
    lowercase[Math.floor(Math.random() * lowercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }
  
  // Shuffle the password
  return password.sort(() => Math.random() - 0.5).join('');
}

interface Invitation {
  id: string;
  email: string;
  assigned_projects: string[];
  expires_at: string;
  accepted_at: string | null;
}

export default function Signup() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [inviteLoading, setInviteLoading] = useState(!!inviteToken);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch invitation details if token present
  useEffect(() => {
    const fetchInvitation = async () => {
      if (!inviteToken) return;

      setInviteLoading(true);
      
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', inviteToken)
        .maybeSingle();

      if (error || !data) {
        setInviteError('Invalid or expired invitation link.');
        setInviteLoading(false);
        return;
      }

      const inv = data as Invitation;

      // Check if already accepted
      if (inv.accepted_at) {
        setInviteError('This invitation has already been used.');
        setInviteLoading(false);
        return;
      }

      // Check if expired
      if (new Date(inv.expires_at) < new Date()) {
        setInviteError('This invitation has expired.');
        setInviteLoading(false);
        return;
      }

      setInvitation(inv);
      setEmail(inv.email);
      setInviteLoading(false);
    };

    fetchInvitation();
  }, [inviteToken]);

  const handleGeneratePassword = () => {
    const newPassword = generateStrongPassword();
    setPassword(newPassword);
    setShowPassword(true); // Show the password so user can see/copy it
    toast({
      title: 'Strong password generated',
      description: 'Make sure to save it somewhere safe!',
    });
  };

  const handleCopyPassword = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Password copied to clipboard' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error, data } = await signUp(email, password, fullName, companyName);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Signup failed',
        description: error.message,
      });
      setLoading(false);
      return;
    }

    // If signup was via invitation, mark it as accepted and assign projects
    if (invitation && data?.user) {
      try {
        // Mark invitation as accepted
        await supabase
          .from('invitations')
          .update({ accepted_at: new Date().toISOString() })
          .eq('id', invitation.id);

        // Assign user to clients (assigned_projects now represents client IDs)
        if (invitation.assigned_projects.length > 0) {
          await supabase
            .from('client_users')
            .insert(
              invitation.assigned_projects.map(clientId => ({
                user_id: data.user!.id,
                client_id: clientId,
                role: 'viewer',
              }))
            );
        }
      } catch (err) {
        console.error('Error processing invitation:', err);
      }
    }

    toast({
      title: 'Account created!',
      description: 'You can now log in to access your portal.',
    });
    navigate('/portal');

    setLoading(false);
  };

  if (inviteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dashboard">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-dashboard">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <span className="font-bold text-2xl">VibeOps</span>
          </div>
          <CardTitle className="text-2xl font-bold">
            {invitation ? 'Accept Invitation' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {invitation ? (
              <span className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                You've been invited to join VibeOps
              </span>
            ) : (
              'Sign up to access the client portal'
            )}
          </CardDescription>
          {inviteError && (
            <Badge variant="destructive" className="mt-2">
              {inviteError}
            </Badge>
          )}
          {invitation && invitation.assigned_projects.length > 0 && (
            <div className="mt-3 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                You'll have access to {invitation.assigned_projects.length} project
                {invitation.assigned_projects.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Acme Corp"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!!invitation}
              />
              {invitation && (
                <p className="text-xs text-muted-foreground">
                  Email is pre-filled from your invitation
                </p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto py-1 px-2 text-xs gap-1"
                  onClick={handleGeneratePassword}
                >
                  <Wand2 className="h-3 w-3" />
                  Generate strong password
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pr-20"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                  {password && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleCopyPassword}
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
              <PasswordStrengthMeter password={password} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="flex gap-3 w-full">
              <Button 
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/login')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex-[2]" 
                disabled={loading || !!inviteError}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {invitation ? 'Accept & Create' : 'Create Account'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 px-4">
        <div className="max-w-md mx-auto text-center space-y-3">
          <Separator className="mb-4" />
          <p className="text-sm text-muted-foreground">
            © {currentYear} <strong>Blueberry Maybe Ab Ltd</strong>. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <span className="bg-muted px-2 py-0.5 rounded">v0.1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
