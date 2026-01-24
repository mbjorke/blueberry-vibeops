import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { supabase } from '@/integrations/supabase/client';
import { projects, Project } from '@/data/projects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { 
  Shield, 
  LogOut, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  FolderOpen,
  User,
  Settings,
  HelpCircle
} from 'lucide-react';

interface ClientProject {
  id: string;
  project_id: string;
}

export default function ClientPortal() {
  const { user, signOut, loading: authLoading, isAdmin } = useAuth();
  const { showTour, initialStep, completeOnboarding, loading: onboardingLoading } = useOnboarding();
  const navigate = useNavigate();
  const [clientProjects, setClientProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchClientProjects = async () => {
      if (!user) return;

      // Admins see all projects
      if (isAdmin) {
        setClientProjects(projects);
        setLoading(false);
        return;
      }

      // Clients only see assigned projects
      const { data, error } = await supabase
        .from('client_projects')
        .select('project_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching client projects:', error);
        setLoading(false);
        return;
      }

      const assignedProjectIds = (data as ClientProject[]).map(cp => cp.project_id);
      const filteredProjects = projects.filter(p => assignedProjectIds.includes(p.id));
      setClientProjects(filteredProjects);
      setLoading(false);
    };

    if (user) {
      fetchClientProjects();
    }
  }, [user, isAdmin]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      healthy: 'default',
      warning: 'secondary',
      critical: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'default'} className="capitalize">
        {status}
      </Badge>
    );
  };

  if (authLoading || onboardingLoading) {
    return (
      <div className="min-h-screen bg-dashboard flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dashboard">
      {/* Onboarding Tour */}
      {showTour && (
        <OnboardingTour onComplete={completeOnboarding} initialStep={initialStep} />
      )}

      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">VibeOps</span>
            <Badge variant="outline" className="ml-2">Client Portal</Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user?.email}</span>
              {isAdmin && <Badge className="bg-primary">Admin</Badge>}
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate('/help')}>
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/preferences')}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Your Portal</h1>
          <p className="text-muted-foreground">
            View the status and reports for your assigned projects.
          </p>
        </div>

        {/* Projects Grid */}
        {loading ? (
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
        ) : clientProjects.length === 0 ? (
          <Card className="max-w-md mx-auto text-center py-12">
            <CardContent className="flex flex-col items-center gap-4">
              <FolderOpen className="h-16 w-16 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold mb-2">No Projects Assigned</h3>
                <p className="text-muted-foreground">
                  You don't have any projects assigned yet. Contact your administrator to get access.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientProjects.map((project) => (
              <Card 
                key={project.id} 
                className={`project-card project-card-${project.status}`}
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${project.logoColor} flex items-center justify-center text-white font-bold`}>
                        {project.logoInitial}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {project.industry}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusIcon(project.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    {getStatusBadge(project.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Security Score</span>
                    <span className="font-semibold">{project.securityScore}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">GDPR</span>
                    <Badge variant={project.gdprCompliant ? 'default' : 'destructive'}>
                      {project.gdprCompliant ? 'Compliant' : 'Review Needed'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Deploy</span>
                    <span className="text-sm">{project.lastDeploy}</span>
                  </div>
                  {project.issues.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-warning font-medium">
                        {project.issues.length} issue{project.issues.length > 1 ? 's' : ''} require attention
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
