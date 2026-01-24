import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowRight, 
  ArrowLeft,
  X,
  User,
  Building2,
  Database,
  Rocket,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  Loader2,
  Github
} from 'lucide-react';

type WizardStep = 'client-info' | 'project-setup' | 'github-access' | 'environment-config' | 'review' | 'complete';

interface ClientData {
  name: string;
  email: string;
  company: string;
}

interface ProjectData {
  name: string;
  description: string;
  industry: string;
  logoInitial: string;
  logoColor: string;
}

interface EnvironmentConfig {
  supabaseSetup: boolean;
  vercelSetup: boolean;
  customDomain: string;
  monthlyPrice: number;
  githubAppInstalled: boolean;
}

interface ClientOnboardingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS: { id: WizardStep; label: string; icon: React.ElementType }[] = [
  { id: 'client-info', label: 'Client Info', icon: User },
  { id: 'project-setup', label: 'Project Setup', icon: Building2 },
  { id: 'github-access', label: 'GitHub', icon: Github },
  { id: 'environment-config', label: 'Environment', icon: Database },
  { id: 'review', label: 'Review', icon: Rocket },
  { id: 'complete', label: 'Complete', icon: CheckCircle2 },
];

const INDUSTRIES = [
  'SaaS',
  'E-commerce',
  'Healthcare',
  'Finance',
  'Education',
  'Real Estate',
  'Media',
  'Non-profit',
  'Other'
];

const LOGO_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#8B5CF6', // purple
  '#F59E0B', // amber
  '#EF4444', // red
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
];

export function ClientOnboardingWizard({ open, onOpenChange }: ClientOnboardingWizardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<WizardStep>('client-info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  
  const [clientData, setClientData] = useState<ClientData>({
    name: '',
    email: '',
    company: '',
  });
  
  const [projectData, setProjectData] = useState<ProjectData>({
    name: '',
    description: '',
    industry: '',
    logoInitial: '',
    logoColor: LOGO_COLORS[0],
  });
  
  const [envConfig, setEnvConfig] = useState<EnvironmentConfig>({
    supabaseSetup: false,
    vercelSetup: false,
    customDomain: '',
    monthlyPrice: 150,
    githubAppInstalled: false,
  });

  const GITHUB_APP_INSTALL_URL = 'https://github.com/apps/blueberry-ops/installations/new';

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleNext = () => {
    const stepOrder: WizardStep[] = ['client-info', 'project-setup', 'github-access', 'environment-config', 'review', 'complete'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const stepOrder: WizardStep[] = ['client-info', 'project-setup', 'github-access', 'environment-config', 'review', 'complete'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 'client-info':
        return clientData.name.trim() !== '' && clientData.email.trim() !== '';
      case 'project-setup':
        return projectData.name.trim() !== '' && projectData.industry !== '';
      case 'github-access':
        return true; // Optional step
      case 'environment-config':
        return true; // Optional step
      case 'review':
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Create the client
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: clientData.company || clientData.name,
          billing_email: clientData.email,
          industry: projectData.industry,
          logo_initial: projectData.logoInitial || projectData.name.charAt(0).toUpperCase(),
          logo_color: projectData.logoColor,
          monthly_rate: envConfig.monthlyPrice,
          notes: projectData.description || `Client for ${clientData.name}`,
          created_by: user.id,
        })
        .select()
        .single();

      if (clientError) throw clientError;

      setCreatedProjectId(client.id);

      // Send invitation to client
      const { error: inviteError } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: clientData.email,
          invitedBy: user.id,
          assignedProjects: [client.id], // Now represents client access
        },
      });

      if (inviteError) {
        console.error('Error sending invitation:', inviteError);
        toast({
          title: "Client created",
          description: "Client was created but invitation email failed to send.",
          variant: "destructive",
        });
      }

      setCurrentStep('complete');
      
      toast({
        title: "Client onboarded successfully!",
        description: `${clientData.company || clientData.name} has been created and ${clientData.email} has been invited.`,
      });
    } catch (error) {
      console.error('Error onboarding client:', error);
      toast({
        title: "Error",
        description: "Failed to onboard client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset state
    setCurrentStep('client-info');
    setClientData({ name: '', email: '', company: '' });
    setProjectData({ name: '', description: '', industry: '', logoInitial: '', logoColor: LOGO_COLORS[0] });
    setEnvConfig({ supabaseSetup: false, vercelSetup: false, customDomain: '', monthlyPrice: 150, githubAppInstalled: false });
    setCreatedProjectId(null);
    onOpenChange(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'client-info':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Client Name *</Label>
              <Input
                id="client-name"
                placeholder="John Doe"
                value={clientData.name}
                onChange={(e) => setClientData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-email">Client Email *</Label>
              <Input
                id="client-email"
                type="email"
                placeholder="client@example.com"
                value={clientData.email}
                onChange={(e) => setClientData(prev => ({ ...prev, email: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                An invitation will be sent to this email after setup.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-company">Company Name</Label>
              <Input
                id="client-company"
                placeholder="Acme Inc."
                value={clientData.company}
                onChange={(e) => setClientData(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>
          </div>
        );

      case 'project-setup':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                placeholder="My Awesome App"
                value={projectData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setProjectData(prev => ({ 
                    ...prev, 
                    name,
                    logoInitial: name.charAt(0).toUpperCase()
                  }));
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-industry">Industry *</Label>
              <Select
                value={projectData.industry}
                onValueChange={(value) => setProjectData(prev => ({ ...prev, industry: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map(industry => (
                    <SelectItem key={industry} value={industry.toLowerCase()}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                placeholder="Brief description of the project..."
                value={projectData.description}
                onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Project Logo</Label>
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold text-white"
                  style={{ backgroundColor: projectData.logoColor }}
                >
                  {projectData.logoInitial || '?'}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {LOGO_COLORS.map(color => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        projectData.logoColor === color ? 'border-foreground scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setProjectData(prev => ({ ...prev, logoColor: color }))}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'github-access':
        return (
          <div className="space-y-6">
            <div className="bg-muted/50 border rounded-lg p-4">
              <div className="flex gap-3">
                <Github className="h-5 w-5 text-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Connect Client's GitHub</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    To monitor your client's repositories, they need to install our GitHub App on their account or organization.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Installation Link</Label>
                <p className="text-sm text-muted-foreground">
                  Share this link with your client to grant access to their repositories:
                </p>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={GITHUB_APP_INSTALL_URL}
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(GITHUB_APP_INSTALL_URL, 'github-url')}
                  >
                    {copiedField === 'github-url' ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium">Client Instructions</h4>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Click the installation link above</li>
                  <li>Select the GitHub account or organization</li>
                  <li>Choose which repositories to grant access to</li>
                  <li>Confirm the installation</li>
                </ol>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={GITHUB_APP_INSTALL_URL} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Installation Page
                  </a>
                </Button>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Checkbox
                  id="github-installed"
                  checked={envConfig.githubAppInstalled}
                  onCheckedChange={(checked) => 
                    setEnvConfig(prev => ({ ...prev, githubAppInstalled: checked === true }))
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="github-installed" className="cursor-pointer">
                    Client has installed the GitHub App
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Check this once the client confirms installation
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'environment-config':
        return (
          <div className="space-y-6">
            <div className="bg-warning/10 border border-warning/50 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Manual Setup Required</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    For production clients, create separate Supabase and Vercel projects manually. 
                    Track the setup status below for your records.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Checkbox
                  id="supabase-setup"
                  checked={envConfig.supabaseSetup}
                  onCheckedChange={(checked) => 
                    setEnvConfig(prev => ({ ...prev, supabaseSetup: checked === true }))
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="supabase-setup" className="cursor-pointer">
                    Supabase Instance Created
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Create at supabase.com/dashboard
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Checkbox
                  id="vercel-setup"
                  checked={envConfig.vercelSetup}
                  onCheckedChange={(checked) => 
                    setEnvConfig(prev => ({ ...prev, vercelSetup: checked === true }))
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="vercel-setup" className="cursor-pointer">
                    Vercel Deployment Configured
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Deploy at vercel.com/new
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-domain">Custom Domain (optional)</Label>
              <Input
                id="custom-domain"
                placeholder="app.clientdomain.com"
                value={envConfig.customDomain}
                onChange={(e) => setEnvConfig(prev => ({ ...prev, customDomain: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly-price">Monthly Hosting Price ($)</Label>
              <Input
                id="monthly-price"
                type="number"
                min={0}
                value={envConfig.monthlyPrice}
                onChange={(e) => setEnvConfig(prev => ({ ...prev, monthlyPrice: Number(e.target.value) }))}
              />
              <p className="text-xs text-muted-foreground">
                Recommended: $150/month for managed hosting
              </p>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span>{clientData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{clientData.email}</span>
                </div>
                {clientData.company && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Company</span>
                    <span>{clientData.company}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Project Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Project</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: projectData.logoColor }}
                    >
                      {projectData.logoInitial}
                    </div>
                    <span>{projectData.name}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Industry</span>
                  <Badge variant="outline">{projectData.industry}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Environment Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GitHub App</span>
                  <Badge variant={envConfig.githubAppInstalled ? 'default' : 'outline'}>
                    {envConfig.githubAppInstalled ? 'Installed' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Supabase</span>
                  <Badge variant={envConfig.supabaseSetup ? 'default' : 'outline'}>
                    {envConfig.supabaseSetup ? 'Ready' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vercel</span>
                  <Badge variant={envConfig.vercelSetup ? 'default' : 'outline'}>
                    {envConfig.vercelSetup ? 'Ready' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Price</span>
                  <span className="font-medium">${envConfig.monthlyPrice}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Client Onboarded!</h3>
              <p className="text-muted-foreground mt-2">
                {projectData.name} has been created and an invitation has been sent to {clientData.email}.
              </p>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {!envConfig.githubAppInstalled && (
                  <div className="flex items-center gap-2 text-warning">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Client needs to install GitHub App</span>
                  </div>
                )}
                {!envConfig.supabaseSetup && (
                  <div className="flex items-center gap-2 text-warning">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Set up Supabase instance</span>
                  </div>
                )}
                {!envConfig.vercelSetup && (
                  <div className="flex items-center gap-2 text-warning">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Configure Vercel deployment</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <span>Client will receive email invitation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <span>Add security scan when ready</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              {createdProjectId && (
                <Button onClick={() => {
                  handleClose();
                  navigate(`/project/${createdProjectId}`);
                }}>
                  View Project
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Onboard New Client</SheetTitle>
          <SheetDescription>
            Set up a new client with their project, environment, and dashboard access.
          </SheetDescription>
        </SheetHeader>

        {currentStep !== 'complete' && (
          <div className="mt-6">
            {/* Progress bar */}
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStepIndex + 1} of {STEPS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />

            {/* Step indicators */}
            <div className="flex justify-between mt-4">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;
                
                return (
                  <div key={step.id} className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isActive ? 'bg-primary text-primary-foreground' :
                      isCompleted ? 'bg-primary/20 text-primary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={`text-xs ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8">
          {renderStepContent()}
        </div>

        {currentStep !== 'complete' && (
          <div className="flex justify-between mt-8 pt-4 border-t">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            {currentStep === 'review' ? (
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Client
                    <Rocket className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={!validateCurrentStep()}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
