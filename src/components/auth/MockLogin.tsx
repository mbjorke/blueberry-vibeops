import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockAdminUser, mockClientUser, mockSuperAdminUser } from '@/test/fixtures/users';
import { mockOrganization1 } from '@/test/fixtures/organizations';
import { getTestUserCredentials, TEST_USER_CREDENTIALS } from '@/test/fixtures/testUsers';
import { User, Shield, Crown, Database, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type UserType = 'mock' | 'db';

interface UserOption {
  type: UserType;
  role: 'superadmin' | 'admin' | 'client';
  label: string;
  description: string;
  email: string;
  icon: typeof Crown;
  color: string;
  mockUser?: typeof mockAdminUser;
}

export function MockLogin() {
  const { signInAsMock, signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleMockLogin = async (user: typeof mockAdminUser, role: 'admin' | 'client' | 'superadmin') => {
    // Create appropriate organizations based on role
    const orgs = role === 'superadmin' 
      ? [] // Superadmin might not have orgs, or could have all
      : [mockOrganization1];

    await signInAsMock(user, role, orgs);
    
    toast({
      title: 'Mock login successful!',
      description: `Logged in as ${user.user_metadata?.full_name || user.email} (${role})`,
    });
    
    navigate('/portal');
  };

  const handleDbLogin = async (email: string, password: string, role: 'superadmin' | 'admin' | 'client') => {
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        // Provide helpful error messages
        let errorMessage = error.message || 'Failed to sign in with test user';
        const status = (error as any)?.status;
        
        // Check for common issues
        if (status === 500 || error.message?.includes('500')) {
          errorMessage = `Server error. Test user may not exist. Run: npm run seed:test-users`;
        } else if (error.message?.includes('Invalid login credentials') || status === 400) {
          errorMessage = `Invalid credentials or user doesn't exist. Run: npm run seed:test-users`;
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = 'Email not confirmed. Check seed script output.';
        }
        
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: errorMessage,
        });
        console.error('Login error:', error);
        return;
      }
      
      toast({
        title: 'Login successful!',
        description: `Logged in as ${email} (${role}) - Real DB user`,
      });
      
      navigate('/portal');
    } catch (err) {
      console.error('Unexpected login error:', err);
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}. Check console for details.`,
      });
    }
  };

  const handleUserLogin = async (option: UserOption) => {
    if (option.type === 'mock' && option.mockUser) {
      await handleMockLogin(option.mockUser, option.role);
    } else if (option.type === 'db') {
      const credentials = getTestUserCredentials(option.role);
      await handleDbLogin(credentials.email, credentials.password, option.role);
    }
  };

  const mockUsers: UserOption[] = [
    {
      type: 'mock',
      role: 'superadmin',
      label: 'Super Admin',
      description: 'Platform owner with full access',
      email: mockSuperAdminUser.email,
      icon: Crown,
      color: 'bg-purple-500',
      mockUser: mockSuperAdminUser,
    },
    {
      type: 'mock',
      role: 'admin',
      label: 'Admin',
      description: 'Organization administrator',
      email: mockAdminUser.email,
      icon: Shield,
      color: 'bg-blue-500',
      mockUser: mockAdminUser,
    },
    {
      type: 'mock',
      role: 'client',
      label: 'Client',
      description: 'View-only access',
      email: mockClientUser.email,
      icon: User,
      color: 'bg-green-500',
      mockUser: mockClientUser,
    },
  ];

  const dbUsers: UserOption[] = [
    {
      type: 'db',
      role: 'superadmin',
      label: 'Super Admin',
      description: 'Platform owner with full access',
      email: TEST_USER_CREDENTIALS.superadmin.email,
      icon: Crown,
      color: 'bg-purple-600',
    },
    {
      type: 'db',
      role: 'admin',
      label: 'Admin',
      description: 'Organization administrator',
      email: TEST_USER_CREDENTIALS.admin.email,
      icon: Shield,
      color: 'bg-blue-600',
    },
    {
      type: 'db',
      role: 'client',
      label: 'Client',
      description: 'View-only access',
      email: TEST_USER_CREDENTIALS.client.email,
      icon: User,
      color: 'bg-green-600',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Mock Users Section */}
      <Card className="border-dashed border-2 border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <CardTitle className="text-lg">Mock Users (Instant Login)</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Click to log in instantly - no database required (fast for unit tests)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {mockUsers.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={`mock-${option.role}`}
                variant="outline"
                className="w-full justify-start h-auto py-3 px-4 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                onClick={() => handleUserLogin(option)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`${option.color} rounded-lg p-2 text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.label}</span>
                      <Badge variant="secondary" className="text-xs">
                        {option.role}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-orange-100 dark:bg-orange-900/30">
                        Mock
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {option.email}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {option.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* DB Test Users Section */}
      <Card className="border-dashed border-2 border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg">DB Test Users (Real Auth)</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Click to sign in with real database users - tests RLS policies & real auth flows
            <br />
            <span className="text-xs text-muted-foreground">
              <strong>⚠️ First create users:</strong> <code className="px-1 py-0.5 bg-muted rounded text-xs">npm run seed:test-users</code>
            </span>
            <br />
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              If login fails with 500 error, users don't exist yet!
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {dbUsers.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={`db-${option.role}`}
                variant="outline"
                className="w-full justify-start h-auto py-3 px-4 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                onClick={() => handleUserLogin(option)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`${option.color} rounded-lg p-2 text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.label}</span>
                      <Badge variant="secondary" className="text-xs">
                        {option.role}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-blue-100 dark:bg-blue-900/30">
                        DB
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {option.email}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {option.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
