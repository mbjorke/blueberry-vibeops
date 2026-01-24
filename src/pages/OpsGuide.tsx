import { useState } from "react";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Database, 
  Shield, 
  Server, 
  GitBranch, 
  Activity,
  KeyRound,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  BookOpen,
  Wrench,
  UserPlus
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { ClientOnboardingWizard } from "@/components/onboarding/ClientOnboardingWizard";
import { ClientPricingCalculator } from "@/components/ops-guide/ClientPricingCalculator";
import { MigrationDetector } from "@/components/ops-guide/MigrationDetector";
import { 
  integrationRoadmap, 
  migrationSteps, 
  getCategoryLabel, 
  getStatusLabel,
  type IntegrationItem,
  type IntegrationStatus 
} from "@/data/integrationRoadmap";

const categoryIcons: Record<IntegrationItem['category'], React.ElementType> = {
  'database': Database,
  'auth': KeyRound,
  'hosting': Server,
  'ci-cd': GitBranch,
  'security': Shield,
  'monitoring': Activity
};

const statusConfig: Record<IntegrationStatus, { icon: React.ElementType; className: string }> = {
  'supported': { icon: CheckCircle2, className: 'text-success' },
  'manual': { icon: Wrench, className: 'text-warning' },
  'coming-soon': { icon: Clock, className: 'text-muted-foreground' },
  'not-supported': { icon: XCircle, className: 'text-destructive' }
};

const OpsGuide = () => {
  const { toast } = useToast();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const groupedIntegrations = integrationRoadmap.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, IntegrationItem[]>);

  const stats = {
    supported: integrationRoadmap.filter(i => i.status === 'supported').length,
    manual: integrationRoadmap.filter(i => i.status === 'manual').length,
    comingSoon: integrationRoadmap.filter(i => i.status === 'coming-soon').length,
    notSupported: integrationRoadmap.filter(i => i.status === 'not-supported').length,
  };

  return (
    <AppLayout 
      title="VibeOps Guide" 
      subtitle="Migration helper & integration roadmap for your team"
      actions={
        <Button onClick={() => setShowOnboardingWizard(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Onboard Client
        </Button>
      }
    >
      {/* Client Onboarding Wizard */}
      <ClientOnboardingWizard 
        open={showOnboardingWizard} 
        onOpenChange={setShowOnboardingWizard} 
      />

      <div className="space-y-8">
        {/* Disclaimer Banner */}
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <AlertTriangle className="h-6 w-6 text-warning flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Honest Positioning</h3>
                <p className="text-sm text-muted-foreground">
                  Lovable is excellent for MVPs, internal tools, and SMB applications. 
                  It is <strong>not suitable</strong> for banks, healthcare (HIPAA), or enterprises 
                  requiring SOC2/ISO compliance. For those use cases, recommend proper enterprise 
                  infrastructure from the start.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.supported}</div>
              <div className="text-sm text-muted-foreground">Fully Supported</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Wrench className="h-8 w-8 text-warning mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.manual}</div>
              <div className="text-sm text-muted-foreground">Manual Setup</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.comingSoon}</div>
              <div className="text-sm text-muted-foreground">Coming Soon</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.notSupported}</div>
              <div className="text-sm text-muted-foreground">Not Supported</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="roadmap" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="roadmap" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Integration Roadmap
            </TabsTrigger>
            <TabsTrigger value="migrations" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Migration Checklist
            </TabsTrigger>
            <TabsTrigger value="detector" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Schema Detector
            </TabsTrigger>
          </TabsList>

          {/* Integration Roadmap Tab */}
          <TabsContent value="roadmap" className="space-y-6">
            {Object.entries(groupedIntegrations).map(([category, items]) => {
              const Icon = categoryIcons[category as IntegrationItem['category']];
              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {getCategoryLabel(category as IntegrationItem['category'])}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {items.map((item) => {
                      const StatusIcon = statusConfig[item.status].icon;
                      const isExpanded = expandedItems.has(item.id);
                      const hasDetails = item.workaround || item.docsUrl;
                      
                      return (
                        <Collapsible key={item.id} open={isExpanded}>
                          <div className="border rounded-lg p-4">
                            <CollapsibleTrigger 
                              className="w-full"
                              onClick={() => hasDetails && toggleExpanded(item.id)}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                  <StatusIcon className={`h-5 w-5 mt-0.5 ${statusConfig[item.status].className}`} />
                                  <div className="text-left">
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {item.description}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant={item.status === 'supported' ? 'default' : 'outline'}
                                    className={item.status === 'not-supported' ? 'border-destructive text-destructive' : ''}
                                  >
                                    {getStatusLabel(item.status)}
                                  </Badge>
                                  {hasDetails && (
                                    isExpanded ? 
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" /> : 
                                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent>
                              <div className="mt-4 pt-4 border-t space-y-3">
                                {item.workaround && (
                                  <div className="bg-muted/50 rounded-md p-3">
                                    <div className="text-sm font-medium mb-1 flex items-center gap-2">
                                      <Wrench className="h-4 w-4" />
                                      Workaround
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {item.workaround}
                                    </p>
                                  </div>
                                )}
                                {item.docsUrl && (
                                  <Button variant="outline" size="sm" asChild>
                                    <a href={item.docsUrl} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      View Documentation
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Migration Helper Tab */}
          <TabsContent value="migrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Migration Checklist</CardTitle>
                <CardDescription>
                  Follow these steps when syncing Lovable changes to external environments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {migrationSteps.map((step, index) => {
                  const isExpanded = expandedItems.has(step.id);
                  
                  return (
                    <Collapsible key={step.id} open={isExpanded}>
                      <div className={`border rounded-lg p-4 ${
                        step.warningLevel === 'critical' ? 'border-destructive/50 bg-destructive/5' :
                        step.warningLevel === 'warning' ? 'border-warning/50 bg-warning/5' : ''
                      }`}>
                        <CollapsibleTrigger 
                          className="w-full"
                          onClick={() => toggleExpanded(step.id)}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              step.warningLevel === 'critical' ? 'bg-destructive text-destructive-foreground' :
                              step.warningLevel === 'warning' ? 'bg-warning text-warning-foreground' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-medium flex items-center gap-2">
                                {step.title}
                                {step.warningLevel === 'critical' && (
                                  <Badge variant="destructive" className="text-xs">Critical</Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {step.description}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                When: {step.applicableWhen}
                              </div>
                            </div>
                            {step.sqlTemplate && (
                              isExpanded ? 
                                <ChevronDown className="h-4 w-4 text-muted-foreground" /> : 
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </CollapsibleTrigger>
                        
                        {step.sqlTemplate && (
                          <CollapsibleContent>
                            <div className="mt-4 pt-4 border-t">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">SQL Template</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(step.sqlTemplate!, step.id)}
                                >
                                  {copiedId === step.id ? (
                                    <Check className="h-4 w-4 text-success" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto">
                                <code>{step.sqlTemplate}</code>
                              </pre>
                            </div>
                          </CollapsibleContent>
                        )}
                      </div>
                    </Collapsible>
                  );
                })}
              </CardContent>
            </Card>

            {/* Pricing Calculator */}
            <ClientPricingCalculator />

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Pro Tips for VibeOps-ers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Client Pricing</h4>
                    <p className="text-sm text-muted-foreground">
                      Charge ~$150/month per client for hosting management. Includes:
                      separate Supabase instance, Vercel deployment, monitoring, and basic support.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Environment Strategy</h4>
                    <p className="text-sm text-muted-foreground">
                      Use Lovable Cloud for development. Create separate Supabase projects 
                      for staging/production. Sync via exported migrations.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Security Checklist</h4>
                    <p className="text-sm text-muted-foreground">
                      Before going live: verify RLS policies, enable MFA for admin accounts,
                      review exposed API endpoints, and document all secrets.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">When to Say No</h4>
                    <p className="text-sm text-muted-foreground">
                      Decline projects requiring HIPAA, SOC2, or PCI compliance. 
                      Lovable isn't designed for regulated industries.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schema Detector Tab */}
          <TabsContent value="detector" className="space-y-6">
            <MigrationDetector />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default OpsGuide;