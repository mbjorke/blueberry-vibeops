import { useState } from 'react';
import { 
  Database, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  ArrowRight,
  Copy,
  Check,
  Settings2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSchemaCompare, SchemaDiff, SchemaSnapshot } from '@/hooks/useSchemaCompare';
import { SchemaCompare } from './SchemaCompare';

interface EnvironmentConfig {
  name: string;
  url: string;
  anonKey: string;
}

export function MigrationDetector() {
  const { toast } = useToast();
  const { 
    sourceSchema, 
    targetSchema, 
    diff, 
    loading, 
    error,
    fetchSourceSchema,
    fetchTargetSchema,
    compareSchemas,
    generateMigrationSQL
  } = useSchemaCompare();
  
  const [showKeys, setShowKeys] = useState(false);
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'compare' | 'sql'>('config');
  
  const [sourceConfig, setSourceConfig] = useState<EnvironmentConfig>({
    name: 'Source Database',
    url: import.meta.env.VITE_SOURCE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SOURCE_SUPABASE_ANON_KEY || '',
  });
  
  const [targetConfig, setTargetConfig] = useState<EnvironmentConfig>({
    name: 'Target Database',
    url: import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  });

  const handleFetchSchemas = async () => {
    if (!sourceConfig.url || !sourceConfig.anonKey) {
      toast({
        variant: 'destructive',
        title: 'Missing source configuration',
        description: 'Please provide Lovable Cloud URL and anon key',
      });
      return;
    }
    
    if (!targetConfig.url || !targetConfig.anonKey) {
      toast({
        variant: 'destructive',
        title: 'Missing target configuration',
        description: 'Please provide target database URL and anon key',
      });
      return;
    }

    await Promise.all([
      fetchSourceSchema(sourceConfig.url, sourceConfig.anonKey),
      fetchTargetSchema(targetConfig.url, targetConfig.anonKey),
    ]);
    
    toast({
      title: 'Schemas fetched',
      description: 'Click "Compare" to see differences',
    });
    setActiveTab('compare');
  };

  const handleCompare = () => {
    compareSchemas();
    toast({
      title: 'Comparison complete',
      description: diff ? 'Differences detected' : 'Schemas are in sync',
    });
  };

  const handleCopySQL = async () => {
    const sql = generateMigrationSQL();
    await navigator.clipboard.writeText(sql);
    setCopiedSQL(true);
    toast({ title: 'SQL copied to clipboard' });
    setTimeout(() => setCopiedSQL(false), 2000);
  };

  const getDiffSummary = (diff: SchemaDiff | null) => {
    if (!diff) return null;
    
    const totalChanges = 
      diff.newTables.length + 
      diff.removedTables.length + 
      diff.modifiedTables.length +
      diff.newPolicies.length +
      diff.removedPolicies.length;
    
    return {
      totalChanges,
      newTables: diff.newTables.length,
      removedTables: diff.removedTables.length,
      modifiedTables: diff.modifiedTables.length,
      newPolicies: diff.newPolicies.length,
      removedPolicies: diff.removedPolicies.length,
    };
  };

  const summary = getDiffSummary(diff);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Migration Detector
          </CardTitle>
        <CardDescription>
          Compare any two Supabase databases to detect schema differences and generate migration SQL.
        </CardDescription>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Error</h4>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Configure
          </TabsTrigger>
          <TabsTrigger value="compare" className="flex items-center gap-2" disabled={!sourceSchema || !targetSchema}>
            <ArrowRight className="h-4 w-4" />
            Compare
          </TabsTrigger>
          <TabsTrigger value="sql" className="flex items-center gap-2" disabled={!diff}>
            <Database className="h-4 w-4" />
            SQL Output
          </TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Source Config */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Source Database</CardTitle>
                <CardDescription>The database you're migrating FROM (e.g., cloud IDE, staging)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Supabase URL</Label>
                  <Input
                    placeholder="https://xxx.supabase.co"
                    value={sourceConfig.url}
                    onChange={(e) => setSourceConfig(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Anon Key</Label>
                  <div className="relative">
                    <Input
                      type={showKeys ? 'text' : 'password'}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={sourceConfig.anonKey}
                      onChange={(e) => setSourceConfig(prev => ({ ...prev, anonKey: e.target.value }))}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowKeys(!showKeys)}
                    >
                      {showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                {sourceSchema && (
                  <div className="flex items-center gap-2 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{sourceSchema.tables.length} tables loaded</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Target Config */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Target Database</CardTitle>
                <CardDescription>The database you're migrating TO (e.g., local, production)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Supabase URL</Label>
                  <Input
                    placeholder="http://localhost:54321"
                    value={targetConfig.url}
                    onChange={(e) => setTargetConfig(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Anon Key</Label>
                  <div className="relative">
                    <Input
                      type={showKeys ? 'text' : 'password'}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={targetConfig.anonKey}
                      onChange={(e) => setTargetConfig(prev => ({ ...prev, anonKey: e.target.value }))}
                    />
                  </div>
                </div>
                {targetSchema && (
                  <div className="flex items-center gap-2 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{targetSchema.tables.length} tables loaded</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button onClick={handleFetchSchemas} disabled={loading} size="lg">
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Fetching Schemas...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Fetch & Compare Schemas
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Compare Tab */}
        <TabsContent value="compare" className="space-y-6">
          {sourceSchema && targetSchema && (
            <>
              {/* Summary Cards */}
              {summary && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <Card className={summary.totalChanges === 0 ? 'bg-success/5 border-success/20' : 'bg-warning/5 border-warning/20'}>
                    <CardContent className="pt-6 text-center">
                      {summary.totalChanges === 0 ? (
                        <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
                      ) : (
                        <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-2" />
                      )}
                      <div className="text-2xl font-bold">{summary.totalChanges}</div>
                      <div className="text-sm text-muted-foreground">Total Changes</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-success">{summary.newTables}</div>
                      <div className="text-sm text-muted-foreground">New Tables</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-warning">{summary.modifiedTables}</div>
                      <div className="text-sm text-muted-foreground">Modified</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-destructive">{summary.removedTables}</div>
                      <div className="text-sm text-muted-foreground">Removed</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold">{summary.newPolicies + summary.removedPolicies}</div>
                      <div className="text-sm text-muted-foreground">Policy Changes</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Detailed Comparison */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Schema Comparison</h3>
                <Button onClick={handleCompare} variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Comparison
                </Button>
              </div>
              
              <SchemaCompare 
                sourceSchema={sourceSchema} 
                targetSchema={targetSchema} 
                diff={diff}
              />

              {diff && summary && summary.totalChanges > 0 && (
                <div className="flex justify-center">
                  <Button onClick={() => setActiveTab('sql')} size="lg">
                    Generate Migration SQL
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* SQL Output Tab */}
        <TabsContent value="sql" className="space-y-6">
          {diff && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Generated Migration SQL</CardTitle>
                    <CardDescription>
                      Review and run this SQL in your target database
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleCopySQL}>
                    {copiedSQL ? (
                      <>
                        <Check className="mr-2 h-4 w-4 text-success" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy SQL
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto max-h-96 overflow-y-auto">
                  <code>{generateMigrationSQL()}</code>
                </pre>
              </CardContent>
            </Card>
          )}

          <Card className="bg-warning/5 border-warning/20">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm">Before Running Migration</h4>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>Always backup your database first</li>
                    <li>Test in a staging environment before production</li>
                    <li>Review removed columns/tables carefully (commented out by default)</li>
                    <li>Verify RLS policies are correctly configured</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
