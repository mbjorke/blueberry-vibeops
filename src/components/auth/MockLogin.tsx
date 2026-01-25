import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockAdminUser, mockClientUser, mockSuperAdminUser } from '@/test/fixtures/users';
import { mockOrganization1 } from '@/test/fixtures/organizations';
import { TestTube, User, Shield, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function MockLogin() {
  const { signInAsMock } = useAuth();
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

  const mockUsers = [
    {
      user: mockSuperAdminUser,
      role: 'superadmin' as const,
      label: 'Super Admin',
      description: 'Platform owner with full access',
      icon: Crown,
      color: 'bg-purple-500',
    },
    {
      user: mockAdminUser,
      role: 'admin' as const,
      label: 'Admin',
      description: 'Organization administrator',
      icon: Shield,
      color: 'bg-blue-500',
    },
    {
      user: mockClientUser,
      role: 'client' as const,
      label: 'Client',
      description: 'View-only access',
      icon: User,
      color: 'bg-green-500',
    },
  ];

  return (
    <Card className="border-dashed border-2 border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <CardTitle className="text-lg">Dev Mode: Quick Login</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Click any user below to log in instantly (development only)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {mockUsers.map(({ user, role, label, description, icon: Icon, color }) => (
          <Button
            key={user.id}
            variant="outline"
            className="w-full justify-start h-auto py-3 px-4 hover:bg-orange-100 dark:hover:bg-orange-900/30"
            onClick={() => handleMockLogin(user, role)}
          >
            <div className="flex items-center gap-3 w-full">
              <div className={`${color} rounded-lg p-2 text-white`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {role}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {user.email}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {description}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
